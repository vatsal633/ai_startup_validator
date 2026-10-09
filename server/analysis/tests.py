import json
from datetime import timedelta
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone

from analysis.report_generator import REPORT_JSON_SCHEMA, build_prompt, generate_report
from analysis.tasks import generate_report_for_idea, recover_stale_processing
from ideas.models import Idea, IdeaReport

User = get_user_model()


def make_idea(founder, **overrides):
    fields = dict(
        title="FarmSense AI", idea="Detect crop disease from a photo.",
        industry="AgriTech", problem="Yield loss.", solution="Image classification.",
        target_customer="Farmers.", differentiator="Offline.", country="India",
        business_model="freemium", stage="mvp", funding_requirement=2500000,
        competitors="Plantix",
    )
    fields.update(overrides)
    return Idea.objects.create(founder=founder, **fields)


class PromptTests(TestCase):
    def setUp(self):
        self.founder = User.objects.create_user(
            email="founder@test.com", password="s3cret-pass-99", role="founder"
        )

    def test_the_prompt_carries_the_idea_details(self):
        prompt = build_prompt(make_idea(self.founder))

        for expected in ("FarmSense AI", "AgriTech", "Plantix", "India"):
            self.assertIn(expected, prompt)

    def test_the_prompt_uses_display_labels_not_raw_values(self):
        """"freemium" means nothing to the model; "Freemium" does."""
        prompt = build_prompt(make_idea(self.founder))

        self.assertIn("Freemium", prompt)
        self.assertIn("MVP", prompt)

    def test_the_schema_requires_every_field_the_report_stores(self):
        required = set(REPORT_JSON_SCHEMA["required"])

        self.assertIn("ai_validation_score", required)
        self.assertIn("market_size", required)
        self.assertEqual(
            set(REPORT_JSON_SCHEMA["properties"]) - required,
            set(),
            "every schema property should be required, or the model may omit it",
        )


class GenerateReportTests(TestCase):
    def setUp(self):
        self.founder = User.objects.create_user(
            email="founder@test.com", password="s3cret-pass-99", role="founder"
        )
        self.idea = make_idea(self.founder)

    def test_parses_a_json_response(self):
        payload = {"executive_summary": "Looks good.", "ai_validation_score": 81}

        with patch("analysis.report_generator.client") as client:
            client.interactions.create.return_value.output_text = json.dumps(payload)
            result = generate_report(self.idea)

        self.assertEqual(result["ai_validation_score"], 81)

    def test_asks_for_schema_enforced_json(self):
        with patch("analysis.report_generator.client") as client:
            client.interactions.create.return_value.output_text = "{}"
            generate_report(self.idea)

        response_format = client.interactions.create.call_args.kwargs["response_format"]
        self.assertEqual(response_format["mime_type"], "application/json")
        self.assertEqual(response_format["schema"], REPORT_JSON_SCHEMA)

    def test_an_empty_response_raises(self):
        with patch("analysis.report_generator.client") as client:
            client.interactions.create.return_value.output_text = "   "

            with self.assertRaises(ValueError):
                generate_report(self.idea)

    def test_a_non_json_response_raises(self):
        with patch("analysis.report_generator.client") as client:
            client.interactions.create.return_value.output_text = "Sorry, I can't."

            with self.assertRaises(json.JSONDecodeError):
                generate_report(self.idea)


class BackgroundTaskTests(TestCase):
    def setUp(self):
        self.founder = User.objects.create_user(
            email="founder@test.com", password="s3cret-pass-99", role="founder"
        )
        self.idea = make_idea(self.founder, status=Idea.Status.PROCESSING)

    def test_success_moves_the_idea_to_draft(self):
        with patch("ideas.views.generate_report", return_value={"ai_validation_score": 72}):
            generate_report_for_idea(self.idea.id)

        self.idea.refresh_from_db()
        self.assertEqual(self.idea.status, Idea.Status.DRAFT)
        self.assertEqual(self.idea.report.ai_validation_score, 72)

    def test_failure_moves_the_idea_to_failed(self):
        with patch("ideas.views.generate_report", side_effect=RuntimeError("boom")):
            generate_report_for_idea(self.idea.id)

        self.idea.refresh_from_db()
        self.assertEqual(self.idea.status, Idea.Status.FAILED)

    def test_a_deleted_idea_is_a_no_op_rather_than_a_crash(self):
        idea_id = self.idea.id
        self.idea.delete()

        generate_report_for_idea(idea_id)  # must not raise

    def test_regenerating_replaces_the_previous_report(self):
        IdeaReport.objects.create(idea=self.idea, ai_validation_score=10)

        with patch("ideas.views.generate_report", return_value={"ai_validation_score": 90}):
            generate_report_for_idea(self.idea.id)

        self.assertEqual(IdeaReport.objects.filter(idea=self.idea).count(), 1)
        self.assertEqual(IdeaReport.objects.get(idea=self.idea).ai_validation_score, 90)


class StaleRecoveryTests(TestCase):
    """A thread dies with its process, so a restart can strand an idea."""

    def setUp(self):
        self.founder = User.objects.create_user(
            email="founder@test.com", password="s3cret-pass-99", role="founder"
        )

    def test_an_old_processing_idea_is_marked_failed(self):
        idea = make_idea(self.founder, status=Idea.Status.PROCESSING)
        Idea.objects.filter(pk=idea.pk).update(
            created_at=timezone.now() - timedelta(hours=2)
        )

        self.assertEqual(recover_stale_processing(), 1)
        idea.refresh_from_db()
        self.assertEqual(idea.status, Idea.Status.FAILED)

    def test_a_recent_processing_idea_is_left_alone(self):
        idea = make_idea(self.founder, status=Idea.Status.PROCESSING)

        self.assertEqual(recover_stale_processing(), 0)
        idea.refresh_from_db()
        self.assertEqual(idea.status, Idea.Status.PROCESSING)

    def test_other_statuses_are_untouched(self):
        idea = make_idea(self.founder, status=Idea.Status.PUBLISHED)
        Idea.objects.filter(pk=idea.pk).update(
            created_at=timezone.now() - timedelta(hours=2)
        )

        recover_stale_processing()

        idea.refresh_from_db()
        self.assertEqual(idea.status, Idea.Status.PUBLISHED)
