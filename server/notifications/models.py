from django.conf import settings
from django.db import models
from ideas.models import Idea
from connections.models import ConnectionRequest


class Notification(models.Model):
    class NotificationType(models.TextChoices):
        CONNECTION_REQUESTED = "connection_requested", "Connection Requested"
        CONNECTION_ACCEPTED = "connection_accepted", "Connection Accepted"
        CONNECTION_DECLINED = "connection_declined", "Connection Declined"

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications"
    )
    notification_type = models.CharField(max_length=30, choices=NotificationType.choices)
    related_idea = models.ForeignKey(Idea, on_delete=models.CASCADE, null=True, blank=True)
    related_connection = models.ForeignKey(
        ConnectionRequest, on_delete=models.CASCADE, null=True, blank=True
    )
    message = models.CharField(max_length=255)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.recipient.email}: {self.message}"