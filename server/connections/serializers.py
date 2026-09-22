from rest_framework import serializers
from .models import ConnectionRequest


class ConnectionRequestSerializer(serializers.ModelSerializer):
    idea_title = serializers.CharField(source="idea.idea", read_only=True)
    investor_name = serializers.SerializerMethodField()

    class Meta:
        model = ConnectionRequest
        fields = ["id", "idea", "idea_title", "investor", "investor_name", "status", "requested_at", "accepted_at"]
        read_only_fields = ["id", "investor", "status", "requested_at", "accepted_at"]

    def get_investor_name(self, obj):
        return f"{obj.investor.first_name} {obj.investor.last_name}".strip()