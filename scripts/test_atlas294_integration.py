#!/usr/bin/env python3
"""Atlas 29.4: prevent cross-PR integration from silently losing behaviors."""
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
checks={
  'atlas93-garage.js':(
    'hasSavedBuild(v)', 'j293-share-actions', 'source=garage',
    'Garage save blocked', 'j226-garage-back',
  ),
  'atlas222-characters.js':(
    'const hit=requested && data.find', 'matchesName', 'search.value=q',
    'showProfile(dialog,hit)',
  ),
  'atlas101-configurator.js':('source', 'garage'),
  'atlas292-shortcut-filter.js':("event.key === 'Escape'", "event.key === 'Enter'"),
  'atlas290-vi-source-ledger.js':('landmark=',),
  'atlas290-official-landmarks.js':('jura:poster:clear',),
  'scripts/test_atlas293_character_portraits_browser.py':('close_profile_and_settle_history',),
  '.github/workflows/team-jura-release.yml':(
    'workflow_dispatch:', 'scripts/test_atlas290_poster_browser.py',
    'scripts/test_atlas290_vi_day_browser.py',
  ),
}
for name,markers in checks.items():
    text=(ROOT/name).read_text(encoding='utf-8')
    for marker in markers:
        assert marker in text,(name,marker)
release=(ROOT/'.github/workflows/team-jura-release.yml').read_text(encoding='utf-8')
header=release.split('permissions:',1)[0]
assert '  push:' not in header and '  pull_request:' in header and 'branches: [main]' in header and 'workflow_dispatch:' in header, 'Full release gate must trigger on production PRs, not routine staging'
for name in ('atlas290-vi-source-ledger.css','atlas290-official-landmarks.css',
             'atlas292-shortcut-filter.css','atlas291-shortcuts.css',
             'docs/ATLAS294-INTEGRATED-STAGING-GATE.md'):
    assert (ROOT/name).is_file(), name
print('PASS Atlas 29.4: Leonida, mobile shortcuts, character links and Garage↔Forge overlap contracts')
