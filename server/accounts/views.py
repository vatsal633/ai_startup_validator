from django.contrib.auth.tokens import default_token_generator
from .serializers import PasswordResetRequestSerializer, PasswordResetConfirmSerializer, User
from django.conf import settings
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from rest_framework_simplejwt.tokens import Token
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import RegisterSerializer, UserSerializer


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # embed role in the JWT payload so frontend can read it without an extra API call
        token["role"] = user.role
        token["email"] = user.email
        return token


class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [permissions.AllowAny]


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]

        try:
            user = User.objects.get(email=email)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            reset_link = f"{settings.FRONTEND_URL}/reset-password?uid={uid}&token={token}"

            send_mail(
                subject="Reset your VentureAI password",
                message=f"Click the link to reset your password: {reset_link}\n\nThis link expires soon and can only be used once.",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
            )
        except User.DoesNotExist:
            pass  # deliberately silent — don't reveal whether the email exists

        # always return the same response regardless of whether the user exists
        return Response(
            {"detail": "If an account exists with that email, a reset link has been sent."}
        )


class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        user.set_password(serializer.validated_data["new_password"])
        user.save()
        return Response({"detail": "Password has been reset successfully."})
