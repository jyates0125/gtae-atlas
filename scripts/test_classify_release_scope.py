#!/usr/bin/env python3
import os
from pathlib import Path
import subprocess
import tempfile
import unittest
from classify_release_scope import classify, parse_raw

class ScopeTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.previous = os.getcwd()
        os.chdir(self.temp.name)
        self.addCleanup(self.temp.cleanup)
        self.addCleanup(os.chdir, self.previous)
        self.git("init", "-q")
        self.git("config", "user.name", "Test")
        self.git("config", "user.email", "test@example.invalid")
        self.write("index.html", '<link href="./elario-seasonal-2026.css?v=1"><a href="home">Guest</a>')
        self.write("elario-seasonal-2026.css", ".card{z-index:0}")
        self.write("shared.js", "original")
        self.base = self.commit()

    def git(self, *args):
        return subprocess.check_output(["git", *args], stderr=subprocess.PIPE).decode().strip()

    def write(self, path, content):
        p = Path(path)
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(content, encoding="utf-8")

    def commit(self):
        self.git("add", "-A")
        self.git("commit", "-qm", "fixture")
        return self.git("rev-parse", "HEAD")

    def check(self, scope, head=None):
        actual = classify(self.base, head or self.commit())
        self.assertEqual(actual["suggested_scope"], scope, actual)
        self.assertEqual(actual["effective_execution"], "full")
        self.assertFalse(actual["reuse_authorized"])

    def test_seasonal(self):
        self.write("elario-seasonal-2026.css", ".card{z-index:1}")
        self.write("index.html", '<link href="./elario-seasonal-2026.css?v=2"><a href="home">Guest</a>')
        self.check("seasonal")

    def test_documentation(self):
        self.write("docs/FOCUSED-PRODUCTION-VALIDATION-PROPOSAL.md", "draft")
        self.check("documentation")

    def test_shared_mixed(self):
        self.write("elario-seasonal-2026.css", "changed")
        self.write("shared.js", "changed")
        self.check("full")

    def test_cayo_dependency_not_yet_mapped(self):
        self.write("cayo-map.js", "changed")
        self.check("full")

    def test_html_behavior(self):
        self.write("index.html", '<link href="./elario-seasonal-2026.css?v=2"><a href="other">Guest</a>')
        self.check("full")

    def test_deleted(self):
        Path("elario-seasonal-2026.css").unlink()
        self.check("full")

    def test_rename(self):
        Path("elario-seasonal-2026.css").rename("unknown.css")
        self.check("full")

    def test_build_workflow(self):
        self.write(".github/workflows/deploy.yml", "changed")
        self.check("full")

    def test_unknown_documentation(self):
        self.write("docs/unknown.md", "unknown")
        self.check("full")

    def test_bad_ref(self):
        self.check("full", "--help")

    def test_nonancestor(self):
        self.write("shared.js", "changed")
        newer = self.commit()
        self.assertEqual(classify(newer, self.base)["suggested_scope"], "full")

    def test_empty(self):
        self.check("full", self.base)

    def test_invalid_raw(self):
        for raw in (b"bad", b"bad\0", b"bad\0path\0"):
            with self.subTest(raw=raw), self.assertRaises(ValueError):
                parse_raw(raw)

if __name__ == "__main__":
    unittest.main()
