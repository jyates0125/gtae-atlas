#!/usr/bin/env python3
"""Offline tests for the independent live deployment probe."""
import io
import json
import unittest
import urllib.error
from verify_live_deployment import probe, NoRedirect

EXPECTED = "a" * 40

class Response(io.BytesIO):
    status = 200
    def __init__(self, raw, content_type):
        super().__init__(raw)
        self.headers = {"Content-Type": content_type}

class FakeOpener:
    def __init__(self, home=None, identity=None):
        self.home = home if home is not None else b"<!doctype html><html>GTAE</html>"
        self.identity = identity if identity is not None else json.dumps({
            "schema": 1, "revision": EXPECTED, "generatedAt": "2026-11-26T12:00:00Z"
        }).encode()
        self.urls = []
    def open(self, request, timeout):
        url = request.full_url
        self.urls.append(url)
        assert url.startswith("https://gtae-online.pages.dev/")
        assert request.get_header("Cache-control") == "no-cache"
        value = self.identity if "/atlas-build-identity.json?" in url else self.home
        if isinstance(value, Exception):
            raise value
        return Response(value, "application/json" if "/atlas-build-identity.json?" in url else "text/html")

class ProbeTests(unittest.TestCase):
    def test_exact_revision(self):
        op = FakeOpener()
        self.assertTrue(probe(EXPECTED, op)["verified"])
        self.assertEqual(len(op.urls), 2)

    def test_stale_revision(self):
        op = FakeOpener(identity=json.dumps({"schema": 1, "revision": "b"*40, "generatedAt": "2026-11-26T12:00:00Z"}).encode())
        result = probe(EXPECTED, op)
        self.assertFalse(result["verified"])
        self.assertEqual(result["identity"]["revision"], "b"*40)

    def test_missing_identity(self):
        op = FakeOpener(identity=urllib.error.HTTPError("https://gtae-online.pages.dev/atlas-build-identity.json", 404, "Not Found", {}, None))
        result = probe(EXPECTED, op)
        self.assertEqual(result["identity"]["status"], 404)
        self.assertFalse(result["verified"])

    def test_html_fallback(self):
        self.assertFalse(probe(EXPECTED, FakeOpener(identity=b"<html>Not JSON</html>"))["verified"])

    def test_home_unavailable(self):
        self.assertFalse(probe(EXPECTED, FakeOpener(home=urllib.error.URLError("DNS failure")))["verified"])

    def test_redirect_not_followed(self):
        self.assertIsNone(NoRedirect().redirect_request(None, None, 302, "", {}, "https://example.org/"))
        op = FakeOpener(home=urllib.error.HTTPError("https://gtae-online.pages.dev/", 302, "Found", {}, None))
        self.assertFalse(probe(EXPECTED, op)["verified"])

    def test_oversized_response(self):
        self.assertFalse(probe(EXPECTED, FakeOpener(identity=b"x"*9000))["verified"])

if __name__ == "__main__":
    unittest.main()
