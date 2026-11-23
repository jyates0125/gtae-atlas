#!/usr/bin/env python3
"""Read-only verification of both Cloudflare Pages origins before a GTAE release.

Exit nonzero on any unverified identity or missing required public route. Never
publishes, modifies Pages settings, or assumes GitHub commits are deployed.
"""
import argparse
import json
import sys
from urllib.error import HTTPError, URLError
from urllib.parse import urljoin, urlparse
from urllib.request import Request, urlopen

PRIMARY = "https://gtae-online.pages.dev/"
LEGACY = "https://team-jura-atlas-preview.pages.dev/"
ROUTES = ("maps.html", "atlas.html", "atlas-online.html", "atlas-vi.html",
          "atlas90-vehicles5.html", "atlas93-garage.html")


def fetch(url, *, max_bytes=120000):
    request = Request(url, headers={"User-Agent": "TeamJuraReleaseAudit/1.0",
                                    "Accept": "application/json,text/html;q=0.8"})
    try:
        with urlopen(request, timeout=15) as response:
            return {"status": response.status, "url": response.geturl(),
                    "content_type": response.headers.get("Content-Type", ""),
                    "body": response.read(max_bytes + 1)}
    except (HTTPError, URLError, TimeoutError, OSError) as exc:
        return {"error": str(exc)}


def same_origin(origin, url):
    a, b = urlparse(origin), urlparse(url)
    return a.scheme == b.scheme and a.netloc == b.netloc


def check_identity(origin, expected, errors):
    url = urljoin(origin, "atlas-build-identity.json")
    result = fetch(url)
    if "error" in result:
        errors.append(f"{origin} identity inaccessible: {result['error']}")
        return None
    if result["status"] != 200 or not same_origin(origin, result["url"]):
        errors.append(f"{origin} identity returned unexpected status/redirect: {result['url']}")
        return None
    try:
        identity = json.loads(result["body"].decode("utf-8"))
    except (ValueError, UnicodeError):
        errors.append(f"{origin} identity is not valid JSON")
        return None
    if not isinstance(identity, dict):
        errors.append(f"{origin} identity must be an object")
        return None
    revision = identity.get("revision")
    if not isinstance(revision, str) or len(revision) < 7 or not all(c in "0123456789abcdef" for c in revision.lower()):
        errors.append(f"{origin} identity has no verifiable revision: {revision!r}")
    elif expected and not (revision == expected or (len(revision) >= 7 and expected.startswith(revision))):
        errors.append(f"{origin} deployed revision {revision} != expected {expected}")
    return identity


def check_page(origin, path, errors, *, allow_redirect=False):
    result = fetch(urljoin(origin, path))
    if "error" in result:
        errors.append(f"{origin}{path} inaccessible: {result['error']}")
        return
    if result["status"] != 200:
        errors.append(f"{origin}{path} returned HTTP {result['status']}")
    if not allow_redirect and not same_origin(origin, result["url"]):
        errors.append(f"{origin}{path} unexpectedly redirected to {result['url']}")
    if b"<html" not in result["body"].lower() and b"<!doctype html" not in result["body"].lower():
        errors.append(f"{origin}{path} does not appear to serve HTML")
    if len(result["body"]) > 120000:
        errors.append(f"{origin}{path} exceeded audit response limit")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--primary", default=PRIMARY)
    parser.add_argument("--legacy", default=LEGACY)
    parser.add_argument("--expected-sha", default="", help="Expected deployed production commit SHA")
    parser.add_argument("--check-legacy", action="store_true", help="Audit legacy origin and progress-preserving deep links")
    args = parser.parse_args()
    errors = []
    for origin in (args.primary, args.legacy):
        if not origin.startswith("https://") or not origin.endswith("/"):
            parser.error("Origins must be HTTPS and end with /")
    identity = check_identity(args.primary, args.expected_sha, errors)
    for path in ROUTES:
        check_page(args.primary, path, errors)
    if args.check_legacy:
        # The legacy home may redirect to GTAE, but deep links must remain
        # usable until old-device progress export is approved.
        check_page(args.legacy, "", errors, allow_redirect=True)
        for path in ("atlas90-vehicles5.html", "atlas93-garage.html"):
            check_page(args.legacy, path, errors)
    print(json.dumps({"primary": args.primary, "legacy": args.legacy,
                      "expected_sha": args.expected_sha or None,
                      "identity": identity, "legacy_checked": args.check_legacy,
                      "routes_checked": list(ROUTES), "verified": not errors,
                      "errors": errors}, indent=2))
    return 0 if not errors else 1


if __name__ == "__main__":
    sys.exit(main())
