#!/usr/bin/env python3
"""Atlas 35.2: protect only genuine GTAE main builds from retained legacy source.

Tests production output and validates that historic old-Pages redirect and
development/feature preview behavior stay unchanged. No network or live writes.
"""
import json
import os
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "scripts" / "atlas352-primary-security-redirects.cjs"
OUT = ROOT / "public"
assert SOURCE.is_file(), "Scoped primary protection module is missing"
assert not (ROOT / "_redirects").exists(), "Global redirect could override legacy export"

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
                "atlas-vi.html", "atlas93-garage.html", "atlas-policies.html",
                "atlas-account.html")


def parse(text):
    rules = {}
    for line in text.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        parts = line.split()
        assert len(parts) == 3, f"Bad Pages redirect: {line!r}"
        src, dst, status = parts
        assert src not in rules, f"Duplicate redirect: {src}"
        assert dst == "/atlas-policies.html" and status == "302", (
            f"Unexpected redirect target/status: {line}")
        assert src.startswith("/") and not src.startswith("//"), src
        rules[src] = (dst, status)
    return rules


def build(case, branch, url):
    env = os.environ.copy()
    for variable in ("CF_PAGES", "CF_PAGES_BRANCH", "CF_PAGES_URL", "CF_PAGES_COMMIT_SHA"):
        env.pop(variable, None)
    env.update(CF_PAGES="1", CF_PAGES_BRANCH=branch,
               CF_PAGES_URL=url, CF_PAGES_COMMIT_SHA="a" * 40)
    result = subprocess.run(
        ["node", "scripts/build-cloudflare.cjs"], cwd=ROOT, env=env,
        text=True, capture_output=True, check=False, timeout=120)
    assert result.returncode == 0, f"{case} failed: {result.stderr[-2200:]}"
    assert "-> public/" in result.stdout
    assert (OUT / "atlas-build-identity.json").is_file()
    identity = json.loads((OUT / "atlas-build-identity.json").read_text())
    assert identity["revision"] == "a" * 40, f"{case}: bad deployment identity"
    for rel in PUBLIC_PAGES:
        assert (OUT / rel).is_file(), f"{case}: missing public {rel}"
    for rel in ("scripts/build-cloudflare.cjs", "scripts/build-cloudfare.cjs",
                "scripts/atlas352-primary-security-redirects.cjs",
                "docs/TEAM-JURA-STANDING-CHARTER.md",
                ".github/workflows/team-jura-release.yml"):
        assert not (OUT / rel).exists(), f"{case}: leaked source {rel}"
    manifest = json.loads((OUT / "release-manifest.json").read_text())
    return (OUT / "_redirects").read_text() if (OUT / "_redirects").exists() else None, [
        x["path"] for x in manifest["files"]
    ]


# Primary GTAE Cloudflare main, including immutable SHA-specific release URL.
redirects, entries = build("gtae-main", "main", "https://b0451a0e.gtae-online.pages.dev/")
assert redirects is not None, "Main release must emit source blocking rules"
rules = parse(redirects)
for prefix in PROTECTED_PREFIXES:
    assert prefix + "*" in rules, f"Unprotected root source path: {prefix}"
for rel in PROTECTED_ROOT_FILES:
    assert rel in rules, f"Unprotected root source file: {rel}"
assert "/.env*" in rules
assert len(rules) <= 30
assert not any(x in rules for x in ("/", "/*", "/film/*", "/data/*",
                                      "/atlas.html", "/atlas-vi.html",
                                      "/atlas-online.html")), "Blocked visitor route"
assert "_redirects" in entries
print("PASS GTAE production main: filtered build with scoped source redirects")

# Main branch on old project: preserve EXACT original redirect, not a guard
# that would replace its root-home transfer or guest export routes.
redirects, entries = build("old-pages-main", "main",
                           "https://c63c8e61.team-jura-atlas-preview.pages.dev/")
assert redirects == "/ https://gtae-online.pages.dev/ 302\n", redirects
assert "_redirects" in entries
print("PASS old Pages main: original root redirect, existing guest pages retained")

# Development, even if deployed as a preview to the new project, must not
# masquerade as public main or emit the old project's root redirect.
for label, branch, url in (
    ("gtae-development", "development", "https://dev.gtae-online.pages.dev/"),
    ("gtae-preview", "fix/atlas352", "https://7516b94c.gtae-online.pages.dev/"),
):
    redirects, entries = build(label, branch, url)
    assert redirects is None and "_redirects" not in entries, (
        f"{label}: unexpected main/legacy redirects")
    print(f"PASS {label}: no production-only redirects")

print("PASS Atlas 35.2: protected source, old guest export and preview separation")
