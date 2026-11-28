#!/usr/bin/env python3
"""Read-only, fail-closed public Pages source-boundary audit.

Fetches only known nonsensitive repository file paths and a tiny bounded sample
of each public response. Never prints response bodies, credentials or cookies.
The approved Cloudflare 'public/' build excludes docs/ and scripts/.
"""
import argparse
import json
import re
import sys
from urllib.error import HTTPError, URLError
from urllib.parse import urljoin, urlparse
from urllib.request import Request, urlopen

ORIGINS = (
    "https://gtae-online.pages.dev/",
    "https://team-jura-atlas-preview.pages.dev/",
)
# Deliberately inspect only paths that are publicly readable in the GitHub repo.
# Do not request .env, private-lab or other potentially sensitive paths.
FORBIDDEN_SOURCE_PROBES = {
    "scripts/build-cloudflare.cjs": b"Deterministic, offline, secure Cloudflare Pages static-site build",
    "docs/TEAM-JURA-STANDING-CHARTER.md": b"Team Jura Atlas Standing Project Charter",
    ".github/workflows/team-jura-release.yml": b"Team Jura Atlas - validate production website",
}
HEX_SHA = re.compile(r"^[0-9a-fA-F]{40}$")


def looks_like_raw_source(payload, fingerprint):
    """A 200 SPA fallback isn't a code exposure without a source fingerprint."""
    return fingerprint in payload


def same_origin(a, b):
    x, y = urlparse(a), urlparse(b)
    return x.scheme == y.scheme == "https" and x.netloc == y.netloc


def get_small(origin, path, limit=12000):
    req = Request(urljoin(origin, path), headers={
        "User-Agent": "TeamJuraPublicBoundaryAudit/1.0",
        "Accept": "*/*",
        "Cache-Control": "no-cache",
    })
    try:
        with urlopen(req, timeout=12) as response:
            return {
                "status": response.status,
                "content_type": response.headers.get("Content-Type", "").split(";")[0],
                "same_origin": same_origin(origin, response.geturl()),
                "body": response.read(limit + 1),
            }
    except HTTPError as exc:
        return {"status": exc.code, "content_type": "", "same_origin": True, "body": b""}
    except (URLError, TimeoutError, OSError) as exc:
        return {"status": None, "error": type(exc).__name__, "body": b""}


def inspect(origin):
    observations = []
    errors = []
    for path, fingerprint in FORBIDDEN_SOURCE_PROBES.items():
        r = get_small(origin, path)
        leaked = (r.get("status") == 200 and r.get("same_origin") and
                  looks_like_raw_source(r["body"], fingerprint))
        observations.append({"path": path, "status": r.get("status"),
                             "content_type": r.get("content_type"), "raw_source_exposed": bool(leaked)})
        if leaked:
            errors.append(f"{origin}{path}: excluded repository source is publicly served")
        if r.get("status") is None:
            errors.append(f"{origin}{path}: source-boundary probe could not complete")
    r = get_small(origin, "atlas-build-identity.json")
    identity = None
    if r.get("status") == 200 and r.get("same_origin"):
        try:
            identity = json.loads(r["body"].decode("utf-8"))
        except (ValueError, UnicodeError):
            pass
    revision = identity.get("revision") if isinstance(identity, dict) else None
    generated = identity.get("generatedAt") if isinstance(identity, dict) else None
    valid_identity = bool(isinstance(revision, str) and HEX_SHA.fullmatch(revision)
                          and isinstance(generated, str) and generated.endswith("Z"))
    if not valid_identity:
        errors.append(f"{origin}atlas-build-identity.json: build revision/timestamp not generated")
    return {"origin": origin, "probes": observations, "build_identity_valid": valid_identity,
            "revision": revision if valid_identity else None, "errors": errors}


def main():
    assert looks_like_raw_source(b"prefix known-source fingerprint suffix", b"known-source fingerprint")
    assert not looks_like_raw_source(b"<!doctype html>Fallback", b"known-source fingerprint")
    parser = argparse.ArgumentParser()
    parser.add_argument('--primary-only', action='store_true', help='Audit canonical public production only; default retains dual-origin diagnostic')
    args = parser.parse_args()
    origins = ORIGINS[:1] if args.primary_only else ORIGINS
    results = [inspect(origin) for origin in origins]
    # No remote response body is emitted or saved.
    print(json.dumps({"schema": 1, "results": results,
                      "verified": all(not r["errors"] for r in results)}, indent=2))
    return 0 if all(not r["errors"] for r in results) else 1


if __name__ == "__main__":
    sys.exit(main())
