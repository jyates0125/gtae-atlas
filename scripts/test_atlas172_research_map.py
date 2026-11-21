#!/usr/bin/env python3
"""Atlas 17.2: accessible, full-height licensed GTA VI community map."""
from pathlib import Path
r=Path(__file__).resolve().parents[1]
html=(r/'atlas-research.html').read_text()
js=(r/'atlas172-research-map.js').read_text()
css=(r/'atlas172-research-map.css').read_text()
for part in ['atlas172-research-map.js?v=218','atlas172-research-map.css?v=218','id="maparea"','id="map"']:
 assert part in html,part
for part in ['j172-research-tools','j172-expand','j172-bright','j172-pins','j172-full-map','requestAnimationFrame(onResize)','Escape']:
 assert part in js,part
assert 'min-height:580px' in css and 'height:78dvh' in css
assert 'brightness(1.12)' in css and css.count('{')==css.count('}')
assert 'j172-map-expanded #rail.open' in css
print('Atlas 17.2: GTA VI Community Research map size, contrast, fullscreen and filters PASS')