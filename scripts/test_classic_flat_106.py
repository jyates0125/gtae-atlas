#!/usr/bin/env python3
"""Team Jura Atlas 10.6: verify classic-era flat-map external references and their provenance."""
from pathlib import Path
import re
ROOT=Path(__file__).resolve().parents[1]
js=(ROOT/'atlas98-classic.js').read_text(encoding='utf8')
page=(ROOT/'map-hub.html').read_text(encoding='utf8')
css=(ROOT/'atlas98-classic.css').read_text(encoding='utf8')
expect={
'iii':'gta-3-map/',
'vc':'gta-vice-city-map/',
'vcs':'gta-vice-city-stories-map/',
'lcs':'gta-liberty-city-stories-map/',
'ctw':'gta-chinatown-wars-map/',
'tlad':'gta-4-map/',
'tbogt':'gta-4-map/'
}
for game,path in expect.items():
    assert f"{game}:{{url:'https://gtamap.io/{path}'" in js, game
assert "function flatReference()" in js and "flatReference();document.title=" in js
assert "The original game map appears above" in js
for id in ('classicFlatReference','classicFlatTitle','classicFlatDescription','classicFlatLink','classicFlatCredit'):
    assert f'id="{id}"' in page,id
assert 'src="./art/elario-crest.svg"' in page
assert "atlas108-local-map.js?v=108" in page
assert "atlas98-classic.js?v=129" in page and "atlas98-classic.css?v=108" in page
assert 'id="classicClearMap"' in page and 'id="classicImageFile"' in page
for control in ('classicMapAttribution','classicMapSourceLink','classicRetryMap'):
    assert f'id="{control}"' in page,control
for image in ('ViceCity-GTAVCS-map.png','LibertyCity-GTALCS-MapFull-ExceptUpstate.png','1934-gtacw-full-map.jpg'):
    assert image in js,image
assert 'mapAlternates' in js and 'activeMapUrl' in js and 'image.onerror=next' in js
assert "j106-flat-reference" in css
assert "team-jura-atlas98-classic-" in js
assert "state.background" in js and "state.markers" in js
print('PASS Atlas 10.8: seven accurate reference links plus browser-local 2D map image controls')
