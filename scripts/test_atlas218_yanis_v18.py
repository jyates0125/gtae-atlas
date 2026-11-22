#!/usr/bin/env python3
"""Atlas 21.8: restore the original Yanis V18 research view, without save-key changes."""
from pathlib import Path
r=Path(__file__).resolve().parents[1]
html=(r/'atlas-research.html').read_text(encoding='utf-8')
js=(r/'atlas-research.js').read_text(encoding='utf-8')
css=(r/'atlas172-research-map.css').read_text(encoding='utf-8')
ui=(r/'atlas172-research-map.js').read_text(encoding='utf-8')
assert "YANIS V18 · COMMUNITY MAP" in html
assert "YANIS and GTA VI Mapping Community" in html
assert "creativecommons.org/licenses/by/4.0/" in html
assert "Yanis V18 Research" in html
assert "atlas-research.js?v=218-yanis18" in html
assert "atlas172-research-map.css?v=218" in html
assert "atlas172-research-map.js?v=218" in html
assert "const YANIS18_HOME=Object.freeze({x:-4000,y:2000,z:1})" in js
assert "camera={...YANIS18_HOME}" in js
assert "camera.x=YANIS18_HOME.x" in js and "camera.z=YANIS18_HOME.z" in js
assert "yanis,18" in js and "https://maps.gtadb.org/tiles/6/" in js
assert "https://raw.githubusercontent.com/rolux/gtadb.org/" in js
assert "jura101-research-pins-visible" in js
assert "jura-research-66" in js
assert "filter:none" in css
assert "brightness(1.12)" in css and "brightness(1.38)" not in css
assert "top:125px;bottom:auto" in css
assert "j172-pins" in ui and "check.dispatchEvent(new Event('change'" in ui
assert "j172-back" in ui
assert "window.location.assign('./atlas-vi.html')" in ui
assert "page.classList.contains('j172-full-map')" in ui
assert "#j172-back" in css
assert "localStorage" not in ui  # toggle reuses existing saved checkbox
assert "atlas218" not in (r/'atlas.html').read_text()
assert "atlas218" not in (r/'atlas-online.html').read_text()
print("PASS Atlas 21.8: Yanis V18 source-aligned map, original colors, direct pin toggle, save and world isolation")
