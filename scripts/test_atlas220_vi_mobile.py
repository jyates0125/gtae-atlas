#!/usr/bin/env python3
"""Atlas 22.0 source contract: preserve map semantics, original glyphs and VI phone recovery."""
from pathlib import Path
R=Path(__file__).resolve().parents[1]
engine=(R/'atlas.js').read_text(encoding='utf-8')
html=(R/'atlas-vi.html').read_text(encoding='utf-8')
style=(R/'atlas220-vi-mobile.css').read_text(encoding='utf-8')
code=(R/'atlas220-vi-mobile.js').read_text(encoding='utf-8')
legend=(R/'atlas.css').read_text(encoding='utf-8')
required=('collectible','vehicle','property','weapon','activity','gunstore','modshop','dealer','fuel','safehouse','marina','garage_site','business_site','landmark','transport','shop','food','hotel','nature','leisure','government','office','industry','utility','other','user')
glyphs=engine.split('const ELARIO_LEGEND_SHAPES=Object.freeze({',1)[1].split('});',1)[0]
for category in required:
 assert f" {category}:" in glyphs or f"'{category}':" in glyphs,('Missing SVG glyph',category)
assert 'elarioLegendGlyph(cat)' in engine
assert "r.category==='collectible'&&!r.activityId" in engine,'Do not recolor conditional event activity icons'
assert 'premium=false' in engine and 'completed=false' in engine
assert "!!progress[doneKey(r)]" in engine,'Completion must use original scoped saved state'
assert 'const APP=\'team-jura-atlas-v41\'' in engine,'Do not mutate main saved data schema'
assert 'const LEGEND_GROUPS=' in engine and 'aria-pressed' in engine
assert 'atlas220-vi-mobile.css?v=220' in html and 'atlas220-vi-mobile.js?v=220' in html
assert 'id="selectedCard"' in html and 'id="closeSelected"' in html
assert 'id="atlasCanvas"' in html
assert 'canvas.addEventListener(\'pointerup\'' in code and 'p.multi' in code
assert "close.click()" in code and 'selected=null' not in code
assert 'overscroll-behavior:contain' in style and 'min-width:44px' in style
assert 'body.j128-map-chrome #legend' in legend
print('PASS Atlas 22.0: VI panel lifetime, pointer isolation, 26 original legend glyphs, scoped premium collectables and saved key preservation')
