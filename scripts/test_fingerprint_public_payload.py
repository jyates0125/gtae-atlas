#!/usr/bin/env python3
"""Adversarial fixture checks for public payload fingerprint."""
import hashlib
import json
from pathlib import Path
import tempfile
import unittest
from fingerprint_public_payload import snapshot, IDENTITY, MANIFEST

REV = "1"*40

class PayloadTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.write("index.html", "<html>test</html>")
        self.write("_headers", "security")
        self.refresh("2026-11-27T04:00:00Z")

    def write(self, name, text):
        (self.root/name).write_text(text, encoding="utf-8")

    def refresh(self, ts, rev=REV):
        self.write(IDENTITY, json.dumps({"schema": 1, "revision": rev, "generatedAt": ts}))
        files = []
        for p in sorted(self.root.iterdir()):
            if p.name == MANIFEST:
                continue
            b = p.read_bytes()
            files.append({"path": p.name, "bytes": len(b), "sha256": hashlib.sha256(b).hexdigest()})
        self.write(MANIFEST, json.dumps({"version": "9.8C", "generatedAt": ts, "fileCount": len(files)-1, "bytes": sum(x["bytes"] for x in files), "files": files}))

    def test_timestamp_equivalence(self):
        first = snapshot(self.root, REV)
        self.refresh("2026-11-27T05:00:00Z")
        second = snapshot(self.root, REV)
        self.assertEqual(first["payload_sha256"], second["payload_sha256"])

    def test_content_difference(self):
        first = snapshot(self.root, REV)
        self.write("_headers", "different")
        self.refresh("2026-11-27T05:00:00Z")
        self.assertNotEqual(first["payload_sha256"], snapshot(self.root, REV)["payload_sha256"])

    def test_wrong_revision(self):
        with self.assertRaises(ValueError):
            snapshot(self.root, "2"*40)

    def test_tampering(self):
        self.write("_headers", "tampered")
        with self.assertRaises(ValueError):
            snapshot(self.root, REV)

    def test_unlisted_file(self):
        self.write("unlisted.txt", "extra")
        with self.assertRaises(ValueError):
            snapshot(self.root, REV)

    def test_missing_file(self):
        (self.root/"index.html").unlink()
        with self.assertRaises(ValueError):
            snapshot(self.root, REV)

    def test_duplicate_entry(self):
        data = json.loads((self.root/MANIFEST).read_text())
        data["files"].append(data["files"][0])
        self.write(MANIFEST, json.dumps(data))
        with self.assertRaises(ValueError):
            snapshot(self.root, REV)

    def test_traversal(self):
        data = json.loads((self.root/MANIFEST).read_text())
        data["files"][0]["path"] = "../private"
        self.write(MANIFEST, json.dumps(data))
        with self.assertRaises(ValueError):
            snapshot(self.root, REV)

    def test_unknown_metadata(self):
        data = json.loads((self.root/IDENTITY).read_text())
        data["unexpected"] = True
        self.write(IDENTITY, json.dumps(data))
        with self.assertRaises(ValueError):
            snapshot(self.root, REV)

if __name__ == "__main__":
    unittest.main()
