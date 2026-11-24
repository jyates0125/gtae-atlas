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
 "atlas298-heist-map-kit.yml","atlas2150-cross-product.yml",
 "atlas299-heist-backup.yml","atlas301-heist-checklists.yml","atlas302-cayo-rescue.yml",
 "atlas302-classic-notebook.yml","atlas303-thirteen-worlds.yml"
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
 "atlas299-heist-backup.yml":(["atlas299-heist-backup.js"],["atlas98-portal.js"]),
 "atlas301-heist-checklists.yml":(["heist-pages.js"],["atlas98-classic.js"]),
 "atlas302-cayo-rescue.yml":(["atlas302-cayo-legacy-rescue.js"],["atlas98-portal.js"]),
 "atlas302-classic-notebook.yml":(["atlas98-classic.js"],["heist-pages.js"]),
 "atlas303-thirteen-worlds.yml":(["atlas98-portal.js"],["heist-pages.js"]),
}
for file,(yes,no) in cases.items():
 pats=mod.parse_patterns((workflow/file).read_text())
 assert mod.relevant(yes,pats),file
 assert not mod.relevant(no,pats),file

assert "--diff-filter=ACDMRT" in (root/"scripts/atlas300-ci-delta.py").read_text(), "Deleted dependency paths must count"
assert "--no-renames" in (root/"scripts/atlas300-ci-delta.py").read_text(), "Renamed-away critical paths must be checked"
assert mod.relevant(["scripts/test_atlas290_vi_day.py"],["scripts/test_atlas29*.py"])
assert not mod.relevant(["scripts/test_atlas171_browser.py"],["scripts/test_atlas29*.py"])
assert mod.relevant(["atlas290-official-landmarks.js"],["atlas290-*.js"])
assert not mod.relevant(["atlas298-heist-map-kit.js"],["atlas290-*.js"])
try:
 mod.parse_patterns("on:\n  pull_request:\n    branches: [development]\n")
 raise AssertionError("Missing configured path list should be explicit")
except ValueError:pass

# Verify GitHub's full YAML parser accepts the real workflow files and that
# every expensive feature step is properly gated. This catches whitespace and
# trigger regressions before any action is merged.
import yaml
total_jobs=0
total_steps=0
for file in required:
    obj=yaml.safe_load((workflow/file).read_text(encoding="utf-8"))
    assert isinstance(obj,dict) and isinstance(obj.get("jobs"),dict),file
    for job_name,job in obj["jobs"].items():
        steps=job.get("steps",[])
        checkouts=[s for s in steps if s.get("uses","").startswith("actions/checkout@")]
        assert len(checkouts)==1,(file,job_name,"checkout missing")
        assert checkouts[0]["with"]["fetch-depth"]==2,(file,job_name)
        assert "head.sha" in checkouts[0]["with"]["ref"],(file,job_name)
        scope=[i for i,s in enumerate(steps) if s.get("id")=="scope"]
        assert len(scope)==1,(file,job_name,"one scope gate required")
        pos=scope[0]
        assert steps[pos].get("env",{}).get("ATLAS_PR_ACTION")=="${{ github.event.action }}",(file,job_name)
        assert file in steps[pos].get("run",""),(file,job_name)
        for step in steps[pos+1:]:
            assert "steps.scope.outputs.run" in str(step.get("if","")),(file,job_name,step.get("name") or step.get("run","")[:60])
            total_steps+=1
        total_jobs+=1
assert total_jobs>=19 and total_steps>=65,(total_jobs,total_steps)
integrated=(workflow/"atlas294-integrated-staging.yml").read_text()
assert "'scripts/test_atlas29*.py'" not in integrated
assert "'scripts/test_atlas298*.py'" not in integrated
assert "'scripts/test_atlas294*.py'" in integrated
cross=(workflow/"atlas2150-cross-product.yml").read_text()
assert "'atlas263-forge-collections.js'" in cross
assert "'docs/ATLAS-2150-COMPLETION-BOARD.md'" not in cross
cayo=(workflow/"cayo-focused-acceptance.yml").read_text()
assert "Check latest PR commit relevance" in cayo
full=(workflow/"team-jura-release.yml").read_text()
assert "workflow_dispatch:" in full and "  pull_request:" not in full
print(f"Atlas 30.0 passed: {len(required)} workflow scopes, {total_jobs} jobs, {total_steps} conditional steps; full release remains manual")

