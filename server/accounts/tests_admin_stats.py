from datetime import timedelta

from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APITestCase

from connections.models import ConnectionRequest
from ideas.models import Idea, IdeaReport

User = get_user_model()

PASSWORD = "s3cret-pass-99"


class AdminStatsTestCase(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_superuser(
            email="admin@test.com", password=PASSWORD
        )
        self.founder = User.objects.create_user(
            email="founder@test.com", password=PASSWORD, role="founder"
        )
        self.investor = User.objects.create_user(
            email="investor@test.com", password=PASSWORD, role="investor"
        )
        self.url = reverse("admin-stats")

    def make_idea(self, *, status=Idea.Status.PUBLISHED, score=80.0, title="Idea",
                  industry="SaaS", stage="mvp"):
        idea = Idea.objects.create(
            founder=self.founder, title=title, idea="x", industry=industry,
            problem="x", solution="x", target_customer="x", differentiator="x",
            country="India", business_model="subscription", stage=stage,
            funding_requirement=1000000, status=status,
        )
        if score is not None:
            IdeaReport.objects.create(idea=idea, ai_validation_score=score)
        if status == Idea.Status.PUBLISHED:
            idea.published_at = timezone.now()
            idea.save(update_fields=["published_at"])
        return idea


class AccessTests(AdminStatsTestCase):
    def test_an_admin_can_read_the_stats(self):
        self.client.force_authenticate(user=self.admin)

        self.assertEqual(self.client.get(self.url).status_code, 200)

    def test_a_founder_cannot(self):
        self.client.force_authenticate(user=self.founder)

        self.assertEqual(self.client.get(self.url).status_code, 403)

    def test_an_investor_cannot(self):
        self.client.force_authenticate(user=self.investor)

        self.assertEqual(self.client.get(self.url).status_code, 403)

    def test_an_anonymous_visitor_cannot(self):
        self.assertEqual(self.client.get(self.url).status_code, 401)

    def test_is_staff_alone_is_not_enough(self):
        """The gate is the role field, not Django's is_staff flag."""
        staff = User.objects.create_user(
            email="staff@test.com", password=PASSWORD, role="founder"
        )
        staff.is_staff = True
        staff.save()
        self.client.force_authenticate(user=staff)

        self.assertEqual(self.client.get(self.url).status_code, 403)


class PipelineSectionTests(AdminStatsTestCase):
    def setUp(self):
        super().setUp()
        self.client.force_authenticate(user=self.admin)

    def test_counts_successes_and_failures(self):
        self.make_idea(title="Good", score=80.0)
        self.make_idea(title="Bad", status=Idea.Status.FAILED, score=None)

        pipeline = self.client.get(self.url).json()["pipeline"]

        self.assertEqual(pipeline["analyses_succeeded"], 1)
        self.assertEqual(pipeline["analyses_failed"], 1)
        self.assertEqual(pipeline["failure_rate_percent"], 50.0)

    def test_a_recent_processing_idea_is_not_counted_as_stuck(self):
        self.make_idea(title="Running", status=Idea.Status.PROCESSING, score=None)

        pipeline = self.client.get(self.url).json()["pipeline"]

        self.assertEqual(pipeline["currently_processing"], 1)
        self.assertEqual(pipeline["stuck_processing"], 0)

    def test_an_old_processing_idea_is_counted_as_stuck(self):
        idea = self.make_idea(title="Stranded", status=Idea.Status.PROCESSING, score=None)
        Idea.objects.filter(pk=idea.pk).update(
            created_at=timezone.now() - timedelta(hours=3)
        )

        self.assertEqual(self.client.get(self.url).json()["pipeline"]["stuck_processing"], 1)

    def test_the_score_distribution_covers_every_band(self):
        self.make_idea(title="A", score=81.0)

        pipeline = self.client.get(self.url).json()["pipeline"]

        # ten bands, always present, so a chart has no gaps
        self.assertEqual(len(pipeline["score_distribution"]), 10)
        self.assertEqual(pipeline["score_distribution"]["80-89"], 1)
        self.assertEqual(pipeline["score_distribution"]["0-9"], 0)

    def test_a_perfect_score_lands_in_the_top_band(self):
        """100 must not fall off the end of the last band."""
        self.make_idea(title="Perfect", score=100.0)

        distribution = self.client.get(self.url).json()["pipeline"]["score_distribution"]

        self.assertEqual(distribution["90-99"], 1)

    def test_spread_reveals_clustering(self):
        for index, score in enumerate([74.0, 77.0, 79.0]):
            self.make_idea(title=f"Idea {index}", score=score)

        pipeline = self.client.get(self.url).json()["pipeline"]

        self.assertEqual(pipeline["score_spread"], 5.0)
        self.assertEqual(pipeline["scored_reports"], 3)

    def test_score_fields_are_null_with_no_reports(self):
        pipeline = self.client.get(self.url).json()["pipeline"]

        self.assertIsNone(pipeline["score_average"])
        self.assertIsNone(pipeline["score_spread"])


class FunnelSectionTests(AdminStatsTestCase):
    def setUp(self):
        super().setUp()
        self.client.force_authenticate(user=self.admin)

    def test_published_ideas_with_no_requests_are_counted(self):
        self.make_idea(title="Ignored")
        wanted = self.make_idea(title="Wanted")
        ConnectionRequest.objects.create(idea=wanted, investor=self.investor)

        funnel = self.client.get(self.url).json()["funnel"]

        self.assertEqual(funnel["published_ideas"], 2)
        self.assertEqual(funnel["published_with_no_requests"], 1)

    def test_accept_rate_ignores_pending_requests(self):
        accepted = self.make_idea(title="A")
        declined = self.make_idea(title="B")
        pending = self.make_idea(title="C")
        other = User.objects.create_user(
            email="second@test.com", password=PASSWORD, role="investor"
        )

        ConnectionRequest.objects.create(
            idea=accepted, investor=self.investor,
            status=ConnectionRequest.Status.ACCEPTED, accepted_at=timezone.now(),
        )
        ConnectionRequest.objects.create(
            idea=declined, investor=self.investor,
            status=ConnectionRequest.Status.DECLINED,
        )
        ConnectionRequest.objects.create(idea=pending, investor=other)

        funnel = self.client.get(self.url).json()["funnel"]

        # one accepted of two answered, with the pending one excluded
        self.assertEqual(funnel["accept_rate_percent"], 50.0)

    def test_accept_rate_is_null_when_nothing_has_been_answered(self):
        idea = self.make_idea()
        ConnectionRequest.objects.create(idea=idea, investor=self.investor)

        self.assertIsNone(self.client.get(self.url).json()["funnel"]["accept_rate_percent"])

    def test_median_time_to_accept(self):
        idea = self.make_idea()
        request = ConnectionRequest.objects.create(
            idea=idea, investor=self.investor,
            status=ConnectionRequest.Status.ACCEPTED,
        )
        ConnectionRequest.objects.filter(pk=request.pk).update(
            requested_at=timezone.now() - timedelta(hours=6),
            accepted_at=timezone.now(),
        )

        funnel = self.client.get(self.url).json()["funnel"]

        self.assertAlmostEqual(funnel["median_hours_to_accept"], 6.0, places=0)

    def test_stale_pending_requests_are_surfaced(self):
        idea = self.make_idea()
        request = ConnectionRequest.objects.create(idea=idea, investor=self.investor)
        ConnectionRequest.objects.filter(pk=request.pk).update(
            requested_at=timezone.now() - timedelta(days=10)
        )

        self.assertEqual(self.client.get(self.url).json()["funnel"]["pending_over_7_days"], 1)


class CompositionTests(AdminStatsTestCase):
    def setUp(self):
        super().setUp()
        self.client.force_authenticate(user=self.admin)

    def test_marketplace_counts_only_published_ideas(self):
        self.make_idea(title="Live", industry="Fintech")
        self.make_idea(title="Draft", industry="Healthtech", status=Idea.Status.DRAFT)

        marketplace = self.client.get(self.url).json()["marketplace"]

        self.assertEqual(marketplace["by_industry"], {"Fintech": 1})

    def test_overview_breaks_users_down_by_role(self):
        overview = self.client.get(self.url).json()["overview"]

        self.assertEqual(overview["users_by_role"]["admin"], 1)
        self.assertEqual(overview["users_by_role"]["founder"], 1)
        self.assertEqual(overview["users_by_role"]["investor"], 1)

    def test_recently_published_lists_newest_first(self):
        self.make_idea(title="Older")
        newer = self.make_idea(title="Newer")
        Idea.objects.filter(pk=newer.pk).update(published_at=timezone.now() + timedelta(hours=1))

        recent = self.client.get(self.url).json()["moderation"]["recently_published"]

        self.assertEqual(recent[0]["title"], "Newer")

    def test_low_scoring_published_ideas_are_counted(self):
        self.make_idea(title="Weak", score=31.0)
        self.make_idea(title="Strong", score=88.0)

        moderation = self.client.get(self.url).json()["moderation"]

        self.assertEqual(moderation["low_scoring_published"], 1)

    def test_empty_platform_does_not_error(self):
        """Every section must render on a database with no ideas at all."""
        body = self.client.get(self.url).json()

        self.assertEqual(body["overview"]["ideas_total"], 0)
        self.assertEqual(body["pipeline"]["failure_rate_percent"], 0.0)
        self.assertEqual(body["funnel"]["published_with_no_requests"], 0)
        self.assertEqual(body["marketplace"]["by_industry"], {})
        self.assertEqual(body["moderation"]["recently_published"], [])
