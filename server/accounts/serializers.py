from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode

User = get_user_model()

PROFILE_FIELDS = ["first_name", "last_name", "bio", "phone", "location", "linkedin", "website"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    # declared as a plain CharField on purpose: the auto-generated ChoiceField
    # would reject "Founder" before validate_role gets a chance to normalize it.
    role = serializers.CharField()

    class Meta:
        model = User
        fields = ["id", "first_name", "last_name", "email", "password", "role"]

    def validate_role(self, value):
        # the signup form sends a display-cased label ("Founder"), the model
        # stores the lowercase value — normalize before checking.
        normalized = (value or "").strip().lower()

        if normalized not in (User.Role.FOUNDER, User.Role.INVESTOR):
            raise serializers.ValidationError("You cannot register with this role.")

        return normalized

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
            role=validated_data["role"],
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id", "first_name", "last_name", "email", "role",
            "bio", "phone", "location", "linkedin", "website",
            "is_verified", "created_at",
        ]
        read_only_fields = fields


class UserUpdateSerializer(serializers.ModelSerializer):
    """PATCH /api/auth/me/ : the fields a user may change about themselves.
    Email and role are deliberately excluded — email is the login identifier
    and role decides what the account can see."""

    class Meta:
        model = User
        fields = PROFILE_FIELDS


class PasswordChangeSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)

    def validate_current_password(self, value):
        if not self.context["request"].user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value

    def validate_new_password(self, value):
        validate_password(value, self.context["request"].user)
        return value

    def validate(self, data):
        if data["current_password"] == data["new_password"]:
            raise serializers.ValidationError(
                {"new_password": "New password must be different from the current one."}
            )
        return data


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        # don't reveal whether the email exists — handled in the view, not here
        return value


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, min_length=8)

    def validate(self, data):
        try:
            uid = force_str(urlsafe_base64_decode(data["uid"]))
            user = User.objects.get(pk=uid)
        except (User.DoesNotExist, ValueError, TypeError, OverflowError):
            raise serializers.ValidationError("Invalid reset link.")

        if not default_token_generator.check_token(user, data["token"]):
            raise serializers.ValidationError("Reset link is invalid or has expired.")

        validate_password(data["new_password"], user)
        data["user"] = user
        return data
