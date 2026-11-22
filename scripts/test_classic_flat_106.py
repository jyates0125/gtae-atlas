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
assert "function flatReference()" in js and "flatReference();" in js and "document.title=w.name+" in js
assert "The original game map appears above" in js
for id in ('classicFlatReference','classicFlatTitle','classicFlatDescription','classicFlatLink','classicFlatCredit'):
    assert f'id="{id}"' in page,id
assert 'src="./art/elario-crest.svg"' in page
assert "atlas108-local-map.js?v=108" in page
assert re.search(r"atlas98-classic\.js\?v=\d+",page) and re.search(r"atlas98-classic\.css\?v=\d+",page)
assert 'id="classicClearMap"' in page and 'id="classicImageFile"' in page
for control in ('classicMapAttribution','classicMapSourceLink','classicRetryMap'):
    assert f'id="{control}"' in page,control
for image in ('ViceCity-GTAVCS-map.png','5019685d9fa05493b4cea714ca968bf1.webp','1934-gtacw-full-map.jpg'):
    assert image in js,image
assert 'mapAlternates' in js and 'activeMapUrl' in js and 'image.onerror=next' in js
# Verify that the default map is real, world-specific geography, not the world cover art.
# External sources are cited individually; copied GTA III/Vice City/GTA IV images ship locally.
expected_default_maps={
    'iii':'./art/atlas128-gta3-radar.png',
    'vc':'./art/atlas128-vice-city-radar.png',
    'vcs':'https://gtwfilesie.grandtheftwiki.com/ViceCity-GTAVCS-map.png',
    'lcs':'https://wikiassets.net/gta-vi-1c4e11/images/5019685d9fa05493b4cea714ca968bf1.webp',
    'ctw':'https://www.igrandtheftauto.com/content/images/1934-gtacw-full-map.jpg',
    'tlad':'./art/atlas128-gta4-landmarks.jpg',
    'tbogt':'./art/atlas128-gta4-landmarks.jpg',
}
for world,image in expected_default_maps.items():
    assert re.search(r"\b"+world+r":\{name:[^\n]*map:'"+re.escape(image)+r"'",js), (world,image)
assert 'image.referrerPolicy' in js and 'loadOriginalWorldMap()' in js
assert "image.onerror=next" in js
assert "b.querySelector('span').hidden=true" in js
for name in ('atlas128-gta3-radar.png','atlas128-vice-city-radar.png','atlas128-gta4-landmarks.jpg'):
    assert (ROOT/'art'/name).stat().st_size>40_000,name

assert "j106-flat-reference" in css
assert "team-jura-atlas98-classic-" in js
assert "state.background" in js and "state.markers" in js
print('PASS Atlas 10.8: seven accurate reference links plus browser-local 2D map image controls')
