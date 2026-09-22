from django.conf import settings
from django.db import models
from ideas.models import Idea


class ConnectionRequest(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        ACCEPTED = "accepted", "Accepted"
        DECLINED = "declined", "Declined"

    idea = models.ForeignKey(Idea, on_delete=models.CASCADE, related_name="connection_requests")
    investor = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="connection_requests"
    )
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    requested_at = models.DateTimeField(auto_now_add=True)
    accepted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ("idea", "investor")  # one request per investor per idea

    def __str__(self):
        return f"{self.investor.email} -> {self.idea.idea[:40]} ({self.status})"