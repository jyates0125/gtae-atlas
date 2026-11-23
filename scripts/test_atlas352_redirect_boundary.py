#!/usr/bin/env python3
"""Atlas 35.2: fail-closed static redirect contract for cached legacy source URLs.

Checks checked-in rules, the actual secure Cloudflare-built public/ output,
relative redirect destination, and active visitor routes without web access.
The new rules cannot hide public browser JS or change guest saves.
"""
import json
import os
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PROTECTED_PREFIXES = (
    "/scripts/", "/.github/", "/.git/", "/docs/", "/qa-evidence/",
    "/private-lab/", "/research-private/", "/user-exports/", "/tests/",
    "/tools/", "/reference-pack/", "/optional/",
)
PROTECTED_ROOT_FILES = (
    "/README.md", "/AGENTS.md", "/package.json", "/package-lock.json",
    "/MANIFEST-SHA256.txt",
)
PUBLIC_PAGES = ("index.html", "maps.html", "atlas.html", "atlas-online.html",
                "atlas-vi.html", "atlas93-garage.html", "atlas-policies.html")


def parse(text):
    rules = {}
    for line in text.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        fields = line.split()
        assert len(fields) == 3, f"Invalid Pages _redirects rule: {line!r}"
        source, destination, status = fields
        assert source not in rules, f"Duplicate redirect: {source}"
        assert status == "302" and destination == "/atlas-policies.html", (
            f"Unsafe redirect destination/status: {line}")
        assert source.startswith("/") and not source.startswith("//"), source
        rules[source] = (destination, status)
    return rules


original = parse((ROOT / "_redirects").read_text(encoding="utf-8"))
for prefix in PROTECTED_PREFIXES:
    assert prefix + "*" in original, f"Missing protectable repository path: {prefix}"
for root_file in PROTECTED_ROOT_FILES:
    assert root_file in original, f"Missing root source redirect: {root_file}"
assert "/.env*" in original
assert len(original) <= 30, "Unexpectedly broad / oversized security redirects"
assert not any(key in original for key in ("/", "/*", "/film/*", "/data/*",
                                              "/atlas.html", "/atlas-vi.html",
                                              "/atlas-online.html")), "Visitor route masked"

env = os.environ.copy()
env["CF_PAGES_COMMIT_SHA"] = "a" * 40
process = subprocess.run(["node", "scripts/build-cloudflare.cjs"],
                         cwd=ROOT, env=env, text=True, capture_output=True,
                         timeout=120)
assert process.returncode == 0, process.stderr[-3000:]
assert "-> public/" in process.stdout
public = ROOT / "public"
assert (public / "atlas-policies.html").is_file(), "Redirect target not deployed"
assert parse((public / "_redirects").read_text(encoding="utf-8")) == original
for rel in PUBLIC_PAGES:
    assert (public / rel).is_file(), f"Public destination missing: {rel}"
for rel in ("scripts/build-cloudflare.cjs", "scripts/build-cloudfare.cjs",
            "docs/TEAM-JURA-STANDING-CHARTER.md",
            ".github/workflows/team-jura-release.yml"):
    assert not (public / rel).exists(), f"Raw source unexpectedly in production: {rel}"
identity = json.loads((public / "atlas-build-identity.json").read_text(encoding="utf-8"))
assert identity.get("revision") == "a" * 40
print("PASS Atlas 35.2: filtered public build, retained-source redirect rules and visitor pages")
