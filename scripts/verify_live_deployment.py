#!/usr/bin/env python3
"""Read-only anonymous production probe. No Cloudflare credentials or writes."""
import argparse
import datetime as dt
import json
import re
import time
import urllib.error
import urllib.request

ORIGIN = "https://gtae-online.pages.dev"
SHA = re.compile(r"[0-9a-f]{40}", re.I)

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None

def probe(revision, opener=None):
    opener = opener or urllib.request.build_opener(NoRedirect())
    headers = {"User-Agent": "GTAE-release-verifier/1", "Cache-Control": "no-cache"}
    outcome = {}
    for key, path, limit in (("home", "/", 262144), ("identity", "/atlas-build-identity.json", 8192)):
        req = urllib.request.Request(ORIGIN + path + "?release_probe=" + revision, headers=headers)
        try:
            with opener.open(req, timeout=15) as response:
                raw = response.read(limit + 1)
                outcome[key] = {"status": response.status, "contentType": response.headers.get("Content-Type", "")}
                if key == "home":
                    outcome[key]["html"] = response.status == 200 and b"<html" in raw.lower()
                elif len(raw) <= limit:
                    try:
                        identity = json.loads(raw)
                        if not isinstance(identity, dict) or identity.get("schema") != 1:
                            raise ValueError("invalid identity schema")
                        deployed = identity.get("revision")
                        if not isinstance(deployed, str) or not SHA.fullmatch(deployed):
                            raise ValueError("missing deployment SHA")
                        generated = dt.datetime.fromisoformat(identity["generatedAt"].replace("Z", "+00:00"))
                        if generated.tzinfo is None:
                            raise ValueError("missing timestamp offset")
                        outcome[key].update(revision=deployed.lower(), generatedAt=generated.isoformat())
                    except (ValueError, KeyError, TypeError, AttributeError):
                        outcome[key]["error"] = "Invalid build identity payload"
                else:
                    outcome[key]["error"] = "Identity response exceeds size limit"
        except urllib.error.HTTPError as exc:
            outcome[key] = {"status": exc.code, "error": "HTTP response refused or redirected"}
        except (urllib.error.URLError, TimeoutError, OSError) as exc:
            outcome[key] = {"error": type(exc).__name__, "detail": str(exc)[:200]}
    home, identity = outcome["home"], outcome["identity"]
    outcome["verified"] = bool(home.get("html") and identity.get("status") == 200 and identity.get("revision") == revision.lower())
    outcome["expectedRevision"] = revision.lower()
    return outcome

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("revision")
    parser.add_argument("--attempts", type=int, default=6)
    args = parser.parse_args()
    if not SHA.fullmatch(args.revision) or not 1 <= args.attempts <= 12:
        parser.error("Expected a full commit SHA and 1–12 attempts")
    for attempt in range(args.attempts):
        result = probe(args.revision)
        print(json.dumps({"attempt": attempt + 1, **result}), flush=True)
        if result["verified"]:
            return 0
        if attempt + 1 < args.attempts:
            time.sleep(15)
    return 1

if __name__ == "__main__":
    raise SystemExit(main())
