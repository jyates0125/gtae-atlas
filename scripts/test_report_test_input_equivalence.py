#!/usr/bin/env python3
"""Tests for conservative exact-source equivalence; no CI trust is implied."""
import os
from pathlib import Path
import subprocess
import tempfile
import unittest
from report_test_input_equivalence import compare_inputs

class EvidenceTests(unittest.TestCase):
    def setUp(self):
        temp = tempfile.TemporaryDirectory()
        self.addCleanup(temp.cleanup)
        old = os.getcwd()
        os.chdir(temp.name)
        self.addCleanup(os.chdir, old)
        self.git("init", "-q")
        self.git("config", "user.email", "test@example.invalid")
        self.git("config", "user.name", "Fixture")
        self.write("index.html", '<link href="./elario-seasonal-2026.css?v=1">')
        self.write("elario-seasonal-2026.css", ".card{z-index:0}")
        self.write("shared.js", "original")
        self.base = self.commit()
    def git(self, *args):
        return subprocess.check_output(["git", *args], stderr=subprocess.PIPE).decode().strip()
    def write(self, path, text):
        Path(path).write_text(text, encoding="utf-8")
    def commit(self):
        self.git("add", "-A")
        self.git("commit", "-qm", "fixture", "--allow-empty")
        return self.git("rev-parse", "HEAD")
    def verify(self, tested, candidate, equivalent, scope=None):
        result = compare_inputs(tested, candidate)
        self.assertEqual(result["source_equivalent"], equivalent, result)
        self.assertFalse(result["reuse_authorized"])
        self.assertEqual(result["effective_execution"], "full")
        if scope is not None:
            self.assertEqual(result["suggested_scope"], scope, result)
    def test_same_commit(self):
        self.verify(self.base, self.base, True)
    def test_new_commit_same_tree(self):
        self.verify(self.base, self.commit(), True)
    def test_seasonal_only(self):
        self.write("elario-seasonal-2026.css", ".card{z-index:1}")
        self.verify(self.base, self.commit(), False, "seasonal")
    def test_shared_change(self):
        self.write("shared.js", "changed")
        self.verify(self.base, self.commit(), False, "full")
    def test_nonancestor(self):
        newer = self.commit()
        self.verify(newer, self.base, False)
    def test_invalid_ref(self):
        self.verify("--help", self.base, False)
    def test_missing_commit(self):
        self.verify(self.base, "0"*40, False)
    def test_untracked_changes_do_not_prove_runtime(self):
        self.write("untracked.js", "untracked")
        self.verify(self.base, self.base, True)
    def test_reverted_tree(self):
        self.write("shared.js", "changed")
        self.commit()
        self.write("shared.js", "original")
        self.verify(self.base, self.commit(), True)
if __name__ == "__main__":
    unittest.main()
