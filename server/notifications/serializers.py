from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    idea_title = serializers.CharField(source="related_idea.title", read_only=True)

    class Meta:
        model = Notification
        fields = [
            "id", "notification_type", "related_idea", "idea_title",
            "related_connection", "message", "is_read", "created_at",
        ]
        read_only_fields = fields