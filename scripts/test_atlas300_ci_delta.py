#!/usr/bin/env python3
"""Atlas 30.0 no-dependency tests for PR delta gating."""
import importlib.util
from pathlib import Path
import tempfile
from unittest.mock import patch

root=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location("atlas300_ci",root/"scripts/atlas300-ci-delta.py")
mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
workflow=root/".github/workflows"

required=(
 "atlas-characters-focused.yml","atlas-garage-focused.yml","atlas-navigation-focused.yml",
 "atlas292-shortcuts.yml","atlas293-garage-forge.yml","atlas294-integrated-staging.yml",
 "atlas295-garage-preservation.yml","atlas296-forge-collections.yml",
 "atlas297-heist-resume.yml","atlas298-heist-landmark-links.yml",
 "atlas298-heist-map-kit.yml","atlas2150-cross-product.yml"
)
for path in required:
 source=(workflow/path).read_text(encoding="utf-8")
 pats=mod.parse_patterns(source)
 assert len(pats)>=4,(path,pats)
 assert mod.relevant([".github/workflows/"+path],pats),path
 # Workflow itself changed: run relevant tests on rollout.
 assert mod.should_run("pull_request","opened",[],pats)
 assert mod.should_run("workflow_dispatch","",[],pats)
 assert mod.should_run("pull_request","synchronize",None,pats), "Fail open with missing git history"
 assert not mod.should_run("pull_request","synchronize",["docs/unrelated-brief.md"],pats)
 assert mod.should_run("pull_request","synchronize",[".github/workflows/"+path],pats)
 assert not mod.should_run("pull_request","synchronize",[],pats)

cases={
 "atlas293-garage-forge.yml":(["atlas93-garage.js"],["atlas298-heist-map-kit.css"]),
 "atlas297-heist-resume.yml":(["heist-pages.js"],["atlas263-forge-collections.js"]),
 "atlas298-heist-map-kit.yml":(["atlas298-heist-map-kit.js"],["atlas101-configurator.js"]),
 "atlas296-forge-collections.yml":(["atlas263-forge-collections.js"],["heist-pages.js"]),
 "atlas-navigation-focused.yml":(["atlas-dashboard.html"],["atlas167-heist-focus.js"]),
 "atlas2150-cross-product.yml":(["atlas101-configurator.js"],["atlas298-heist-map-kit.js"]),
}
for file,(yes,no) in cases.items():
 pats=mod.parse_patterns((workflow/file).read_text())
 assert mod.relevant(yes,pats),file
 assert not mod.relevant(no,pats),file

assert mod.relevant(["scripts/test_atlas290_vi_day.py"],["scripts/test_atlas29*.py"])
assert not mod.relevant(["scripts/test_atlas171_browser.py"],["scripts/test_atlas29*.py"])
assert mod.relevant(["atlas290-official-landmarks.js"],["atlas290-*.js"])
assert not mod.relevant(["atlas298-heist-map-kit.js"],["atlas290-*.js"])
try:
 mod.parse_patterns("on:\n  pull_request:\n    branches: [development]\n")
 raise AssertionError("Missing configured path list should be explicit")
except ValueError:pass
print("Atlas 30.0 tests passed: twelve workflow scopes, initial/manual/fail-open and unrelated-commit skip behavior")
