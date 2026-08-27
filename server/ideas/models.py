from django.conf import settings
from django.db import models


class Idea(models.Model):
    class BusinessModel(models.TextChoices):
        SUBSCRIPTION = "subscription", "Subscription"
        COMMISSION = "commission", "Commission"
        ONE_TIME = "one_time", "One-time purchase"
        FREEMIUM = "freemium", "Freemium"
        ADVERTISING = "advertising", "Advertising"
        OTHER = "other", "Other"

    class Stage(models.TextChoices):
        IDEA = "idea", "Just an idea"
        PROTOTYPE = "prototype", "Prototype"
        MVP = "mvp", "MVP"
        LAUNCHED = "launched", "Launched"
        REVENUE = "revenue", "Generating revenue"

    class Status(models.TextChoices):
        PROCESSING = "processing", "Processing"
        PUBLISHED = "published", "Published"
        FAILED = "failed", "Failed"

    founder = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="ideas"
    )

    # founder-submitted fields
    idea = models.TextField()
    industry = models.CharField(max_length=150)
    problem = models.TextField()
    solution = models.TextField()
    target_customer = models.TextField()
    differentiator = models.TextField()
    country = models.CharField(max_length=100)
    business_model = models.CharField(max_length=20, choices=BusinessModel.choices)
    stage = models.CharField(max_length=20, choices=Stage.choices)
    funding_requirement = models.DecimalField(max_digits=14, decimal_places=2)
    competitors = models.TextField(blank=True)

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PROCESSING)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.idea[:50]} ({self.founder.email})"


class IdeaReport(models.Model):
    idea = models.OneToOneField(Idea, on_delete=models.CASCADE, related_name="report")

    executive_summary = models.TextField(blank=True)
    problem_validation = models.TextField(blank=True)
    solution_evaluation = models.TextField(blank=True)
    target_customer_analysis = models.TextField(blank=True)

    # Market size — TAM/SAM/SOM
    tam = models.TextField(blank=True)
    sam = models.TextField(blank=True)
    som = models.TextField(blank=True)

    competitor_analysis = models.TextField(blank=True)
    competitive_advantage = models.TextField(blank=True)
    business_model_analysis = models.TextField(blank=True)
    revenue_potential = models.TextField(blank=True)
    market_trends = models.TextField(blank=True)
    risk_analysis = models.TextField(blank=True)
    funding_recommendation = models.TextField(blank=True)
    customer_segments = models.TextField(blank=True)
    go_to_market_strategy = models.TextField(blank=True)

    ai_validation_score = models.FloatField(null=True, blank=True)  # 0-100
    recommendations = models.TextField(blank=True)

    raw_response = models.JSONField(blank=True, null=True)  # full raw Gemini output, for debugging/audit
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Report for {self.idea.idea[:50]}"