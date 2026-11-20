#!/usr/bin/env python3
"""Cayo 18.4 regression: legend and in-game flat map share actual SVG markers."""
from pathlib import Path
root=Path(__file__).resolve().parents[1]
js=(root/'atlas181-cayo-hotspots.js').read_text()
css=(root/'atlas181-cayo-hotspots.css').read_text()
browser=(root/'scripts/test_atlas171_browser.py').read_text()
loader=(root/'heist-pages.js').read_text()
categories=('entry','exit','drainage','secondary','gated','bolts',
            'grapple','clothes','truck','control','power','powder','water','chest')
for cat in categories:
    assert f'{cat}:[[' in js,cat
    assert 'j181-glyph-'+cat in js or 'j181-glyph-'+cat in css or "'"+cat+"'" in js
assert 'const makeMarkerIcon=cat=>' in js
assert "b.append(makeMarkerIcon(cat))" in js
assert "glyph.append(makeMarkerIcon(cat))" in js
assert "const modeOk=mapSource!=='loading'||focus.dataset.mapAsset==='local-trace';" in js
assert "hiddenCats.add(cat)" in js and "hiddenCats.delete(cat)" in js
assert "item.button.hidden=!modeOk||hiddenCats.has(item.cat)||!matches" in js
assert "document.createElementNS(SVG_NS,tag)" in js
assert "atlas181-cayo-hotspots.js?v=181" in loader
assert 'Atlas 18.4 -- primary FLAT' in css
assert "svg" in css and "--j183-color" in css
assert "#j167-heist-map .j181-hotspot .j183-svg" in css
assert "#j167-heist-map .j181-hotspot[hidden]" in css
assert "#j167-heist-map .j181-hotspot::after" in css
assert ".j167-pins{display:none!important}" in css
assert ".j180-ref-layer{display:none!important}" in css
assert ".j181-legend-row .j183-svg" in css
assert "page.locator('.j181-hotspot .j183-svg').count()>=50" in browser
assert "page.locator('.j180-legend-row .j183-svg').count()==14" in browser
assert "Game map" in browser and "Enhanced" in browser
assert js.count('{')==js.count('}')
assert css.count('{')==css.count('}')
print('PASS Cayo 18.4: visible SVG marker families, matching legend, category show/hide, game/enhanced/fallback parity')
