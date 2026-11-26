#!/usr/bin/env python3
"""Atlas 13.5: all Online daily panels use the same automatic reviewed feed."""
from pathlib import Path
R=Path(__file__).resolve().parents[1]
sidebar=(R/'atlas88-events.js').read_text(encoding='utf8')
dashboard=(R/'atlas87-daily.js').read_text(encoding='utf8')
activities=(R/'atlas-activities.js').read_text(encoding='utf8')
for js in [sidebar,dashboard,activities]:
 assert "C.refreshPublishedRotations(fetch," in js, 'Missing shared automatic feed for one Online surface'
assert 'reviewedFeed=await C.refreshPublishedRotations' in sidebar
assert 'pending' in sidebar and 'refreshPublishedRotations' in sidebar
assert 'mergePublishedRotations' in (R/'atlas-conditions.js').read_text(encoding='utf8')
assert 'const raw=rotationFeed();' in sidebar
assert 'finally{pending=false}' in sidebar
print('PASS Atlas 13.5: consistent automatic Online rotation feed on map/sidebar/daily/activities')
