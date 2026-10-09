from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APITestCase

from connections.models import ConnectionRequest
from ideas.models import Idea, IdeaReport, IdeaView

User = get_user_model()

FAKE_REPORT = {
    "executive_summary": "Summary.",
    "problem_validation": "Validated.",
    "solution_evaluation": "Good.",
    "target_customer_analysis": "Farmers.",
    "market_size": {"tam": "$1B", "sam": "$200M", "som": "$20M"},
    "competitor_analysis": "Plantix.",
    "competitive_advantage": "Offline.",
    "business_model_analysis": "Freemium works.",
    "revenue_potential": "High.",
    "market_trends": "Growing.",
    "risk_analysis": "Adoption risk.",
    "funding_recommendation": "Raise seed.",
    "customer_segments": "Smallholders.",
    "go_to_market_strategy": "Co-ops.",
    "ai_validation_score": 87.0,
    "recommendations": "Pilot in Maharashtra.",
}

IDEA_PAYLOAD = {
    "title": "FarmSense AI",
    "idea": "Detect crop disease from a phone photo.",
    "industry": "AgriTech",
    "problem": "Farmers lose yield to undiagnosed disease.",
    "solution": "On-device image classification.",
    "target_customer": "Smallholder farmers in India.",
    "differentiator": "Works offline.",
    "country": "India",
    "business_model": "freemium",
    "stage": "mvp",
    "funding_requirement": "2500000.00",
    "competitors": "Plantix",
}


def run_inline(fn, *args, **kwargs):
    """Stand-in for run_in_background: run it now, on this thread.

    Real threads would make these tests racy, and each thread opens its own
    connection, which the test transaction cannot see.
    """
    return fn(*args, **kwargs)


class IdeaTestCase(APITestCase):
    """Shared fixtures plus helpers for authenticating as either party.

    APITestCase rather than TestCase: DRF is configured with JWT auth only, so
    Django's session-based force_login does not authenticate these requests.
    """

    def setUp(self):
        self.founder = User.objects.create_user(
            email="founder@test.com", password="s3cret-pass-99",
            first_name="Ada", last_name="F", role="founder",
        )
        self.investor = User.objects.create_user(
            email="investor@test.com", password="s3cret-pass-99",
            first_name="Ivan", last_name="I", role="investor",
        )

    def as_founder(self):
        self.client.force_authenticate(user=self.founder)

    def as_investor(self):
        self.client.force_authenticate(user=self.investor)

    def make_idea(self, *, status=Idea.Status.DRAFT, with_report=True, **overrides):
        fields = {**IDEA_PAYLOAD, **overrides}
        idea = Idea.objects.create(founder=self.founder, status=status, **fields)
        if with_report:
            IdeaReport.objects.create(idea=idea, ai_validation_score=87.0)
        return idea


class SubmitTests(IdeaTestCase):
    def test_submit_returns_immediately_in_processing(self):
        """The response must not wait on Gemini — that is the whole point."""
        self.as_founder()
        with patch("ideas.views.run_in_background") as background:
            response = self.client.post(
                reverse("idea-create"), IDEA_PAYLOAD, format="json"
            )

        self.assertEqual(response.status_code, 201)
        idea = Idea.objects.get(title="FarmSense AI")
        self.assertEqual(idea.status, Idea.Status.PROCESSING)
        # the work was handed off rather than run inline
        background.assert_called_once()
        self.assertEqual(background.call_args.args[1], idea.id)

    def test_background_generation_moves_idea_to_draft(self):
        self.as_founder()
        with patch("ideas.views.run_in_background", run_inline), patch(
            "ideas.views.generate_report", return_value=FAKE_REPORT
        ):
            self.client.post(
                reverse("idea-create"), IDEA_PAYLOAD, format="json"
            )

        idea = Idea.objects.get(title="FarmSense AI")
        self.assertEqual(idea.status, Idea.Status.DRAFT)
        self.assertEqual(idea.report.ai_validation_score, 87.0)

    def test_a_failed_analysis_marks_the_idea_failed(self):
        self.as_founder()
        with patch("ideas.views.run_in_background", run_inline), patch(
            "ideas.views.generate_report", side_effect=RuntimeError("gemini down")
        ):
            response = self.client.post(
                reverse("idea-create"), IDEA_PAYLOAD, format="json"
            )

        # still a 201 — the idea was saved, only the analysis failed
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Idea.objects.get(title="FarmSense AI").status, Idea.Status.FAILED)

    def test_investor_cannot_submit(self):
        self.as_investor()
        response = self.client.post(
            reverse("idea-create"), IDEA_PAYLOAD, format="json"
        )
        self.assertEqual(response.status_code, 403)
        self.assertFalse(Idea.objects.exists())


class PublishTests(IdeaTestCase):
    def test_founder_can_publish_an_analyzed_idea(self):
        idea = self.make_idea()
        self.as_founder()

        response = self.client.post(reverse("idea-publish", args=[idea.id]))

        self.assertEqual(response.status_code, 200)
        idea.refresh_from_db()
        self.assertEqual(idea.status, Idea.Status.PUBLISHED)
        self.assertIsNotNone(idea.published_at)

    def test_cannot_publish_without_a_report(self):
        idea = self.make_idea(status=Idea.Status.FAILED, with_report=False)
        self.as_founder()

        response = self.client.post(reverse("idea-publish", args=[idea.id]))

        self.assertEqual(response.status_code, 403)
        idea.refresh_from_db()
        self.assertEqual(idea.status, Idea.Status.FAILED)

    def test_non_owner_cannot_publish(self):
        idea = self.make_idea()
        self.as_investor()

        response = self.client.post(reverse("idea-publish", args=[idea.id]))

        self.assertEqual(response.status_code, 403)
        idea.refresh_from_db()
        self.assertEqual(idea.status, Idea.Status.DRAFT)

    def test_unpublish_clears_published_at(self):
        idea = self.make_idea(status=Idea.Status.PUBLISHED)
        idea.published_at = timezone.now()
        idea.save()
        self.as_founder()

        response = self.client.delete(reverse("idea-publish", args=[idea.id]))

        self.assertEqual(response.status_code, 200)
        idea.refresh_from_db()
        self.assertEqual(idea.status, Idea.Status.DRAFT)
        self.assertIsNone(idea.published_at)


class RetryTests(IdeaTestCase):
    def test_retry_reruns_a_failed_analysis(self):
        idea = self.make_idea(status=Idea.Status.FAILED, with_report=False)
        self.as_founder()

        with patch("ideas.views.run_in_background", run_inline), patch(
            "ideas.views.generate_report", return_value=FAKE_REPORT
        ):
            response = self.client.post(reverse("idea-retry", args=[idea.id]))

        self.assertEqual(response.status_code, 202)
        idea.refresh_from_db()
        self.assertEqual(idea.status, Idea.Status.DRAFT)
        self.assertEqual(idea.report.ai_validation_score, 87.0)

    def test_cannot_retry_while_already_processing(self):
        idea = self.make_idea(status=Idea.Status.PROCESSING, with_report=False)
        self.as_founder()

        response = self.client.post(reverse("idea-retry", args=[idea.id]))

        self.assertEqual(response.status_code, 400)

    def test_cannot_retry_a_published_idea(self):
        idea = self.make_idea(status=Idea.Status.PUBLISHED)
        self.as_founder()

        response = self.client.post(reverse("idea-retry", args=[idea.id]))

        self.assertEqual(response.status_code, 400)

    def test_non_owner_cannot_retry(self):
        idea = self.make_idea(status=Idea.Status.FAILED, with_report=False)
        self.as_investor()

        response = self.client.post(reverse("idea-retry", args=[idea.id]))

        self.assertEqual(response.status_code, 403)


class TieredDisclosureTests(IdeaTestCase):
    """The core privacy promise: full reports need an accepted connection."""

    def setUp(self):
        super().setUp()
        self.idea = self.make_idea(status=Idea.Status.PUBLISHED)

    def test_investor_without_a_connection_gets_only_the_teaser(self):
        self.as_investor()
        body = self.client.get(reverse("idea-detail", args=[self.idea.id])).json()

        self.assertNotIn("report", body)
        self.assertNotIn("problem", body)
        self.assertIn("title", body)

    def test_investor_with_an_accepted_connection_gets_the_report(self):
        ConnectionRequest.objects.create(
            idea=self.idea, investor=self.investor,
            status=ConnectionRequest.Status.ACCEPTED,
        )
        self.as_investor()
        body = self.client.get(reverse("idea-detail", args=[self.idea.id])).json()

        self.assertIn("report", body)
        self.assertEqual(body["report"]["ai_validation_score"], 87.0)

    def test_a_pending_connection_is_not_enough(self):
        ConnectionRequest.objects.create(
            idea=self.idea, investor=self.investor,
            status=ConnectionRequest.Status.PENDING,
        )
        self.as_investor()
        body = self.client.get(reverse("idea-detail", args=[self.idea.id])).json()

        self.assertNotIn("report", body)

    def test_founder_always_sees_the_report(self):
        self.as_founder()
        body = self.client.get(reverse("idea-detail", args=[self.idea.id])).json()

        self.assertIn("report", body)

    def test_unpublished_ideas_are_hidden_from_other_users(self):
        draft = self.make_idea(status=Idea.Status.DRAFT)
        self.as_investor()

        response = self.client.get(reverse("idea-detail", args=[draft.id]))

        self.assertEqual(response.status_code, 403)


class ViewCountTests(IdeaTestCase):
    def setUp(self):
        super().setUp()
        self.idea = self.make_idea(status=Idea.Status.PUBLISHED)

    def test_repeat_views_within_24h_count_once(self):
        self.as_investor()
        url = reverse("idea-detail", args=[self.idea.id])

        self.client.get(url)
        self.client.get(url)
        self.client.get(url)

        self.assertEqual(IdeaView.objects.filter(idea=self.idea).count(), 1)

    def test_the_founders_own_view_is_not_counted(self):
        self.as_founder()
        self.client.get(reverse("idea-detail", args=[self.idea.id]))

        self.assertEqual(IdeaView.objects.filter(idea=self.idea).count(), 0)


class MarketplaceTests(IdeaTestCase):
    def setUp(self):
        super().setUp()
        self.published = self.make_idea(status=Idea.Status.PUBLISHED)
        self.draft = self.make_idea(status=Idea.Status.DRAFT, title="Hidden Draft")

    def test_marketplace_is_readable_signed_out(self):
        response = self.client.get(reverse("idea-list"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["count"], 1)

    def test_drafts_never_appear(self):
        titles = [row["title"] for row in self.client.get(reverse("idea-list")).json()["results"]]

        self.assertNotIn("Hidden Draft", titles)

    def test_the_teaser_withholds_the_private_fields(self):
        row = self.client.get(reverse("idea-list")).json()["results"][0]

        for private in ("problem", "solution", "differentiator", "report"):
            self.assertNotIn(private, row)

    def test_search_and_filters(self):
        url = reverse("idea-list")

        self.assertEqual(self.client.get(f"{url}?q=farmsense").json()["count"], 1)
        self.assertEqual(self.client.get(f"{url}?q=nothinghere").json()["count"], 0)
        self.assertEqual(self.client.get(f"{url}?industry=agritech").json()["count"], 1)
        self.assertEqual(self.client.get(f"{url}?stage=mvp").json()["count"], 1)
        self.assertEqual(self.client.get(f"{url}?min_score=80").json()["count"], 1)
        self.assertEqual(self.client.get(f"{url}?min_score=95").json()["count"], 0)

    def test_an_unparseable_filter_is_ignored_rather_than_a_500(self):
        response = self.client.get(f"{reverse('idea-list')}?min_score=not-a-number")

        self.assertEqual(response.status_code, 200)

    def test_an_unknown_ordering_falls_back_safely(self):
        response = self.client.get(f"{reverse('idea-list')}?ordering=../../etc/passwd")

        self.assertEqual(response.status_code, 200)


class MyIdeasTests(IdeaTestCase):
    def test_lists_every_status_for_the_owner_only(self):
        self.make_idea(status=Idea.Status.DRAFT)
        self.make_idea(status=Idea.Status.FAILED, with_report=False)
        self.as_founder()

        self.assertEqual(self.client.get(reverse("idea-mine")).json()["count"], 2)

        self.as_investor()
        self.assertEqual(self.client.get(reverse("idea-mine")).json()["count"], 0)

    def test_carries_the_annotations_the_dashboard_needs(self):
        self.make_idea()
        self.as_founder()

        row = self.client.get(reverse("idea-mine")).json()["results"][0]

        self.assertEqual(row["ai_validation_score"], 87.0)
        self.assertEqual(row["view_count"], 0)
        self.assertEqual(row["request_count"], 0)

    def test_status_filter(self):
        self.make_idea(status=Idea.Status.DRAFT)
        self.make_idea(status=Idea.Status.FAILED, with_report=False)
        self.as_founder()

        response = self.client.get(f"{reverse('idea-mine')}?status=failed")

        self.assertEqual(response.json()["count"], 1)


class EditTests(IdeaTestCase):
    def test_a_title_only_edit_does_not_re_analyze(self):
        idea = self.make_idea(status=Idea.Status.PUBLISHED)
        self.as_founder()

        with patch("ideas.views.run_in_background") as background:
            self.client.patch(
                reverse("idea-detail", args=[idea.id]),
                {"title": "FarmSense AI v2"},
                format="json",
            )

        background.assert_not_called()
        idea.refresh_from_db()
        self.assertEqual(idea.status, Idea.Status.PUBLISHED)

    def test_a_substantive_edit_re_analyzes_and_unpublishes(self):
        idea = self.make_idea(status=Idea.Status.PUBLISHED)
        idea.published_at = timezone.now()
        idea.save()
        self.as_founder()

        with patch("ideas.views.run_in_background") as background:
            self.client.patch(
                reverse("idea-detail", args=[idea.id]),
                {"problem": "A sharper problem statement."},
                format="json",
            )

        background.assert_called_once()
        idea.refresh_from_db()
        # leaves the marketplace until the founder reviews the new report
        self.assertEqual(idea.status, Idea.Status.PROCESSING)
        self.assertIsNone(idea.published_at)

    def test_only_the_owner_can_edit_or_delete(self):
        idea = self.make_idea()
        self.as_investor()
        url = reverse("idea-detail", args=[idea.id])

        self.assertEqual(
            self.client.patch(url, {"title": "x"}, format="json").status_code,
            403,
        )
        self.assertEqual(self.client.delete(url).status_code, 403)
        self.assertTrue(Idea.objects.filter(pk=idea.pk).exists())


class DashboardStatsTests(IdeaTestCase):
    def test_counts_reflect_the_founders_own_ideas(self):
        self.make_idea(status=Idea.Status.PUBLISHED)
        self.make_idea(status=Idea.Status.DRAFT)
        self.make_idea(status=Idea.Status.FAILED, with_report=False)
        self.as_founder()

        stats = self.client.get(reverse("dashboard-stats")).json()

        self.assertEqual(stats["total_ideas"], 3)
        self.assertEqual(stats["published"], 1)
        self.assertEqual(stats["drafts"], 1)
        self.assertEqual(stats["total_views"], 0)
