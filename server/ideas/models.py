from django.conf import settings
from django.db import models


class Idea(models.Model):
    class Status(models.TextChoices):
        PROCESSING = "processing", "Processing"
        PUBLISHED = "published", "Published"
        FAILED = "failed", "Failed"

    founder = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="ideas",
    )
    title = models.CharField(max_length=255)
    raw_text = models.TextField()
    category = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PROCESSING)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class IdeaReport(models.Model):
    idea = models.OneToOneField(Idea, on_delete=models.CASCADE, related_name="report")
    target_customers = models.TextField(blank=True)
    min_investment = models.CharField(max_length=100, blank=True)
    risks = models.TextField(blank=True)
    summary = models.TextField(blank=True)
    viability_score = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Report for {self.idea.title}"