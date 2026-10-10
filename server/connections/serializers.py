from rest_framework import serializers

from .models import ConnectionRequest


def _profile(user, *, reveal_email):
    """A person's public-facing card.

    The email is the contact channel that accepting a request unlocks, so it
    is only included once that has happened — the same tiering the platform
    applies to ideas, pointed at people.
    """
    profile = {
        "name": f"{user.first_name} {user.last_name}".strip(),
        "bio": user.bio,
        "location": user.location,
        "linkedin": user.linkedin,
        "website": user.website,
        "member_since": user.created_at,
        "is_verified": user.is_verified,
    }
    if reveal_email:
        profile["email"] = user.email
    return profile


class ConnectionRequestSerializer(serializers.ModelSerializer):
    idea_title = serializers.CharField(source="idea.title", read_only=True)
    idea_status = serializers.CharField(source="idea.status", read_only=True)
    investor_name = serializers.SerializerMethodField()
    investor_profile = serializers.SerializerMethodField()
    founder_profile = serializers.SerializerMethodField()
    idea_summary = serializers.SerializerMethodField()

    class Meta:
        model = ConnectionRequest
        fields = [
            "id", "idea", "idea_title", "idea_status", "idea_summary",
            "investor", "investor_name", "investor_profile", "founder_profile",
            "status", "requested_at", "accepted_at",
        ]
        # idea comes from the URL and investor from the session — a client that
        # posts them in the body shouldn't be able to override either.
        read_only_fields = ["id", "idea", "investor", "status", "requested_at", "accepted_at"]

    def get_investor_name(self, obj):
        return f"{obj.investor.first_name} {obj.investor.last_name}".strip()

    def _is_accepted(self, obj):
        return obj.status == ConnectionRequest.Status.ACCEPTED

    def get_investor_profile(self, obj):
        """Shown to the founder so they know who is asking."""
        request = self.context.get("request")
        viewing_self = bool(request and request.user.id == obj.investor_id)
        return _profile(
            obj.investor, reveal_email=viewing_self or self._is_accepted(obj)
        )

    def get_founder_profile(self, obj):
        """Shown to the investor; their contact route once accepted."""
        request = self.context.get("request")
        viewing_self = bool(request and request.user.id == obj.idea.founder_id)
        return _profile(
            obj.idea.founder, reveal_email=viewing_self or self._is_accepted(obj)
        )

    def get_idea_summary(self, obj):
        """Enough for the investor's list to be readable without another call."""
        report = getattr(obj.idea, "report", None)
        return {
            "industry": obj.idea.industry,
            "stage": obj.idea.stage,
            "stage_display": obj.idea.get_stage_display(),
            "country": obj.idea.country,
            "funding_requirement": obj.idea.funding_requirement,
            "ai_validation_score": report.ai_validation_score if report else None,
        }
