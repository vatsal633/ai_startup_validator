from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase

from connections.models import ConnectionRequest
from ideas.models import Idea, IdeaReport
from notifications.models import Notification

User = get_user_model()


class ConnectionTestCase(APITestCase):
    def setUp(self):
        self.founder = User.objects.create_user(
            email="founder@test.com", password="s3cret-pass-99",
            first_name="Ada", last_name="F", role="founder",
        )
        self.investor = User.objects.create_user(
            email="investor@test.com", password="s3cret-pass-99",
            first_name="Ivan", last_name="I", role="investor",
        )
        self.idea = Idea.objects.create(
            founder=self.founder, title="FarmSense AI",
            idea="Detect crop disease from a photo.", industry="AgriTech",
            problem="Yield loss.", solution="Image classification.",
            target_customer="Farmers.", differentiator="Offline.",
            country="India", business_model="freemium", stage="mvp",
            funding_requirement=2500000, status=Idea.Status.PUBLISHED,
        )


class RequestTests(ConnectionTestCase):
    def url(self):
        return reverse("connection-request", args=[self.idea.id])

    def test_investor_can_request_access_with_an_empty_body(self):
        """idea and investor come from the URL and session, not the payload."""
        self.client.force_authenticate(user=self.investor)

        response = self.client.post(self.url(), {}, format="json")

        self.assertEqual(response.status_code, 201)
        self.assertTrue(
            ConnectionRequest.objects.filter(idea=self.idea, investor=self.investor).exists()
        )

    def test_a_posted_idea_or_investor_cannot_override_the_real_ones(self):
        other = Idea.objects.create(
            founder=self.founder, title="Other", idea="x", industry="x",
            problem="x", solution="x", target_customer="x", differentiator="x",
            country="India", business_model="other", stage="idea",
            funding_requirement=1, status=Idea.Status.PUBLISHED,
        )
        self.client.force_authenticate(user=self.investor)

        self.client.post(
            self.url(), {"idea": other.id, "investor": self.founder.id}, format="json"
        )

        connection = ConnectionRequest.objects.get()
        self.assertEqual(connection.idea_id, self.idea.id)
        self.assertEqual(connection.investor_id, self.investor.id)

    def test_a_duplicate_request_is_rejected(self):
        self.client.force_authenticate(user=self.investor)
        self.client.post(self.url(), {}, format="json")

        response = self.client.post(self.url(), {}, format="json")

        self.assertEqual(response.status_code, 400)
        self.assertEqual(ConnectionRequest.objects.count(), 1)

    def test_a_founder_cannot_request_a_connection(self):
        self.client.force_authenticate(user=self.founder)

        self.assertEqual(self.client.post(self.url(), {}, format="json").status_code, 403)

    def test_requesting_notifies_the_founder_using_the_real_title(self):
        self.client.force_authenticate(user=self.investor)
        self.client.post(self.url(), {}, format="json")

        notification = Notification.objects.get(recipient=self.founder)
        self.assertIn("FarmSense AI", notification.message)
        self.assertEqual(
            notification.notification_type,
            Notification.NotificationType.CONNECTION_REQUESTED,
        )


class RespondTests(ConnectionTestCase):
    def setUp(self):
        super().setUp()
        self.connection = ConnectionRequest.objects.create(
            idea=self.idea, investor=self.investor
        )

    def url(self, action):
        return reverse("connection-respond", args=[self.connection.id, action])

    def test_founder_can_accept(self):
        self.client.force_authenticate(user=self.founder)

        response = self.client.post(self.url("accept"))

        self.assertEqual(response.status_code, 200)
        self.connection.refresh_from_db()
        self.assertEqual(self.connection.status, ConnectionRequest.Status.ACCEPTED)
        self.assertIsNotNone(self.connection.accepted_at)

    def test_founder_can_decline(self):
        self.client.force_authenticate(user=self.founder)

        self.client.post(self.url("decline"))

        self.connection.refresh_from_db()
        self.assertEqual(self.connection.status, ConnectionRequest.Status.DECLINED)

    def test_cannot_respond_twice(self):
        self.client.force_authenticate(user=self.founder)
        self.client.post(self.url("accept"))

        response = self.client.post(self.url("decline"))

        self.assertEqual(response.status_code, 400)
        self.connection.refresh_from_db()
        self.assertEqual(self.connection.status, ConnectionRequest.Status.ACCEPTED)

    def test_an_unknown_action_is_rejected(self):
        self.client.force_authenticate(user=self.founder)

        self.assertEqual(self.client.post(self.url("approve")).status_code, 400)

    def test_only_the_idea_owner_can_respond(self):
        self.client.force_authenticate(user=self.investor)

        self.assertEqual(self.client.post(self.url("accept")).status_code, 403)

    def test_responding_notifies_the_investor(self):
        self.client.force_authenticate(user=self.founder)
        self.client.post(self.url("accept"))

        notification = Notification.objects.get(recipient=self.investor)
        self.assertEqual(
            notification.notification_type,
            Notification.NotificationType.CONNECTION_ACCEPTED,
        )
        self.assertIn("FarmSense AI", notification.message)


class InvestorProfileTests(ConnectionTestCase):
    """What a founder learns about an investor, and when."""

    def setUp(self):
        super().setUp()
        self.investor.bio = "Angel investing in Indian climate tech."
        self.investor.location = "Bengaluru, India"
        self.investor.linkedin = "https://linkedin.com/in/ivan"
        self.investor.save()
        self.connection = ConnectionRequest.objects.create(
            idea=self.idea, investor=self.investor
        )

    def founder_sees(self):
        self.client.force_authenticate(user=self.founder)
        return self.client.get(reverse("my-connections")).json()["results"][0][
            "investor_profile"
        ]

    def test_the_founder_sees_enough_to_judge_a_pending_request(self):
        profile = self.founder_sees()

        self.assertEqual(profile["name"], "Ivan I")
        self.assertEqual(profile["location"], "Bengaluru, India")
        self.assertIn("climate tech", profile["bio"])
        self.assertEqual(profile["linkedin"], "https://linkedin.com/in/ivan")

    def test_the_email_is_withheld_while_the_request_is_pending(self):
        """Accepting is what unlocks contact, so the email waits for it."""
        self.assertNotIn("email", self.founder_sees())

    def test_the_email_appears_once_accepted(self):
        self.connection.status = ConnectionRequest.Status.ACCEPTED
        self.connection.save()

        self.assertEqual(self.founder_sees()["email"], "investor@test.com")

    def test_the_email_stays_hidden_on_a_declined_request(self):
        self.connection.status = ConnectionRequest.Status.DECLINED
        self.connection.save()

        self.assertNotIn("email", self.founder_sees())

    def test_an_investor_always_sees_their_own_email(self):
        self.client.force_authenticate(user=self.investor)

        profile = self.client.get(reverse("my-connections")).json()["results"][0][
            "investor_profile"
        ]

        self.assertEqual(profile["email"], "investor@test.com")

    def test_accepting_returns_the_email_straight_away(self):
        """The page shows the contact details without needing a reload."""
        self.client.force_authenticate(user=self.founder)

        body = self.client.post(
            reverse("connection-respond", args=[self.connection.id, "accept"])
        ).json()

        self.assertEqual(body["investor_profile"]["email"], "investor@test.com")


class FounderProfileTests(ConnectionTestCase):
    """What an investor learns about a founder, and when — the mirror of
    InvestorProfileTests."""

    def setUp(self):
        super().setUp()
        self.founder.bio = "Building per-flat rooftop solar billing."
        self.founder.location = "Pune, India"
        self.founder.linkedin = "https://linkedin.com/in/ada"
        self.founder.save()
        self.connection = ConnectionRequest.objects.create(
            idea=self.idea, investor=self.investor
        )

    def investor_sees(self):
        self.client.force_authenticate(user=self.investor)
        return self.client.get(reverse("my-connections")).json()["results"][0][
            "founder_profile"
        ]

    def test_the_investor_sees_the_founder_profile(self):
        profile = self.investor_sees()

        self.assertEqual(profile["name"], "Ada F")
        self.assertEqual(profile["location"], "Pune, India")

    def test_the_founder_email_is_withheld_while_pending(self):
        self.assertNotIn("email", self.investor_sees())

    def test_the_founder_email_appears_once_accepted(self):
        """Accepting is what gives the investor a way to make contact."""
        self.connection.status = ConnectionRequest.Status.ACCEPTED
        self.connection.save()

        self.assertEqual(self.investor_sees()["email"], "founder@test.com")

    def test_the_founder_email_stays_hidden_when_declined(self):
        self.connection.status = ConnectionRequest.Status.DECLINED
        self.connection.save()

        self.assertNotIn("email", self.investor_sees())

    def test_a_founder_always_sees_their_own_email(self):
        self.client.force_authenticate(user=self.founder)

        profile = self.client.get(reverse("my-connections")).json()["results"][0][
            "founder_profile"
        ]

        self.assertEqual(profile["email"], "founder@test.com")


class IdeaSummaryTests(ConnectionTestCase):
    """The investor's list renders the idea without a second request."""

    def setUp(self):
        super().setUp()
        IdeaReport.objects.create(idea=self.idea, ai_validation_score=87.0)
        ConnectionRequest.objects.create(idea=self.idea, investor=self.investor)
        self.client.force_authenticate(user=self.investor)

    def test_summary_carries_the_fields_the_card_shows(self):
        summary = self.client.get(reverse("my-connections")).json()["results"][0][
            "idea_summary"
        ]

        self.assertEqual(summary["industry"], "AgriTech")
        self.assertEqual(summary["stage_display"], "MVP")
        self.assertEqual(summary["country"], "India")
        self.assertEqual(summary["ai_validation_score"], 87.0)

    def test_score_is_null_when_there_is_no_report(self):
        IdeaReport.objects.all().delete()

        summary = self.client.get(reverse("my-connections")).json()["results"][0][
            "idea_summary"
        ]

        self.assertIsNone(summary["ai_validation_score"])


class ListFilterTests(ConnectionTestCase):
    def setUp(self):
        super().setUp()
        self.pending = ConnectionRequest.objects.create(
            idea=self.idea, investor=self.investor
        )
        other_investor = User.objects.create_user(
            email="second@test.com", password="s3cret-pass-99",
            first_name="Sara", last_name="S", role="investor",
        )
        self.accepted = ConnectionRequest.objects.create(
            idea=self.idea, investor=other_investor,
            status=ConnectionRequest.Status.ACCEPTED,
        )
        self.client.force_authenticate(user=self.founder)

    def test_status_filter(self):
        url = reverse("my-connections")

        self.assertEqual(self.client.get(f"{url}?status=pending").json()["count"], 1)
        self.assertEqual(self.client.get(f"{url}?status=accepted").json()["count"], 1)
        self.assertEqual(self.client.get(url).json()["count"], 2)

    def test_an_unknown_status_filter_is_ignored(self):
        url = f"{reverse('my-connections')}?status=not-a-status"

        self.assertEqual(self.client.get(url).json()["count"], 2)

    def test_idea_filter(self):
        url = f"{reverse('my-connections')}?idea={self.idea.id}"

        self.assertEqual(self.client.get(url).json()["count"], 2)

    def test_a_non_numeric_idea_filter_is_ignored(self):
        url = f"{reverse('my-connections')}?idea=abc"

        self.assertEqual(self.client.get(url).json()["count"], 2)

    def test_the_list_carries_the_idea_title_and_status(self):
        row = self.client.get(reverse("my-connections")).json()["results"][0]

        self.assertEqual(row["idea_title"], "FarmSense AI")
        self.assertEqual(row["idea_status"], "published")


class ListTests(ConnectionTestCase):
    def setUp(self):
        super().setUp()
        self.connection = ConnectionRequest.objects.create(
            idea=self.idea, investor=self.investor
        )

    def test_a_founder_sees_requests_on_their_own_ideas(self):
        self.client.force_authenticate(user=self.founder)

        body = self.client.get(reverse("my-connections")).json()

        self.assertEqual(body["count"], 1)
        self.assertEqual(body["results"][0]["idea_title"], "FarmSense AI")

    def test_an_investor_sees_their_own_requests(self):
        self.client.force_authenticate(user=self.investor)

        self.assertEqual(self.client.get(reverse("my-connections")).json()["count"], 1)

    def test_an_unrelated_user_sees_nothing(self):
        outsider = User.objects.create_user(
            email="other@test.com", password="s3cret-pass-99", role="investor"
        )
        self.client.force_authenticate(user=outsider)

        self.assertEqual(self.client.get(reverse("my-connections")).json()["count"], 0)
