from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase

from connections.models import ConnectionRequest
from ideas.models import Idea
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
