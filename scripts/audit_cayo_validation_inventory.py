#!/usr/bin/env python3
"""Check the pilot retains both Cayo test entrypoints and all current production coverage."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
prod = (ROOT / ".github/workflows/team-jura-release.yml").read_text(encoding="utf-8")
pilot = (ROOT / ".github/workflows/cayo-standalone-shadow.yml").read_text(encoding="utf-8")
scripts = ("scripts/test_atlas171_browser.py", "scripts/test_atlas186_route_browser.py")
for name in scripts:
    assert (ROOT / name).is_file(), name
    pattern = r"(?m)^\s*(?:run:\s*)?python " + re.escape(name) + r"\s*$"
    assert len(re.findall(pattern, prod)) == 4, ("production inventory changed", name)
    assert len(re.findall(pattern, pilot)) == 1, ("pilot inventory changed", name)
for browser in ("chromium", "msedge"):
    assert f"browser: {browser}" in pilot, browser
assert "python scripts/audit_published.py" in pilot
assert "node scripts/build-cloudflare.cjs" in pilot
assert "playwright==1.58.0" in pilot
assert "permissions:\n  contents: read" in pilot
assert "continue-on-error:" not in pilot
assert "fail-fast: false" in pilot
assert "branches: [development]" in pilot
assert "branches: [main]" in prod
print("PASS: each detailed Cayo entrypoint appears four times in existing production; once per browser in independent pilot.")
print("PASS: build/audit, pinned browser tooling, read-only permissions, and all existing production invocations preserved.")
