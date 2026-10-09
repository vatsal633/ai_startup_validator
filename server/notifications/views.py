from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Notification
from .serializers import NotificationSerializer


class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Notification.objects.filter(recipient=self.request.user).select_related(
            "related_idea", "related_connection"
        )

        # ?unread=true powers the bell dropdown; ?type= powers the filter tabs
        if self.request.query_params.get("unread", "").lower() == "true":
            qs = qs.filter(is_read=False)

        notif_type = self.request.query_params.get("type", "").strip()
        if notif_type in Notification.NotificationType.values:
            qs = qs.filter(notification_type=notif_type)

        return qs


class NotificationMarkReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        notification = get_object_or_404(Notification, pk=pk, recipient=request.user)
        if not notification.is_read:
            notification.is_read = True
            notification.save(update_fields=["is_read"])
        return Response(NotificationSerializer(notification).data)


class NotificationMarkAllReadView(APIView):
    """POST /api/notifications/read-all/ : clear the whole unread badge at once."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        updated = Notification.objects.filter(
            recipient=request.user, is_read=False
        ).update(is_read=True)
        return Response({"marked_read": updated, "unread_count": 0})


class UnreadCountView(APIView):
    """Lightweight endpoint for a notification bell badge — avoids fetching the full list just to show a count."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        count = Notification.objects.filter(recipient=request.user, is_read=False).count()
        return Response({"unread_count": count})
