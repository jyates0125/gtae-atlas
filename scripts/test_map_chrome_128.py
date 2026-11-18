#!/usr/bin/env python3
"""Atlas 12.8 visual map shell: check game-specific art and unchanged functional controls."""
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
css=(ROOT/"atlas128-map-chrome.css").read_text(encoding="utf-8")
worlds={
 "atlas.html":("5","atlas93-los-santos.svg"),
 "atlas-online.html":("online","atlas93-gta-online.svg"),
 "atlas-vi.html":("6","atlas93-leonida.svg"),
}
for page,(mode,art) in worlds.items():
 html=(ROOT/page).read_text(encoding="utf-8")
 assert '<body data-start-world="'+mode+'" class="j117-map-world j128-map-chrome">' in html,page
 assert './atlas128-map-chrome.css?v=128' in html,page
 for id in ("sidebar","search","legend","allOn","allOff","atlasCanvas","atlasFilterDrawer","districtFilter","dataStatus"):
  assert 'id="'+id+'"' in html,(page,id)
 assert './atlas.js?v=103-tiles' in html,page
 assert 'url(\'./art/'+art+'\')' in css,art
 assert (ROOT/"art"/art).is_file(),art
 assert "atlas117-world-brand.css?v=117" in html
assert "body.j128-map-chrome" in css
assert "prefers-reduced-motion" in css
assert "localStorage.setItem(" not in css
print("PASS Atlas 12.8: world-accurate original brand art, 3 map shells and untouched controls")
