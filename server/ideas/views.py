import logging
from datetime import timedelta

from django.db import transaction
from django.db.models import Count, F, Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.exceptions import APIException, PermissionDenied
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

logger = logging.getLogger(__name__)


def build_report(idea):
    """Run Gemini and create or overwrite the idea's IdeaReport.
    Used by both submit and edit, so the field mapping lives in one place."""
    report_data = generate_report(idea)
    IdeaReport.objects.update_or_create(
        idea=idea,
        defaults=dict(
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
        ),
    )


class ReportRegenerationFailed(APIException):
    status_code = status.HTTP_502_BAD_GATEWAY
    default_detail = "Could not regenerate the AI report, so no changes were saved. Please try again."
    default_code = "report_regeneration_failed"


class IdeaCreateView(generics.CreateAPIView):
    serializer_class = IdeaCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        if self.request.user.role != "founder":
            raise PermissionDenied("Only founders can submit ideas.")

        idea = serializer.save(founder=self.request.user)

        try:
            build_report(idea)
            # analyzed but not public — the founder reviews the report, then publishes
            idea.status = Idea.Status.DRAFT
        except Exception:
            idea.status = Idea.Status.FAILED
            logger.exception("Report generation failed for idea %s", idea.id)
        idea.save(update_fields=["status"])


class IdeaListView(generics.ListAPIView):
    """GET /api/ideas/ : the public marketplace. Readable without signing in —
    it only ever exposes the teaser serializer."""
    serializer_class = IdeaTeaserSerializer
    permission_classes = [permissions.AllowAny]

    # whitelist, so ?ordering= cannot be pointed at arbitrary columns
    ORDERING_FIELDS = {
        "newest": "-created_at",
        "oldest": "created_at",
        "score": "-report__ai_validation_score",
        "funding": "-funding_requirement",
    }

    def get_queryset(self):
        params = self.request.query_params
        qs = (
            Idea.objects.filter(status=Idea.Status.PUBLISHED)
            .select_related("founder", "report")
        )

        search = params.get("q", "").strip()
        if search:
            qs = qs.filter(
                Q(title__icontains=search)
                | Q(idea__icontains=search)
                | Q(industry__icontains=search)
                | Q(problem__icontains=search)
            )

        for param, lookup in (
            ("industry", "industry__iexact"),
            ("country", "country__iexact"),
            ("stage", "stage"),
            ("business_model", "business_model"),
        ):
            value = params.get(param, "").strip()
            if value:
                qs = qs.filter(**{lookup: value})

        for param, lookup in (
            ("min_score", "report__ai_validation_score__gte"),
            ("max_score", "report__ai_validation_score__lte"),
            ("min_funding", "funding_requirement__gte"),
            ("max_funding", "funding_requirement__lte"),
        ):
            value = params.get(param, "").strip()
            if value:
                try:
                    qs = qs.filter(**{lookup: float(value)})
                except ValueError:
                    pass  # ignore an unparseable filter rather than 500

        ordering = self.ORDERING_FIELDS.get(params.get("ordering"), "-created_at")
        return qs.order_by(ordering)


class IdeaDetailView(generics.RetrieveAPIView):
    queryset = Idea.objects.select_related("founder", "report")
    permission_classes = [permissions.IsAuthenticated]

    def retrieve(self, request, *args, **kwargs):
        idea = self.get_object()
        user = request.user

        is_founder = idea.founder_id == user.id
        is_admin = user.role == "admin"

        # an unpublished idea is visible only to its founder and to admins
        if idea.status != Idea.Status.PUBLISHED and not (is_founder or is_admin):
            raise PermissionDenied("This idea is not published.")

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

    def patch(self, request, *args, **kwargs):
        """PATCH /api/ideas/<id>/ : founder edits their own idea.
        Any change other than the title regenerates the AI report. If
        regeneration fails, the whole edit is rolled back."""
        idea = self.get_object()
        if idea.founder_id != request.user.id:
            raise PermissionDenied("You can only edit your own ideas.")

        serializer = IdeaCreateSerializer(idea, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        changed = {f for f, v in serializer.validated_data.items() if getattr(idea, f) != v}
        if not changed:
            return Response(IdeaDetailSerializer(idea).data)

        try:
            with transaction.atomic():
                idea = serializer.save()
                if changed - {"title"}:
                    build_report(idea)
                    # a re-analyzed idea drops out of the marketplace until the
                    # founder reviews the new report and republishes
                    idea.status = Idea.Status.DRAFT
                    idea.published_at = None
                    idea.save(update_fields=["status", "published_at"])
        except Exception:
            logger.exception("Report regeneration failed for idea %s", idea.id)
            raise ReportRegenerationFailed()

        idea = self.get_queryset().get(pk=idea.pk)  # refresh with the new report
        return Response(IdeaDetailSerializer(idea).data)

    def delete(self, request, *args, **kwargs):
        """DELETE /api/ideas/<id>/ : founder deletes their own idea.
        Cascades to its report, views and connection requests."""
        idea = self.get_object()
        if idea.founder_id != request.user.id:
            raise PermissionDenied("You can only delete your own ideas.")
        idea.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class IdeaPublishView(APIView):
    """POST   /api/ideas/<id>/publish/ : put the idea on the marketplace.
    DELETE /api/ideas/<id>/publish/ : take it back off."""
    permission_classes = [permissions.IsAuthenticated]

    def get_idea(self, request, pk):
        idea = get_object_or_404(Idea.objects.select_related("report"), pk=pk)
        if idea.founder_id != request.user.id:
            raise PermissionDenied("You can only publish your own ideas.")
        return idea

    def post(self, request, pk):
        idea = self.get_idea(request, pk)

        if idea.status == Idea.Status.PUBLISHED:
            return Response(IdeaDetailSerializer(idea).data)

        # publishing only means something once there is a report to show
        if idea.status != Idea.Status.DRAFT or not hasattr(idea, "report"):
            raise PermissionDenied(
                "Only an analyzed idea can be published. Re-run the analysis first."
            )

        idea.status = Idea.Status.PUBLISHED
        idea.published_at = timezone.now()
        idea.save(update_fields=["status", "published_at"])
        return Response(IdeaDetailSerializer(idea).data)

    def delete(self, request, pk):
        idea = self.get_idea(request, pk)

        if idea.status != Idea.Status.PUBLISHED:
            raise PermissionDenied("This idea is not published.")

        idea.status = Idea.Status.DRAFT
        idea.published_at = None
        idea.save(update_fields=["status", "published_at"])
        return Response(IdeaDetailSerializer(idea).data)


class MyIdeasView(generics.ListAPIView):
    """GET /api/ideas/mine/ : the logged-in founder's ideas, every status."""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = MyIdeaSerializer

    def get_queryset(self):
        qs = (
            Idea.objects.filter(founder=self.request.user)
            .annotate(
                ai_validation_score=F("report__ai_validation_score"),
                view_count=Count("views", distinct=True),
                request_count=Count("connection_requests", distinct=True),
            )
        )

        status_filter = self.request.query_params.get("status", "").strip()
        if status_filter in Idea.Status.values:
            qs = qs.filter(status=status_filter)

        search = self.request.query_params.get("q", "").strip()
        if search:
            qs = qs.filter(
                Q(title__icontains=search)
                | Q(idea__icontains=search)
                | Q(industry__icontains=search)
            )

        return qs.order_by("-created_at")


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
            "drafts": ideas.filter(status=Idea.Status.DRAFT).count(),
            "total_views": views.count(),
            "views_change_percent": _pct_change(views_last_30, views_prev_30),
            "investor_requests": reqs.count(),
            "requests_this_week": reqs.filter(requested_at__gte=week_ago).count(),
            "pending_requests": reqs.filter(status=ConnectionRequest.Status.PENDING).count(),
        })
