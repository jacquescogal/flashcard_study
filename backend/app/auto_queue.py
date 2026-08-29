from collections import deque
import logging
from threading import Condition, Thread

from app.db import SessionLocal
from app.jobs import JOB_TYPE_NOTE_GROUP_AUTO_GENERATION, run_auto_note_group_generation
from app.models import Job, Module, NoteGroup

logger = logging.getLogger(__name__)

# The queue is event driven: enqueue_auto_job notifies the worker the moment work
# arrives. This timeout only bounds how long the worker can go without
# reconciling against jobs persisted by another process or by a previous run, so
# it should stay long -- every idle wake-up is a round trip to a remote database.
AUTO_QUEUE_IDLE_POLL_SECONDS = 60.0
# Short backoff after an unexpected failure, so a persistent error cannot spin.
_ERROR_BACKOFF_SECONDS = 0.25

_queue: deque[str] = deque()
_queue_set: set[str] = set()
_condition = Condition()
# Bumped only when genuinely new work is enqueued. Requeues of jobs we just
# failed to claim deliberately do not bump it -- waking for those would spin.
_wake_seq = 0
_started = False
_worker_thread: Thread | None = None


def start_auto_worker() -> None:
    global _started, _worker_thread
    if _started and _worker_thread is not None and _worker_thread.is_alive():
        return
    if _worker_thread is not None and not _worker_thread.is_alive():
        logger.warning("Auto generation worker thread was not alive; starting a replacement thread")
    _started = True
    _worker_thread = Thread(target=_worker_loop, daemon=True)
    _worker_thread.start()
    logger.info("Auto generation worker thread started")


def resume_auto_jobs() -> None:
    db = SessionLocal()
    try:
        jobs = (
            db.query(Job)
            .filter(
                Job.type == JOB_TYPE_NOTE_GROUP_AUTO_GENERATION,
                Job.status.in_(["queued", "running"]),
            )
            .order_by(Job.created_at.asc())
            .all()
        )
        for job in jobs:
            if job.status == "running":
                job.status = "queued"
        db.commit()
        logger.info("Resuming auto generation jobs", extra={"job_count": len(jobs)})
        for job in jobs:
            enqueue_auto_job(job.id)
    finally:
        db.close()


def enqueue_auto_job(job_id: str) -> bool:
    global _wake_seq
    with _condition:
        added = _enqueue_auto_job_unlocked(job_id)
        if added:
            _wake_seq += 1
            _condition.notify()
        return added


def _enqueue_auto_job_unlocked(job_id: str) -> bool:
    if job_id in _queue_set:
        return False
    _queue.append(job_id)
    _queue_set.add(job_id)
    return True


def remove_auto_job(job_id: str) -> bool:
    with _condition:
        if job_id not in _queue_set:
            return False
        _queue_set.remove(job_id)
        try:
            _queue.remove(job_id)
        except ValueError:
            return False
    return True


def _has_active_module_auto_job(db, job: Job) -> bool:
    note_group = job.note_group
    if note_group is None:
        return False
    return (
        db.query(Job.id)
        .join(NoteGroup, Job.note_group_id == NoteGroup.id)
        .filter(
            Job.id != job.id,
            Job.type == JOB_TYPE_NOTE_GROUP_AUTO_GENERATION,
            Job.status == "running",
            NoteGroup.module_id == note_group.module_id,
        )
        .first()
        is not None
    )


def _claim_auto_job(db, job: Job) -> bool:
    note_group = job.note_group
    if note_group is None:
        return False
    db.query(Module).filter(Module.id == note_group.module_id).with_for_update().one_or_none()
    db.refresh(job)
    if job.status in {"cancelled", "failed", "completed"}:
        return False
    if _has_active_module_auto_job(db, job):
        if job.status != "queued":
            job.status = "queued"
        if job.note_group and job.note_group.generation_status == "generating":
            job.note_group.generation_status = "queued"
        db.commit()
        return False
    job.status = "running"
    if job.note_group and job.note_group.generation_status != "complete":
        job.note_group.generation_status = "generating"
    db.commit()
    return True


def _pop_queued_job(wait: bool) -> str | None:
    with _condition:
        if not wait and not _queue:
            return None
        while wait and not _queue:
            _condition.wait()
        if not _queue:
            return None
        job_id = _queue.popleft()
        _queue_set.discard(job_id)
        return job_id


def _requeue_deferred(job_ids: list[str]) -> None:
    if not job_ids:
        return
    # These jobs were just found unclaimable, so put them back without bumping
    # the wake sequence: they are not new work and must not cancel the idle wait.
    with _condition:
        for job_id in job_ids:
            _enqueue_auto_job_unlocked(job_id)


def _enqueue_persisted_queued_jobs() -> None:
    db = SessionLocal()
    try:
        job_ids = [
            row[0]
            for row in (
                db.query(Job.id)
                .filter(
                    Job.type == JOB_TYPE_NOTE_GROUP_AUTO_GENERATION,
                    Job.status == "queued",
                )
                .order_by(Job.created_at.asc())
                .all()
            )
        ]
    finally:
        db.close()

    if not job_ids:
        return
    logger.info("Loaded persisted queued auto generation jobs", extra={"job_count": len(job_ids)})
    with _condition:
        for job_id in job_ids:
            _enqueue_auto_job_unlocked(job_id)
        _condition.notify_all()


def _dequeue_next_runnable_job(wait: bool = True) -> str | None:
    deferred_job_ids: list[str] = []
    first_pass = True
    while True:
        with _condition:
            queue_empty = not _queue
        if first_pass and queue_empty:
            _enqueue_persisted_queued_jobs()
        job_id = _pop_queued_job(wait if first_pass else False)
        first_pass = False
        if not job_id:
            _requeue_deferred(deferred_job_ids)
            return None

        should_requeue = False
        claimed = False
        db = SessionLocal()
        try:
            job = db.get(Job, job_id)
            if not job:
                continue
            if job.type != JOB_TYPE_NOTE_GROUP_AUTO_GENERATION:
                continue
            if job.status in {"cancelled", "failed", "completed"}:
                continue
            claimed = _claim_auto_job(db, job)
            should_requeue = not claimed and job.status == "queued"
        finally:
            db.close()

        if claimed:
            _requeue_deferred(deferred_job_ids)
            return job_id
        if should_requeue:
            deferred_job_ids.append(job_id)


def _wait_for_work(wake_seq: int) -> None:
    with _condition:
        # New work arrived while we were looking; go straight back round rather
        # than sleeping on a notify that has already been delivered.
        if _wake_seq != wake_seq:
            return
        _condition.wait(timeout=AUTO_QUEUE_IDLE_POLL_SECONDS)


def _worker_loop() -> None:
    while True:
        with _condition:
            wake_seq = _wake_seq
        try:
            job_id = _dequeue_next_runnable_job(wait=False)
        except Exception:
            logger.exception("Auto generation worker failed while dequeuing next runnable job")
            with _condition:
                _condition.wait(timeout=_ERROR_BACKOFF_SECONDS)
            continue
        if not job_id:
            _wait_for_work(wake_seq)
            continue

        try:
            run_auto_note_group_generation(job_id)
        except Exception:
            logger.exception(
                "Auto generation worker failed while running job",
                extra={"job_id": job_id},
            )
            continue
