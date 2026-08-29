import os
import tempfile
import unittest

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db import Base
from app.models import Module, NoteGroup, Subject, User


class PageRoutesTests(unittest.TestCase):
    def test_backend_exposes_module_lookup_for_url_restoration(self):
        from app.main import app

        routes = {
            (route.path, ",".join(sorted(route.methods or [])))
            for route in app.routes
            if hasattr(route, "methods")
        }

        self.assertIn(("/modules/{module_id}", "GET"), routes)

    def test_note_group_lookup_includes_subject_id_for_deep_link_restoration(self):
        from app.main import get_note_group

        engine = create_engine(
            "sqlite://",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        Base.metadata.create_all(bind=engine)

        db = TestingSessionLocal()
        try:
            user = User(id="user-1", supabase_user_id="user-sub", email="user@example.com", app_role="creator")
            subject = Subject(id="subject-1", title="Subject", owner_user_id=user.id)
            module = Module(id="module-1", subject_id=subject.id, title="Module")
            note_group = NoteGroup(
                id="note-group-1",
                module_id=module.id,
                title="Note group",
                raw_text="Raw text",
            )
            db.add_all([user, subject, module, note_group])
            db.commit()

            result = get_note_group("note-group-1", db=db, current_user=user)
            self.assertEqual(result.subject_id, "subject-1")
        finally:
            db.close()


class SpaFallbackPathContainmentTests(unittest.TestCase):
    def setUp(self):
        self._tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self._tmp.cleanup)
        self.root = os.path.realpath(self._tmp.name)
        self.dist = os.path.join(self.root, "dist")
        os.makedirs(os.path.join(self.dist, "assets"))
        with open(os.path.join(self.dist, "index.html"), "w") as handle:
            handle.write("<html></html>")
        with open(os.path.join(self.dist, "assets", "app.js"), "w") as handle:
            handle.write("console.log(1)")
        self.secret = os.path.join(self.root, "secret.env")
        with open(self.secret, "w") as handle:
            handle.write("OPENAI_API_KEY=sk-real")

    def _resolve(self, full_path: str):
        from app.main import _resolve_dist_file

        return _resolve_dist_file(full_path, dist_root=self.dist)

    def test_serves_real_file_inside_dist(self):
        self.assertEqual(
            self._resolve("assets/app.js"),
            os.path.join(self.dist, "assets", "app.js"),
        )

    def test_rejects_traversal_outside_dist(self):
        for attempt in ("../secret.env", "assets/../../secret.env", "../../etc/passwd"):
            with self.subTest(attempt=attempt):
                self.assertIsNone(self._resolve(attempt))

    def test_rejects_absolute_path(self):
        self.assertIsNone(self._resolve(self.secret.lstrip("/")))
        self.assertIsNone(self._resolve(self.secret))

    def test_missing_file_falls_through_to_index(self):
        self.assertIsNone(self._resolve("some/spa/route"))
        self.assertIsNone(self._resolve(""))


if __name__ == "__main__":
    unittest.main()
