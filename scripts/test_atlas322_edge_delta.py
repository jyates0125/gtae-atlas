#!/usr/bin/env python3
"""Atlas 32.2: exact-head Edge/Chromium workflows skip unrelated staging synchronizations."""
import importlib.util
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('atlas_delta',ROOT/'scripts/atlas300-ci-delta.py')
mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
names=['atlas316-edge-smoke-repair.yml','atlas319-mobile-fit-release-tail.yml']
for name in names:
    path='.github/workflows/'+name
    content=(ROOT/path).read_text(encoding='utf-8')
    patterns=mod.parse_patterns(content)
    assert path in patterns
    assert mod.should_run('pull_request','opened',[],patterns),'New PR must run real tests'
    assert mod.should_run('workflow_dispatch','',[],patterns),'Manual full checks must remain available'
    assert mod.should_run('pull_request','synchronize',None,patterns),'Fail open if git history unavailable'
    assert mod.should_run('pull_request','synchronize',[path],patterns),'Workflow edits need verification'
    assert not mod.should_run('pull_request','synchronize',['atlas263-forge-collections.js'],patterns),'Forge-only work should not install Edge'
    assert not mod.should_run('pull_request','synchronize',['atlas98b-progress.js'],patterns),'Classic checklist-only work should not install Edge'
    parts=content.split('      - name: Check latest PR commit relevance')
    assert len(parts)==3,'One scope check per Chromium/Edge job'
    assert content.count('fetch-depth: 2')==2
    assert content.count('ref: ${{ github.event.pull_request.head.sha || github.sha }}')==2
    assert content.count('id: scope')==2
    assert content.count('ATLAS_PR_ACTION: ${{ github.event.action }}')==2
    assert content.count('if: steps.scope.outputs.run == \'true\'')==6
    for part in parts[1:]:
        assert path in part.split('      - name:',1)[0]
        # Expensive operations (Cloudflare build, browser install, smoke) all conditional.
        steps=part.split('      - name: ')[1:]
        for entry in steps:
            assert "if: steps.scope.outputs.run == 'true'" in entry[:160],(name,entry[:110])
assert mod.relevant(['scripts/browser_smoke.py'],mod.parse_patterns((ROOT/'.github/workflows/atlas316-edge-smoke-repair.yml').read_text()))
assert mod.relevant(['scripts/test_atlas201_squalo_browser.py'],mod.parse_patterns((ROOT/'.github/workflows/atlas319-mobile-fit-release-tail.yml').read_text()))
print('Atlas 32.2: both Chromium/Edge workflows fail open for manual release, skip unrelated head deltas and gate all six expensive steps per workflow')
