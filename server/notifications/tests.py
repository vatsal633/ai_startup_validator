from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase

from ideas.models import Idea
from notifications.models import Notification

User = get_user_model()


class NotificationTests(APITestCase):
    def setUp(self):
        self.founder = User.objects.create_user(
            email="founder@test.com", password="s3cret-pass-99", role="founder"
        )
        self.other = User.objects.create_user(
            email="other@test.com", password="s3cret-pass-99", role="investor"
        )
        self.idea = Idea.objects.create(
            founder=self.founder, title="FarmSense AI",
            idea="Detect crop disease.", industry="AgriTech",
            problem="x", solution="x", target_customer="x", differentiator="x",
            country="India", business_model="freemium", stage="mvp",
            funding_requirement=2500000,
        )
        self.unread = Notification.objects.create(
            recipient=self.founder,
            notification_type=Notification.NotificationType.CONNECTION_REQUESTED,
            related_idea=self.idea, message="Someone is interested",
        )
        self.read = Notification.objects.create(
            recipient=self.founder,
            notification_type=Notification.NotificationType.CONNECTION_ACCEPTED,
            related_idea=self.idea, message="Accepted", is_read=True,
        )
        # belongs to someone else; must never show up for the founder
        Notification.objects.create(
            recipient=self.other,
            notification_type=Notification.NotificationType.CONNECTION_DECLINED,
            message="Not yours",
        )
        self.client.force_authenticate(user=self.founder)

    def test_lists_only_the_recipients_own_notifications(self):
        body = self.client.get(reverse("notification-list")).json()

        self.assertEqual(body["count"], 2)
        self.assertNotIn("Not yours", [row["message"] for row in body["results"]])

    def test_exposes_the_idea_title(self):
        body = self.client.get(reverse("notification-list")).json()

        self.assertEqual(body["results"][0]["idea_title"], "FarmSense AI")

    def test_unread_filter(self):
        body = self.client.get(f"{reverse('notification-list')}?unread=true").json()

        self.assertEqual(body["count"], 1)
        self.assertEqual(body["results"][0]["id"], self.unread.id)

    def test_type_filter(self):
        url = f"{reverse('notification-list')}?type=connection_accepted"

        self.assertEqual(self.client.get(url).json()["count"], 1)

    def test_an_unknown_type_filter_is_ignored(self):
        url = f"{reverse('notification-list')}?type=not-a-type"

        self.assertEqual(self.client.get(url).json()["count"], 2)

    def test_unread_count(self):
        body = self.client.get(reverse("notification-unread-count")).json()

        self.assertEqual(body["unread_count"], 1)

    def test_mark_one_read(self):
        response = self.client.post(
            reverse("notification-mark-read", args=[self.unread.id])
        )

        self.assertEqual(response.status_code, 200)
        self.unread.refresh_from_db()
        self.assertTrue(self.unread.is_read)

    def test_cannot_mark_someone_elses_notification_read(self):
        theirs = Notification.objects.get(recipient=self.other)

        response = self.client.post(reverse("notification-mark-read", args=[theirs.id]))

        self.assertEqual(response.status_code, 404)
        theirs.refresh_from_db()
        self.assertFalse(theirs.is_read)

    def test_mark_all_read_clears_the_badge(self):
        response = self.client.post(reverse("notification-mark-all-read"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["unread_count"], 0)
        self.assertEqual(
            Notification.objects.filter(recipient=self.founder, is_read=False).count(), 0
        )

    def test_mark_all_read_leaves_other_users_alone(self):
        self.client.post(reverse("notification-mark-all-read"))

        self.assertFalse(Notification.objects.get(recipient=self.other).is_read)

    def test_requires_authentication(self):
        self.client.force_authenticate(user=None)

        self.assertEqual(self.client.get(reverse("notification-list")).status_code, 401)
