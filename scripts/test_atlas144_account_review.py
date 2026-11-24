#!/usr/bin/env python3
"""Atlas 14.4: new progress inventory never activates login or changes guest saves."""
from pathlib import Path
root=Path(__file__).resolve().parents[1]
page=(root/'atlas-account.html').read_text(encoding='utf-8')
inventory=(root/'atlas144-device-overview.js').read_text(encoding='utf-8')
transfer=(root/'atlas144-cloud-transfer.js').read_text(encoding='utf-8')
style=(root/'atlas131-account.css').read_text(encoding='utf-8')
assert 'id="j144Review"' in page
assert 'id="j144Summary"' in page
assert 'id="j144Entries"' in page
assert './atlas144-cloud-transfer.js?v=144' in page
assert './atlas144-device-overview.js?v=144' in page
assert 'type="button" disabled' in page and 'Sign in · Deferred' in page
assert 'No data was uploaded' in inventory
assert "window.AtlasCloudTransfer" in inventory
assert 'localStorage.getItem' in inventory
for unsafe in ('localStorage.setItem(', 'localStorage.removeItem(', 'fetch(', 'eval(', 'innerHTML'):
 assert unsafe not in inventory,unsafe
assert 'CONSENT_REQUIRED' in transfer and 'LOCAL_CONFLICT' in transfer and 'CONFLICT' in transfer
assert 'j144-device-list' in style
assert 'team-jura-atlas-backup.json' in (root/'atlas131-account.js').read_text()
print('Atlas 14.4 private device review and disabled public login contract PASS')
