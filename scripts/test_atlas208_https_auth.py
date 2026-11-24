#!/usr/bin/env python3
"""Atlas 20.8: no HTTP account actions; guest progress unchanged."""
from pathlib import Path
R=Path(__file__).resolve().parents[1]
account=(R/'atlas-account.html').read_text(encoding='utf8')
guard=(R/'atlas208-auth-transport.js').read_text(encoding='utf8')
headers=(R/'_headers').read_text(encoding='utf8')
cayo=(R/'heist-cayo-perico.html').read_text(encoding='utf8')
assert 'atlas208-auth-transport.js?v=208' in account
assert 'No HTTP sign-ins' in account
assert 'Sign in · Deferred' in account and 'type="button" disabled' in account
assert 'This page does not collect a password or email' in account
assert 'window.location.protocol===\'https:\'' in guard
assert 'window.isSecureContext === true' in guard and 'window.top === window.self' in guard
assert "document.addEventListener('submit',refuseInsecureAccountAction,true)" in guard
assert "document.addEventListener('click',refuseInsecureAccountAction,true)" in guard
assert 'window.TeamJuraAuthTransport' in guard and 'requireSecure' in guard
assert 'fetch(' not in guard and 'localStorage.' not in guard
assert 'Strict-Transport-Security: max-age=31536000' in headers
assert '/atlas-account.html\n  Cache-Control: no-store' in headers
assert 'Referrer-Policy: no-referrer' in headers
assert '<link rel="stylesheet" href="./atlas181-cayo-hotspots.css?v=202">' in cayo
print('PASS 20.8: account HTTPS transport guard, no public sign-in, headers, and Edge Cayo CSS load order')
