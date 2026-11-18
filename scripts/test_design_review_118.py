#!/usr/bin/env python3
"""Atlas 11.8: capture-enabled design QA cannot ship review images publicly."""
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
src=(ROOT/'scripts/browser_smoke.py').read_text(encoding='utf8')
workflow=(ROOT/'.github/workflows/team-jura-release.yml').read_text(encoding='utf8')
builder=(ROOT/'scripts/build-cloudflare.cjs').read_text(encoding='utf8')
gitignore=(ROOT/'.gitignore').read_text(encoding='utf8')
assert "os.getenv('ATLAS_VISUAL_CAPTURE','')=='1'" in src
assert 'qa-evidence' in src and 'manifest.json' in src
assert 'animations=\'disabled\'' in src
for file in ('index.html','maps.html','atlas-activities.html?mode=online','atlas93-garage.html','project.html','atlas.html','atlas-vi.html','one-last-ride.html'):
    assert file in src,file
assert workflow.count("ATLAS_VISUAL_CAPTURE: '1'")==2
assert 'team-jura-atlas-design-review-chromium' in workflow
assert 'team-jura-atlas-design-review-edge' in workflow
assert "'qa-evidence'" in builder
assert 'qa-evidence/' in gitignore
assert (ROOT/'docs/ATLAS-118-DESIGN-REVIEW-WORKFLOW.md').is_file()
print('Atlas 11.8 screenshot evidence only in CI, never in public Cloudflare artifact PASS')
