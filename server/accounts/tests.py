from django.contrib.auth import get_user_model
from django.core import mail
from django.urls import reverse
from rest_framework.test import APITestCase

User = get_user_model()

PASSWORD = "s3cret-pass-99"


class RegistrationTests(APITestCase):
    def register(self, **overrides):
        payload = {
            "first_name": "Ada",
            "last_name": "F",
            "email": "founder@test.com",
            "password": PASSWORD,
            "role": "founder",
            **overrides,
        }
        return self.client.post(reverse("register"), payload, format="json")

    def test_accepts_the_display_cased_role_the_signup_form_sends(self):
        """The form posts "Founder"; the model stores "founder"."""
        response = self.register(role="Founder")

        self.assertEqual(response.status_code, 201)
        self.assertEqual(User.objects.get(email="founder@test.com").role, "founder")

    def test_accepts_lowercase_roles(self):
        self.assertEqual(self.register(role="investor").status_code, 201)

    def test_rejects_self_registration_as_admin(self):
        response = self.register(role="admin")

        self.assertEqual(response.status_code, 400)
        self.assertFalse(User.objects.filter(email="founder@test.com").exists())

    def test_rejects_an_unknown_role(self):
        self.assertEqual(self.register(role="superuser").status_code, 400)

    def test_rejects_a_common_password(self):
        self.assertEqual(self.register(password="password").status_code, 400)

    def test_rejects_a_duplicate_email(self):
        self.register()
        self.assertEqual(self.register().status_code, 400)

    def test_the_password_is_hashed(self):
        self.register()
        user = User.objects.get(email="founder@test.com")

        self.assertNotEqual(user.password, PASSWORD)
        self.assertTrue(user.check_password(PASSWORD))


class LoginTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="founder@test.com", password=PASSWORD, role="founder"
        )

    def test_login_returns_both_tokens(self):
        response = self.client.post(
            reverse("login"), {"email": "founder@test.com", "password": PASSWORD}, format="json"
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.json())
        self.assertIn("refresh", response.json())

    def test_the_access_token_carries_the_role(self):
        """The frontend reads the role from the JWT instead of an extra call."""
        from jwt import decode

        response = self.client.post(
            reverse("login"), {"email": "founder@test.com", "password": PASSWORD}, format="json"
        )
        claims = decode(response.json()["access"], options={"verify_signature": False})

        self.assertEqual(claims["role"], "founder")
        self.assertEqual(claims["email"], "founder@test.com")

    def test_a_wrong_password_is_rejected(self):
        response = self.client.post(
            reverse("login"), {"email": "founder@test.com", "password": "wrong"}, format="json"
        )

        self.assertEqual(response.status_code, 401)


class ProfileTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="founder@test.com", password=PASSWORD,
            first_name="Ada", last_name="F", role="founder",
        )
        self.client.force_authenticate(user=self.user)

    def test_me_exposes_the_profile_fields(self):
        body = self.client.get(reverse("me")).json()

        for field in ("bio", "phone", "location", "linkedin", "website", "role"):
            self.assertIn(field, body)

    def test_patch_updates_the_profile(self):
        response = self.client.patch(
            reverse("me"), {"location": "Pune, India", "phone": "+91 99999 11111"}, format="json"
        )

        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertEqual(self.user.location, "Pune, India")

    def test_patch_cannot_escalate_the_role_or_change_the_email(self):
        self.client.patch(
            reverse("me"), {"role": "admin", "email": "hack@test.com"}, format="json"
        )
        self.user.refresh_from_db()

        self.assertEqual(self.user.role, "founder")
        self.assertEqual(self.user.email, "founder@test.com")

    def test_me_requires_authentication(self):
        self.client.force_authenticate(user=None)

        self.assertEqual(self.client.get(reverse("me")).status_code, 401)


class PasswordChangeTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="founder@test.com", password=PASSWORD, role="founder"
        )
        self.client.force_authenticate(user=self.user)

    def change(self, current, new):
        return self.client.post(
            reverse("password_change"),
            {"current_password": current, "new_password": new},
            format="json",
        )

    def test_changes_the_password_with_the_right_current_one(self):
        response = self.change(PASSWORD, "An0ther-pass-77")

        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("An0ther-pass-77"))

    def test_rejects_a_wrong_current_password(self):
        response = self.change("not-my-password", "An0ther-pass-77")

        self.assertEqual(response.status_code, 400)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password(PASSWORD))

    def test_rejects_reusing_the_same_password(self):
        self.assertEqual(self.change(PASSWORD, PASSWORD).status_code, 400)

    def test_rejects_a_weak_new_password(self):
        self.assertEqual(self.change(PASSWORD, "password").status_code, 400)


class PasswordResetTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="founder@test.com", password=PASSWORD, role="founder"
        )

    def test_sends_a_reset_email_for_a_known_address(self):
        response = self.client.post(
            reverse("password_reset"), {"email": "founder@test.com"}, format="json"
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(mail.outbox), 1)

    def test_an_unknown_address_gets_the_same_answer_and_no_email(self):
        """Otherwise the endpoint tells an attacker which addresses exist."""
        known = self.client.post(
            reverse("password_reset"), {"email": "founder@test.com"}, format="json"
        )
        mail.outbox.clear()
        unknown = self.client.post(
            reverse("password_reset"), {"email": "nobody@test.com"}, format="json"
        )

        self.assertEqual(known.status_code, unknown.status_code)
        self.assertEqual(known.json(), unknown.json())
        self.assertEqual(len(mail.outbox), 0)

    def test_a_reset_link_sets_a_new_password_once(self):
        from django.contrib.auth.tokens import default_token_generator
        from django.utils.encoding import force_bytes
        from django.utils.http import urlsafe_base64_encode

        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        token = default_token_generator.make_token(self.user)
        payload = {"uid": uid, "token": token, "new_password": "An0ther-pass-77"}

        first = self.client.post(reverse("password_reset_confirm"), payload, format="json")
        self.assertEqual(first.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("An0ther-pass-77"))

        # the token is spent — the password change invalidates it
        second = self.client.post(reverse("password_reset_confirm"), payload, format="json")
        self.assertEqual(second.status_code, 400)

    def test_an_invalid_token_is_rejected(self):
        from django.utils.encoding import force_bytes
        from django.utils.http import urlsafe_base64_encode

        response = self.client.post(
            reverse("password_reset_confirm"),
            {
                "uid": urlsafe_base64_encode(force_bytes(self.user.pk)),
                "token": "not-a-real-token",
                "new_password": "An0ther-pass-77",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
