#!/usr/bin/env python3
"""Source release checks for Atlas 15.3 maturity notice and guest-first account sequence."""
from pathlib import Path
p=Path(__file__).resolve().parents[1]
builder=(p/'scripts/build-cloudflare.cjs').read_text(encoding='utf-8')
app=(p/'atlas153-advisory.js').read_text(encoding='utf-8')
style=(p/'atlas153-advisory.css').read_text(encoding='utf-8')
charter=(p/'docs/TEAM-JURA-STANDING-CHARTER.md').read_text(encoding='utf-8')
account=(p/'atlas-account.html').read_text(encoding='utf-8')
assert 'atlas153-advisory.js?v=153' in builder and 'atlas153-advisory.css?v=153' in builder
assert 'Mature-game content' in app and 'No account is needed' in app
assert 'j132-poster-welcome' in app and 'insertAdjacentElement' in app
assert 'sessionStorage' not in app and 'localStorage' not in app
assert 'j153-welcome' in style and 'j153-footer' in style
assert 'Only after artwork-approved merge' in charter
assert 'Continue as a guest' in account and 'Sign in · Coming after secure setup' in account
print('Atlas 15.3 advisory and post-merge signup phase gate: PASS')
