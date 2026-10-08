from datetime import timedelta

from django.db.models import Count, F
from django.utils import timezone
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from analysis.report_generator import generate_report
from connections.models import ConnectionRequest
from .models import Idea, IdeaReport, IdeaView
from .serializers import (
    IdeaCreateSerializer,
    IdeaDetailSerializer,
    IdeaTeaserSerializer,
    MyIdeaSerializer,          
)


class IdeaCreateView(generics.CreateAPIView):
    serializer_class = IdeaCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        idea = serializer.save(founder=self.request.user)

        try:
            report_data = generate_report(idea)
            IdeaReport.objects.create(
                idea=idea,
                executive_summary=report_data.get("executive_summary", ""),
                problem_validation=report_data.get("problem_validation", ""),
                solution_evaluation=report_data.get("solution_evaluation", ""),
                target_customer_analysis=report_data.get("target_customer_analysis", ""),
                tam=report_data.get("market_size", {}).get("tam", ""),
                sam=report_data.get("market_size", {}).get("sam", ""),
                som=report_data.get("market_size", {}).get("som", ""),
                competitor_analysis=report_data.get("competitor_analysis", ""),
                competitive_advantage=report_data.get("competitive_advantage", ""),
                business_model_analysis=report_data.get("business_model_analysis", ""),
                revenue_potential=report_data.get("revenue_potential", ""),
                market_trends=report_data.get("market_trends", ""),
                risk_analysis=report_data.get("risk_analysis", ""),
                funding_recommendation=report_data.get("funding_recommendation", ""),
                customer_segments=report_data.get("customer_segments", ""),
                go_to_market_strategy=report_data.get("go_to_market_strategy", ""),
                ai_validation_score=report_data.get("ai_validation_score"),
                recommendations=report_data.get("recommendations", ""),
                raw_response=report_data,
            )
            idea.status = Idea.Status.PUBLISHED
        except Exception as e:
            idea.status = Idea.Status.FAILED
            print(f"Report generation failed for idea {idea.id}: {e}")
        idea.save()


class IdeaListView(generics.ListAPIView):
    queryset = Idea.objects.filter(status=Idea.Status.PUBLISHED).select_related("founder").order_by("-created_at")
    serializer_class = IdeaTeaserSerializer
    permission_classes = [permissions.IsAuthenticated]


class IdeaDetailView(generics.RetrieveAPIView):
    queryset = Idea.objects.select_related("founder", "report")
    permission_classes = [permissions.IsAuthenticated]

    def retrieve(self, request, *args, **kwargs):
        idea = self.get_object()
        user = request.user

        is_founder = idea.founder_id == user.id
        is_admin = user.role == "admin"
        has_accepted_connection = ConnectionRequest.objects.filter(
            idea=idea, investor=user, status=ConnectionRequest.Status.ACCEPTED
        ).exists()

        # count the view (not the founder's own, not admins), once per viewer per 24h
        if not is_founder and not is_admin:
            since = timezone.now() - timedelta(hours=24)
            if not IdeaView.objects.filter(idea=idea, viewer=user, viewed_at__gte=since).exists():
                IdeaView.objects.create(idea=idea, viewer=user)

        if is_founder or is_admin or has_accepted_connection:
            serializer_class = IdeaDetailSerializer
        else:
            serializer_class = IdeaTeaserSerializer

        serializer = serializer_class(idea, context=self.get_serializer_context())
        return Response(serializer.data)


class MyIdeasView(generics.ListAPIView):
    """GET /api/ideas/mine/ : the logged-in founder's ideas, every status."""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = MyIdeaSerializer

    def get_queryset(self):
        return (
            Idea.objects.filter(founder=self.request.user)
            .annotate(
                ai_validation_score=F("report__ai_validation_score"),
                view_count=Count("views", distinct=True),
                request_count=Count("connection_requests", distinct=True),
            )
            .order_by("-created_at")
        )


def _pct_change(current, previous):
    if previous == 0:
        return 100.0 if current > 0 else 0.0
    return round((current - previous) / previous * 100, 1)


class DashboardStatsView(APIView):
    """GET /api/ideas/dashboard/stats/"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        now = timezone.now()
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        week_ago = now - timedelta(days=7)
        d30 = now - timedelta(days=30)
        d60 = now - timedelta(days=60)

        ideas = Idea.objects.filter(founder=request.user)
        published = ideas.filter(status=Idea.Status.PUBLISHED)
        views = IdeaView.objects.filter(idea__founder=request.user)
        reqs = ConnectionRequest.objects.filter(idea__founder=request.user)

        views_last_30 = views.filter(viewed_at__gte=d30).count()
        views_prev_30 = views.filter(viewed_at__gte=d60, viewed_at__lt=d30).count()

        return Response({
            "total_ideas": ideas.count(),
            "ideas_this_month": ideas.filter(created_at__gte=month_start).count(),
            "published": published.count(),
            "published_this_month": published.filter(created_at__gte=month_start).count(),
            "total_views": views.count(),
            "views_change_percent": _pct_change(views_last_30, views_prev_30),
            "investor_requests": reqs.count(),
            "requests_this_week": reqs.filter(requested_at__gte=week_ago).count(),
            "pending_requests": reqs.filter(status=ConnectionRequest.Status.PENDING).count(),
        })