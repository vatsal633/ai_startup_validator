import json
import logging

from django.conf import settings
from google import genai

logger = logging.getLogger(__name__)

client = genai.Client(api_key=settings.GEMINI_API_KEY)

MODEL = "gemini-3.6-flash"

REPORT_SCHEMA_INSTRUCTIONS = """
You are a startup analyst AI. Given the startup idea details below, produce a structured
validation report matching the required JSON schema.

"ai_validation_score" must be a number from 0 to 100 reflecting overall viability, based on
market size, competition, clarity of differentiation, and funding-ask reasonableness.
Be honest and specific — reference the actual details given, don't produce generic filler.
"""

# Enforced server-side by response_json_schema, so the model cannot return prose,
# markdown fences, or a different shape.
REPORT_JSON_SCHEMA = {
    "type": "object",
    "properties": {
        "executive_summary": {"type": "string"},
        "problem_validation": {"type": "string"},
        "solution_evaluation": {"type": "string"},
        "target_customer_analysis": {"type": "string"},
        "market_size": {
            "type": "object",
            "properties": {
                "tam": {"type": "string"},
                "sam": {"type": "string"},
                "som": {"type": "string"},
            },
            "required": ["tam", "sam", "som"],
        },
        "competitor_analysis": {"type": "string"},
        "competitive_advantage": {"type": "string"},
        "business_model_analysis": {"type": "string"},
        "revenue_potential": {"type": "string"},
        "market_trends": {"type": "string"},
        "risk_analysis": {"type": "string"},
        "funding_recommendation": {"type": "string"},
        "customer_segments": {"type": "string"},
        "go_to_market_strategy": {"type": "string"},
        "ai_validation_score": {"type": "number", "minimum": 0, "maximum": 100},
        "recommendations": {"type": "string"},
    },
    "required": [
        "executive_summary", "problem_validation", "solution_evaluation",
        "target_customer_analysis", "market_size", "competitor_analysis",
        "competitive_advantage", "business_model_analysis", "revenue_potential",
        "market_trends", "risk_analysis", "funding_recommendation",
        "customer_segments", "go_to_market_strategy", "ai_validation_score",
        "recommendations",
    ],
}


def build_prompt(idea) -> str:
    return f"""{REPORT_SCHEMA_INSTRUCTIONS}

STARTUP DETAILS:
Title: {idea.title}
Idea: {idea.idea}
Industry: {idea.industry}
Problem: {idea.problem}
Solution: {idea.solution}
Target customer: {idea.target_customer}
Differentiator: {idea.differentiator}
Country: {idea.country}
Business model: {idea.get_business_model_display()}
Stage: {idea.get_stage_display()}
Funding requirement: ₹{idea.funding_requirement}
Competitors: {idea.competitors or "Not specified"}
"""


def generate_report(idea) -> dict:
    """Ask Gemini for a structured validation report.

    Raises on an API error or an unparseable response, so the caller can mark
    the idea failed rather than storing a half-built report."""
    interaction = client.interactions.create(
        model=MODEL,
        input=build_prompt(idea),
        response_format={
            "type": "text",
            "mime_type": "application/json",
            "schema": REPORT_JSON_SCHEMA,
        },
    )

    text = (interaction.output_text or "").strip()
    if not text:
        raise ValueError("Gemini returned an empty response")

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        logger.error("Gemini returned non-JSON for idea %s: %r", idea.id, text[:500])
        raise
