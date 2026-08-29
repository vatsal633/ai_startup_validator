import json
from google import genai
from django.conf import settings

client = genai.Client(api_key=settings.GEMINI_API_KEY)

REPORT_SCHEMA_INSTRUCTIONS = """
You are a startup analyst AI. Given the startup idea details below, produce a structured
validation report. Respond with ONLY valid JSON (no markdown, no code fences, no extra text)
matching exactly this structure:

{
  "executive_summary": "string",
  "problem_validation": "string",
  "solution_evaluation": "string",
  "target_customer_analysis": "string",
  "market_size": {
    "tam": "string",
    "sam": "string",
    "som": "string"
  },
  "competitor_analysis": "string",
  "competitive_advantage": "string",
  "business_model_analysis": "string",
  "revenue_potential": "string",
  "market_trends": "string",
  "risk_analysis": "string",
  "funding_recommendation": "string",
  "customer_segments": "string",
  "go_to_market_strategy": "string",
  "ai_validation_score": 0,
  "recommendations": "string"
}

"ai_validation_score" must be a number from 0 to 100 reflecting overall viability, based on
market size, competition, clarity of differentiation, and funding-ask reasonableness.
Be honest and specific — reference the actual details given, don't produce generic filler.
"""


def build_prompt(idea: "Idea") -> str:
    return f"""{REPORT_SCHEMA_INSTRUCTIONS}

STARTUP DETAILS:
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


def generate_report(idea: "Idea") -> dict:
    prompt = build_prompt(idea)

    interaction = client.interactions.create(
        model="gemini-3.6-flash",
        input=prompt,
    )
    text = interaction.output_text.strip()

    # Gemini sometimes wraps JSON in markdown fences despite instructions — strip defensively
    if text.startswith("```"):
        text = text.strip("`")
        if text.startswith("json"):
            text = text[4:]
        text = text.strip()

    return json.loads(text)