"""Running the Gemini report off the request/response cycle.

A Gemini call takes tens of seconds on a good day, and minutes when the API
is rate-limiting and the SDK backs off. Doing that inline holds the HTTP
request open for the whole time, so submitting an idea returns immediately
and the work continues in a background thread.

A thread is deliberate rather than Celery: this project has no broker, and
adding Redis plus a worker process is a lot of infrastructure for one call.
The trade-off is that work does not survive a process restart, which
`recover_stale_processing` and the retry endpoint exist to paper over. If
this ever needs to scale past a single server, swap `run_in_background` for
a real task queue — nothing else has to change.
"""

import logging
import threading
from datetime import timedelta

from django.db import close_old_connections
from django.utils import timezone

logger = logging.getLogger(__name__)

# How long an idea may sit in "processing" before we call it dead. Generation
# normally takes well under a minute; past this it is a lost thread.
STALE_AFTER = timedelta(minutes=15)


def run_in_background(fn, *args, **kwargs):
    """Run fn in a daemon=False thread so a shutdown waits for it."""
    thread = threading.Thread(
        target=_guarded, args=(fn, args, kwargs), daemon=False
    )
    thread.start()
    return thread


def _guarded(fn, args, kwargs):
    # a thread gets its own DB connection; drop stale ones at both ends so the
    # pool does not fill with connections nobody closed
    close_old_connections()
    try:
        fn(*args, **kwargs)
    except Exception:
        logger.exception("Background task %s failed", getattr(fn, "__name__", fn))
    finally:
        close_old_connections()


def generate_report_for_idea(idea_id):
    """Build the report for one idea and record the outcome on it.

    Imported lazily to avoid a circular import: ideas.views imports this
    module, and this needs ideas.models.
    """
    from ideas.models import Idea
    from ideas.views import build_report

    try:
        idea = Idea.objects.get(pk=idea_id)
    except Idea.DoesNotExist:
        return  # deleted while queued — nothing to do

    try:
        build_report(idea)
    except Exception:
        logger.exception("Report generation failed for idea %s", idea_id)
        Idea.objects.filter(pk=idea_id).update(status=Idea.Status.FAILED)
        return

    # straight to the DB: the in-memory idea may be stale by now, and this
    # must not clobber an edit the founder made while we were working
    Idea.objects.filter(pk=idea_id).update(status=Idea.Status.DRAFT)
    logger.info("Report generated for idea %s", idea_id)


def recover_stale_processing():
    """Mark long-stuck ideas failed.

    A thread dies with its process, so a restart mid-generation would leave an
    idea in "processing" forever with no way back. Called on startup and
    before listing a founder's ideas, so a stuck idea becomes retryable
    instead of hanging there.
    """
    from ideas.models import Idea

    cutoff = timezone.now() - STALE_AFTER
    stale = Idea.objects.filter(status=Idea.Status.PROCESSING, created_at__lt=cutoff)

    count = stale.update(status=Idea.Status.FAILED)
    if count:
        logger.warning("Marked %s stale processing idea(s) as failed", count)
    return count
