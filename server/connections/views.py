from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.shortcuts import get_object_or_404
from .models import ConnectionRequest
from .serializers import ConnectionRequestSerializer
from ideas.models import Idea


class ConnectionRequestCreateView(generics.CreateAPIView):
    """Investor requests access to a specific idea's full report."""
    serializer_class = ConnectionRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        if self.request.user.role != "investor":
            raise PermissionDenied("Only investors can request connections.")

        idea = get_object_or_404(Idea, pk=self.kwargs["idea_id"])

        if idea.founder_id == self.request.user.id:
            raise ValidationError("You cannot request a connection to your own idea.")

        if ConnectionRequest.objects.filter(idea=idea, investor=self.request.user).exists():
            raise ValidationError("You have already requested a connection to this idea.")

        serializer.save(idea=idea, investor=self.request.user)


class MyConnectionsView(generics.ListAPIView):
    """
    Founders see requests made on their ideas.
    Investors see requests they've made.
    """
    serializer_class = ConnectionRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "founder":
            return ConnectionRequest.objects.filter(idea__founder=user).select_related("idea", "investor")
        return ConnectionRequest.objects.filter(investor=user).select_related("idea", "investor")


class ConnectionRequestRespondView(APIView):
    """Founder accepts or declines a request on their idea."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk, action):
        connection = get_object_or_404(ConnectionRequest, pk=pk)

        if connection.idea.founder_id != request.user.id:
            raise PermissionDenied("You can only respond to requests on your own ideas.")

        if action == "accept":
            connection.status = ConnectionRequest.Status.ACCEPTED
            connection.accepted_at = timezone.now()
        elif action == "decline":
            connection.status = ConnectionRequest.Status.DECLINED
        else:
            raise ValidationError("Invalid action.")

        connection.save()
        return Response(ConnectionRequestSerializer(connection).data)