from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.shortcuts import get_object_or_404
from .models import ConnectionRequest
from .serializers import ConnectionRequestSerializer
from ideas.models import Idea
from notifications.models import Notification


class ConnectionRequestCreateView(generics.CreateAPIView):
    serializer_class = ConnectionRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        if self.request.user.role != "investor":
            raise PermissionDenied("Only investors can request connections.")

        idea = get_object_or_404(Idea, pk=self.kwargs["idea_id"])

        if idea.founder_id == self.request.user.id:
            raise ValidationError(
                "You cannot request a connection to your own idea.")

        if ConnectionRequest.objects.filter(idea=idea, investor=self.request.user).exists():
            raise ValidationError(
                "You have already requested a connection to this idea.")

        connection = serializer.save(idea=idea, investor=self.request.user)

        investor_name = f"{self.request.user.first_name} {self.request.user.last_name}".strip(
        ) or self.request.user.email
        Notification.objects.create(
            recipient=idea.founder,
            notification_type=Notification.NotificationType.CONNECTION_REQUESTED,
            related_idea=idea,
            related_connection=connection,
            message=f"{investor_name} is interested in your idea \"{idea.title}\"",
        )


class MyConnectionsView(generics.ListAPIView):
    serializer_class = ConnectionRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "founder":
            return ConnectionRequest.objects.filter(idea__founder=user).select_related("idea", "investor")
        return ConnectionRequest.objects.filter(investor=user).select_related("idea", "investor")


class ConnectionRequestRespondView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk, action):
        connection = get_object_or_404(ConnectionRequest, pk=pk)

        if connection.idea.founder_id != request.user.id:
            raise PermissionDenied(
                "You can only respond to requests on your own ideas.")

        if connection.status != ConnectionRequest.Status.PENDING:
            raise ValidationError("Already responded.")

        if action == "accept":
            connection.status = ConnectionRequest.Status.ACCEPTED
            connection.accepted_at = timezone.now()
            notif_type = Notification.NotificationType.CONNECTION_ACCEPTED
            notif_message = f"Your connection request for \"{connection.idea.title}\" was accepted"
        elif action == "decline":
            connection.status = ConnectionRequest.Status.DECLINED
            notif_type = Notification.NotificationType.CONNECTION_DECLINED
            notif_message = f"Your connection request for \"{connection.idea.title}\" was declined"
        else:
            raise ValidationError("Invalid action.")

        connection.save()

        Notification.objects.create(
            recipient=connection.investor,
            notification_type=notif_type,
            related_idea=connection.idea,
            related_connection=connection,
            message=notif_message,
        )

        return Response(ConnectionRequestSerializer(connection).data)
