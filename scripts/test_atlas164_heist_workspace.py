#!/usr/bin/env python3
"""Guard approved heist images and source-aware real-map workspaces."""
from pathlib import Path
p=Path(__file__).resolve().parents[1]
ids=('fleeca','prison-break','humane-labs','series-a','pacific-standard','doomsday-act-1','doomsday-act-2','doomsday-act-3','diamond-casino','cayo-perico','cluckin-bell','salvage-yard','auto-shop','agency-vip','kortz-center')
js=(p/'atlas164-heist-workspace.js').read_text()
css=(p/'atlas164-heist-workspace.css').read_text()
loader=(p/'heist-pages.js').read_text()
old=(p/'atlas104-heist-experience.js').read_text()
oldcss=(p/'atlas104-heist-experience.css').read_text()
wf=(p/'.github/workflows/team-jura-release.yml').read_text()
assert len(ids)==15 and len(set(ids))==15
assert "scene.src='./art/atlas93-heist-" not in loader
assert 'jura159-heist-' in loader
assert 'atlas164-heist-workspace.js?v=164' in loader
assert 'atlas164-heist-workspace.css?v=164' in loader
assert 'atlas104-heist-schematic.svg' not in old
assert "style.maxHeight='185px'" not in old
assert 'atlas104-heist-schematic.svg' not in oldcss
assert "id==='cayo-perico'?'./atlas-cayo.html':'./atlas-online.html'" in js
assert 'teamjura-heist-plan-v1:' in js and 'localStorage.setItem' in js
assert 'frame.src=map' in js and 'frame.hidden=!visible' in js
assert 'j164-frame[hidden]' in css
assert "incoming.heist!==id" in js and "if(t.value.trim()){preserved++;continue}" in js
assert 'j228-import' in css
assert 'test_atlas164_heist_workspace.py' in wf
headers=(p/'_headers').read_text()
assert 'X-Frame-Options: DENY' in headers
for url in ('/atlas-online.html','/atlas-cayo.html'):
    section=headers.split(url+'\n',1)[1].split('\n\n',1)[0]
    assert '! X-Frame-Options' in section
    assert 'X-Frame-Options: SAMEORIGIN' in section
    assert "Content-Security-Policy: frame-ancestors 'self'" in section
# Account pages may now have stricter cache/privacy headers, but MUST keep
# the global DENY framing policy; only the two playable map frames are exempt.
assert '/atlas-account.html' in headers
account_headers=headers.split('/atlas-account.html\n',1)[1].split('\n\n',1)[0]
assert 'Cache-Control: no-store' in account_headers
assert 'Referrer-Policy: no-referrer' in account_headers
assert '! X-Frame-Options' not in account_headers and 'X-Frame-Options: SAMEORIGIN' not in account_headers

for id in ids:
    html=(p/('heist-'+id+'.html')).read_text()
    assert './heist-pages.js' in html
    assert 'src="./art/jura159-heist-'+id+'.webp"' in html
    assert 'id="progressBar"' in html and 'id="stepSearch"' in html
    assert ('./atlas-cayo.html' if id=='cayo-perico' else './atlas-online.html') in html
print('Atlas 16.4: 15 cinematic heists with real map embed and isolated personal notes PASS')
