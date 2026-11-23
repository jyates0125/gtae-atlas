#!/usr/bin/env python3
"""Release regression: both Cloudflare build command spellings use the same safe builder.

Validates real output, current git revision metadata and excluded internal paths.
No remote network or live deployment; runs only on the GitHub checkout.
"""
from pathlib import Path
import json
import os
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
REVISION = "a" * 40
EXCLUDED = (
    "scripts/build-cloudflare.cjs",
    "scripts/build-cloudfare.cjs",
    "docs/TEAM-JURA-STANDING-CHARTER.md",
    ".github/workflows/team-jura-release.yml",
    "scripts/test_atlas351_cloudflare_build_command.py",
)
REQUIRED = (
    "index.html", "maps.html", "atlas.html", "atlas-online.html",
    "atlas-vi.html", "atlas93-garage.html", "_headers",
)
baseline = None
for entry in ("build-cloudflare.cjs", "build-cloudfare.cjs"):
    env = os.environ.copy()
    env["CF_PAGES_COMMIT_SHA"] = REVISION
    args = ["node", f"scripts/{entry}"]
    run = subprocess.run(args, cwd=ROOT, env=env, capture_output=True,
                         text=True, timeout=120, check=False)
    assert run.returncode == 0, (
        f"{entry} failed: {run.stdout[-3000:]}\n{run.stderr[-3000:]}")
    assert "-> public/" in run.stdout, f"{entry} did not run the secure builder"
    public = ROOT / "public"
    identity = json.loads((public / "atlas-build-identity.json").read_text(encoding="utf-8"))
    assert identity["revision"] == REVISION, f"{entry} revision mismatch"
    assert identity["generatedAt"].endswith("Z"), "No generated deployment timestamp"
    for required in REQUIRED:
        assert (public / required).is_file(), f"{entry} lost required {required}"
    for excluded in EXCLUDED:
        assert not (public / excluded).exists(), f"{entry} leaked {excluded}"
    manifest = json.loads((public / "release-manifest.json").read_text(encoding="utf-8"))
    files = tuple(x["path"] for x in manifest["files"])
    assert not any(x.startswith(("scripts/", "docs/", ".github/")) for x in files), (
        f"{entry} manifest contains internal files")
    if baseline is not None:
        assert files == baseline, "Legacy alias generated a different production payload"
    baseline = files
    print(f"PASS {entry}: generated identity, essential routes, filtered asset tree", flush=True)

sys.exit(0)
