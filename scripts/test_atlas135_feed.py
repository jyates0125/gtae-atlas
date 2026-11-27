#!/usr/bin/env python3
"""Atlas 13.5: all Online daily panels use the same automatic reviewed feed."""
from pathlib import Path
import re
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
# Keep the refresh lock and the initialization-ready state under the same
# finally guard, including fetch failures; readiness must never imply valid data.
refresh = sidebar.split('async function loadReviewed(force=false){', 1)[1].split('void loadReviewed();', 1)[0]
assert re.search(r'if\s*\(pending\)\s*return;\s*pending\s*=\s*true;', refresh)
assert re.search(r'finally\s*\{\s*pending\s*=\s*false\s*;\s*reviewedReady\s*=\s*true\s*;?\s*\}', refresh), 'Refresh must release lock and signal completion on success and failure'
print('PASS Atlas 13.5: consistent automatic Online rotation feed on map/sidebar/daily/activities')
