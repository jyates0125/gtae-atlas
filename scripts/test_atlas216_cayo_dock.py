#!/usr/bin/env python3
"""Atlas 21.6: Cayo docks stay hidden even before the modern nav hydrates."""
from pathlib import Path
R=Path(__file__).resolve().parents[1]
html=(R/'heist-cayo-perico.html').read_text(encoding='utf-8')
css=(R/'atlas216-cayo-nav.css').read_text(encoding='utf-8')
assert './atlas216-cayo-nav.css?v=216' in html
assert 'body.j120-heist-page[data-heist="cayo-perico"] #j89-shell' in css
assert 'body.j120-heist-page[data-heist="cayo-perico"] #j98-flow' in css
assert 'display:none!important' in css
# The modern menu stays searchable, but is mounted inline in the Cayo header.
assert 'id="j216-inline-mount"' in html
assert 'position:relative!important' in css
assert '.j216-inline-nav .j132-nav' in css
assert '.j216-inline-nav #j132-nav-drawer' in css
assert "const cayoHost=document.getElementById('j216-inline-mount')" in (R/'atlas132-nav.js').read_text()
assert 'else document.body.append(wrap)' in (R/'atlas132-nav.js').read_text()
assert '#j89-shell' in (R/'scripts/test_atlas171_browser.py').read_text()
assert '#j132-nav-toggle' in (R/'scripts/test_atlas171_browser.py').read_text()
assert "atlas120-heist-worlds.css?v=120" in html
for page in ('heist-fleeca.html','heist-diamond-casino.html','heists.html'):
 assert 'atlas216-cayo-nav.css' not in (R/page).read_text()
print('PASS Atlas 21.6: Cayo legacy dock disabled early, modern All Pages retained, other heists untouched')
