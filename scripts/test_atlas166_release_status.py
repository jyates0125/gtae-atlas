#!/usr/bin/env python3
"""Atlas 16.6: real release-header scope, premium status panel and local-only save truth."""
from pathlib import Path
import importlib.util, tempfile, shutil
r=Path(__file__).resolve().parents[1]
raw=(r/'scripts/audit_published.py').read_text(encoding='utf-8')
assert "blocks.get('/*'" in raw and "allowed_overrides={'/atlas-online.html','/atlas-cayo.html'}" in raw
assert "split('\\\\n\\\\n'" not in raw
headers=(r/'_headers').read_text(encoding='utf-8')
assert headers.count('X-Frame-Options: DENY')==1
assert headers.count('X-Frame-Options: SAMEORIGIN')==2
assert headers.count("Content-Security-Policy: frame-ancestors 'self'")==2
for path in ('/atlas-online.html','/atlas-cayo.html'):
 block=headers.split('\n'+path+'\n',1)[1].split('\n\n',1)[0]
 assert '! X-Frame-Options' in block and 'X-Frame-Options: SAMEORIGIN' in block
 assert "Content-Security-Policy: frame-ancestors 'self'" in block
dashboard=(r/'atlas-dashboard.html').read_text(encoding='utf-8')
assert dashboard.count('id="atlas-updates"')==1
assert 'atlas166-update-notice.css?v=166' in dashboard
for phrase in ('quieter hours','not yet synced to an account','Before clearing browser data','No login is required now','Backup &amp; progress options'):
 assert phrase in dashboard,phrase
assert 'id="j166-update-title"' in dashboard and 'href="#atlas-updates"' in dashboard
css=(r/'atlas166-update-notice.css').read_text(encoding='utf-8')
assert css.count('{')==css.count('}') and '@media(max-width:810px)' in css
assert 'legacy' not in css.lower() and '.svg' not in css
print('Atlas 16.6: scoped Cloudflare frame protection, honest update/saves card, mobile layout PASS')
