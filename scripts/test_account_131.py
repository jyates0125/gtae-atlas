#!/usr/bin/env python3
"""Atlas 13.1: optional account is honest and backup is explicit, local and portable."""
from pathlib import Path
import re
ROOT=Path(__file__).resolve().parents[1]
h=(ROOT/'atlas-account.html').read_text()
js=(ROOT/'atlas131-account.js').read_text()
css=(ROOT/'atlas131-account.css').read_text()
assert 'id="accountTitle"' in h
assert 'Continue as a guest' in h and 'No account required' in h
assert 'SECURE CLOUD ACCOUNT · NOT ENABLED YET' in h
assert 'type="button" disabled' in h
assert 'not</strong> preserve your Atlas data yet' in h
assert 'id="j131Export"' in h and 'id="j131Import"' in h
assert 'iCloud Drive' in h
assert 'team-jura-atlas-backup.json' in js
assert 'localStorage.getItem' in js and 'localStorage.setItem' in js
assert 'VERSION=1' in js and 'validKey' in js
assert 'BLOCK=' in js
assert 'confirm(' in js
assert 'entry' in js.lower()
assert not re.search(r"(?:localStorage\.clear\(|eval\(|innerHTML\s*=\s*parsed|fetch\()",js)
assert '@media(max-width:730px)' in css
for p in ('index.html','atlas-share.html','atlas-dashboard.html'):
 assert 'atlas-account.html' in (ROOT/p).read_text(),p
print('PASS Atlas 13.1 account: safe guest mode, honest disabled sign-in, explicit backup and confirmation')
