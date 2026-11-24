#!/usr/bin/env python3
"""Map shell regression: preserve controls and the current approved cinematic art."""
from pathlib import Path
import re
ROOT=Path(__file__).resolve().parents[1]
worker_version=re.search(r'\./atlas-sw\.js\?v=(\d+)',(ROOT/'atlas.js').read_text(encoding='utf-8'))
assert worker_version, 'Core map worker version missing'
css=(ROOT/"atlas128-map-chrome.css").read_text(encoding="utf-8")
worlds={
 "atlas.html":("5","jura155-story.webp"),
 "atlas-online.html":("online","jura155-online.webp"),
 "atlas-vi.html":("6","jura155-vi.webp"),
}
for page,(mode,art) in worlds.items():
 html=(ROOT/page).read_text(encoding="utf-8")
 assert '<body data-start-world="'+mode+'" class="j117-map-world j128-map-chrome">' in html,page
 assert './atlas128-map-chrome.css?v=128' in html,page
 for id in ("sidebar","search","legend","allOn","allOff","atlasCanvas","atlasFilterDrawer","districtFilter","dataStatus"):
  assert 'id="'+id+'"' in html,(page,id)
 assert html.count('./atlas.js?v=375')==1,page
 assert 'url(\'./art/'+art+'\')' in css,art
 assert (ROOT/"art"/art).is_file(),art
 assert "atlas117-world-brand.css?v=117" in html
assert "body.j128-map-chrome" in css
assert "prefers-reduced-motion" in css
assert "localStorage.setItem(" not in css
print("PASS map shell: 3 approved cinematic game headers and untouched map controls")
