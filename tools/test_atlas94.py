#!/usr/bin/env python3
"""Static pre-merge tests; does not claim browser QA."""
from pathlib import Path
from apply_atlas94 import update, ROOT, TARGETS, TAGS
import sys

assert len(TARGETS) == 2
for page in TARGETS:
    raw = (ROOT/page).read_text('utf-8')
    assert '<canvas' in raw and '</head>' in raw.lower(), page
    once = update(raw)
    twice = update(once)
    assert once == twice, f'non-idempotent: {page}'
    for tag in TAGS: assert once.count(tag)==1, f'duplicate: {page}'
    if '--installed' in sys.argv:
        for tag in TAGS: assert raw.count(tag)==1, f'not installed: {page}'
for word in ('juraMapLegend','juraTrailerLegend','jura3dTools','loki,view','j94-progress','Next unvisited','team-jura-research-progress'):
    assert word in (ROOT/'atlas94-ui.js').read_text('utf-8')
assert 'team-jura-atlas-v41' not in (ROOT/'atlas94-ui.js').read_text('utf-8'), 'Native Atlas storage key must be owned by original engine'
assert 'jura-research-66' in (ROOT/'atlas94-ui.js').read_text('utf-8'), 'Research backup should preserve existing keys'
print('Atlas 9.4 static/injection checks PASS (browser testing not performed)')

