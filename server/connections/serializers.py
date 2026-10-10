from rest_framework import serializers

from .models import ConnectionRequest


class ConnectionRequestSerializer(serializers.ModelSerializer):
    idea_title = serializers.CharField(source="idea.title", read_only=True)
    idea_status = serializers.CharField(source="idea.status", read_only=True)
    investor_name = serializers.SerializerMethodField()
    investor_profile = serializers.SerializerMethodField()

    class Meta:
        model = ConnectionRequest
        fields = [
            "id", "idea", "idea_title", "idea_status", "investor", "investor_name",
            "investor_profile", "status", "requested_at", "accepted_at",
        ]
        # idea comes from the URL and investor from the session — a client that
        # posts them in the body shouldn't be able to override either.
        read_only_fields = ["id", "idea", "investor", "status", "requested_at", "accepted_at"]

    def get_investor_name(self, obj):
        return f"{obj.investor.first_name} {obj.investor.last_name}".strip()

    def get_investor_profile(self, obj):
        """Enough for a founder to judge a request, without over-sharing.

        The same tiering the platform applies to ideas applies here: the
        profile is visible so the founder knows who is asking, but the email
        is the contact channel that accepting is supposed to unlock, so it
        stays hidden until then. The investor always sees their own.
        """
        investor = obj.investor
        request = self.context.get("request")
        is_self = bool(request and request.user.id == investor.id)

        profile = {
            "name": self.get_investor_name(obj),
            "bio": investor.bio,
            "location": investor.location,
            "linkedin": investor.linkedin,
            "website": investor.website,
            "member_since": investor.created_at,
            "is_verified": investor.is_verified,
        }

        if is_self or obj.status == ConnectionRequest.Status.ACCEPTED:
            profile["email"] = investor.email

        return profile
