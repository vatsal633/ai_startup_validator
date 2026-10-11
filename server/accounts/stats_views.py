"""Platform statistics for the admin dashboard.

Everything here is computed from existing rows — there is no separate
analytics store. The numbers are small enough that straightforward
aggregate queries are the right tool; if the platform ever grows, the
expensive ones are the per-status counts and they are all indexed.
"""

from datetime import timedelta
from statistics import median

from django.contrib.auth import get_user_model
from django.db.models import Avg, Count, Max, Min, Q, Sum
from django.utils import timezone
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from analysis.tasks import STALE_AFTER
from connections.models import ConnectionRequest
from ideas.models import Idea, IdeaReport, IdeaView
from notifications.models import Notification

User = get_user_model()

# 0-9, 10-19, ... 90-100 — wide enough to be readable, narrow enough to show
# whether the model actually spreads its scores or clusters them
SCORE_BAND = 10

PENDING_IS_STALE_AFTER = timedelta(days=7)


class IsAdmin(permissions.BasePermission):
    """Admins only. The role lives on the user, not on Django's is_staff."""

    message = "Administrator access required."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == User.Role.ADMIN
        )


def _counts_by(queryset, field):
    """{value: count} for a field, in descending count order."""
    rows = queryset.values(field).annotate(n=Count("id")).order_by("-n")
    return {row[field]: row["n"] for row in rows}


def _score_distribution(scores):
    """Counts per 10-point band, every band present so the chart has no gaps."""
    bands = {f"{low}-{low + SCORE_BAND - 1}": 0 for low in range(0, 100, SCORE_BAND)}
    labels = list(bands)
    for score in scores:
        index = min(int(score // SCORE_BAND), len(labels) - 1)
        bands[labels[index]] += 1
    return bands


class AdminStatsView(APIView):
    """GET /api/admin/stats/"""

    permission_classes = [IsAdmin]

    def get(self, request):
        now = timezone.now()
        last_30 = now - timedelta(days=30)

        ideas = Idea.objects.all()
        published = ideas.filter(status=Idea.Status.PUBLISHED)
        reports = IdeaReport.objects.exclude(ai_validation_score=None)
        requests = ConnectionRequest.objects.all()

        scores = list(reports.values_list("ai_validation_score", flat=True))
        score_stats = reports.aggregate(avg=Avg("ai_validation_score"),
                                        low=Min("ai_validation_score"),
                                        high=Max("ai_validation_score"))

        # --- AI pipeline -------------------------------------------------
        succeeded = ideas.filter(report__isnull=False).count()
        failed = ideas.filter(status=Idea.Status.FAILED).count()
        finished = succeeded + failed

        processing = ideas.filter(status=Idea.Status.PROCESSING)
        stuck = processing.filter(created_at__lt=now - STALE_AFTER)

        # --- connection funnel -------------------------------------------
        accepted = requests.filter(status=ConnectionRequest.Status.ACCEPTED)
        responded = requests.exclude(status=ConnectionRequest.Status.PENDING).count()

        # only acceptances carry a timestamp, so a decline's turnaround is not
        # knowable — the field for it does not exist on the model
        accept_hours = [
            (row.accepted_at - row.requested_at).total_seconds() / 3600
            for row in accepted.only("accepted_at", "requested_at")
            if row.accepted_at
        ]

        zero_request_ideas = published.annotate(
            n=Count("connection_requests")
        ).filter(n=0)

        return Response({
            "generated_at": now,

            "overview": {
                "users_total": User.objects.count(),
                "users_by_role": _counts_by(User.objects.all(), "role"),
                "signups_last_30_days": User.objects.filter(created_at__gte=last_30).count(),
                "ideas_total": ideas.count(),
                "ideas_by_status": _counts_by(ideas, "status"),
                "ideas_last_30_days": ideas.filter(created_at__gte=last_30).count(),
                "total_views": IdeaView.objects.count(),
                "notifications_sent": Notification.objects.count(),
            },

            "pipeline": {
                "analyses_succeeded": succeeded,
                "analyses_failed": failed,
                "failure_rate_percent": round(failed / finished * 100, 1) if finished else 0.0,
                "currently_processing": processing.count(),
                "stuck_processing": stuck.count(),
                "stuck_threshold_minutes": int(STALE_AFTER.total_seconds() // 60),
                "failed_awaiting_retry": failed,
                "score_average": round(score_stats["avg"], 1) if score_stats["avg"] else None,
                "score_lowest": score_stats["low"],
                "score_highest": score_stats["high"],
                "score_spread": (
                    round(score_stats["high"] - score_stats["low"], 1)
                    if score_stats["high"] is not None else None
                ),
                "score_distribution": _score_distribution(scores),
                "scored_reports": len(scores),
            },

            "funnel": {
                "published_ideas": published.count(),
                "requests_total": requests.count(),
                "requests_by_status": _counts_by(requests, "status"),
                "accept_rate_percent": (
                    round(accepted.count() / responded * 100, 1) if responded else None
                ),
                "median_hours_to_accept": (
                    round(median(accept_hours), 1) if accept_hours else None
                ),
                "pending_over_7_days": requests.filter(
                    status=ConnectionRequest.Status.PENDING,
                    requested_at__lt=now - PENDING_IS_STALE_AFTER,
                ).count(),
                "published_with_no_requests": zero_request_ideas.count(),
            },

            "marketplace": {
                "by_industry": _counts_by(published, "industry"),
                "by_stage": _counts_by(published, "stage"),
                "by_country": _counts_by(published, "country"),
                "total_funding_sought": published.aggregate(
                    total=Sum("funding_requirement")
                )["total"],
                "average_funding_sought": published.aggregate(
                    avg=Avg("funding_requirement")
                )["avg"],
            },

            "moderation": {
                "recently_published": [
                    {
                        "id": idea.id,
                        "title": idea.title,
                        "industry": idea.industry,
                        "founder": idea.founder.email,
                        "score": getattr(idea.report, "ai_validation_score", None),
                        "published_at": idea.published_at,
                    }
                    for idea in published.select_related("founder", "report")
                    .order_by("-published_at")[:10]
                ],
                "low_scoring_published": published.filter(
                    report__ai_validation_score__lt=50
                ).count(),
                # there is no flagging or takedown model yet, so this view is
                # read-only; admins act through Django admin
                "flagging_supported": False,
            },
        })
