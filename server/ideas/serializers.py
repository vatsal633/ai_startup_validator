from rest_framework import serializers
from .models import Idea, IdeaReport


class IdeaCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Idea
        fields = [
            "id", "title", "idea", "industry", "problem", "solution", "target_customer",
            "differentiator", "country", "business_model", "stage",
            "funding_requirement", "competitors",
        ]
        read_only_fields = ["id"]


class IdeaReportSerializer(serializers.ModelSerializer):
    market_size = serializers.SerializerMethodField()

    class Meta:
        model = IdeaReport
        fields = [
            "executive_summary", "problem_validation", "solution_evaluation",
            "target_customer_analysis", "market_size", "competitor_analysis",
            "competitive_advantage", "business_model_analysis", "revenue_potential",
            "market_trends", "risk_analysis", "funding_recommendation",
            "customer_segments", "go_to_market_strategy", "ai_validation_score",
            "recommendations",
        ]

    def get_market_size(self, obj):
        return {"tam": obj.tam, "sam": obj.sam, "som": obj.som}


class IdeaTeaserSerializer(serializers.ModelSerializer):
    """Public-facing list view — no full report details."""
    founder_name = serializers.SerializerMethodField()
    ai_validation_score = serializers.SerializerMethodField()

    class Meta:
        model = Idea
        fields = ["id", "title", "idea", "industry", "country", "stage",
                  "business_model", "funding_requirement", "status",
                  "founder_name", "ai_validation_score", "created_at"]

    def get_founder_name(self, obj):
        return f"{obj.founder.first_name} {obj.founder.last_name}".strip()

    def get_ai_validation_score(self, obj):
        report = getattr(obj, "report", None)
        return report.ai_validation_score if report else None


class IdeaDetailSerializer(serializers.ModelSerializer):
    report = IdeaReportSerializer(read_only=True)

    class Meta:
        model = Idea
        fields = [
            "id", "title", "idea", "industry", "problem", "solution", "target_customer",
            "differentiator", "country", "business_model", "stage",
            "funding_requirement", "competitors", "status", "published_at",
            "created_at", "report",
        ]


class MyIdeaSerializer(serializers.ModelSerializer):
    # these three come from annotations in MyIdeasView
    ai_validation_score = serializers.FloatField(read_only=True)
    view_count = serializers.IntegerField(read_only=True)
    request_count = serializers.IntegerField(read_only=True)
    short_description = serializers.SerializerMethodField()

    class Meta:
        model = Idea
        fields = [
            "id", "title", "short_description", "industry", "stage",
            "funding_requirement", "status", "ai_validation_score",
            "view_count", "request_count", "published_at", "created_at",
        ]

    def get_short_description(self, obj):
        text = obj.idea or ""
        return text if len(text) <= 120 else text[:117].rstrip() + "..."