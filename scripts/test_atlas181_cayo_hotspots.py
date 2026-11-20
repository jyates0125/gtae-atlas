#!/usr/bin/env python3
"""Atlas 18.1: owner requested the colored map's own icons to be interactive, not overlaid with second generic pins."""
from pathlib import Path
root=Path(__file__).resolve().parents[1]
js=(root/'atlas181-cayo-hotspots.js').read_text(encoding='utf8')
css=(root/'atlas181-cayo-hotspots.css').read_text(encoding='utf8')
loader=(root/'heist-pages.js').read_text(encoding='utf8')
source=(root/'atlas180-cayo-flagship.js').read_text(encoding='utf8')
for name in ('Infiltration points','Exit points','Drainage tunnel','Secondary targets','Gated secondary targets',
             'Bolt cutters','Grappling equipment','Guard clothing','Supply truck','Control tower','Power station',
             'Cutting powder','Water tower','Treasure chests'):
 assert name in js,name
for term in ('j181-hotspots','j181-hotspot','j180-legend-row','MutationObserver','aria-label',
             'j181-hide-chests','window.teamJuraHeistViews?.selectPOI','teamjura-cayo-map-references-v1'):
 assert term in js,term
assert "body.j180-cayo.j181-map-hotspots .j167-pins{display:none!important}" in css
assert "body.j180-cayo.j181-map-hotspots .j180-ref-layer{display:none!important}" in css
assert "body.j180-cayo.j181-map-hotspots .j167-chips{display:none!important}" in css
assert "j180-chest.j180-chest-active:after" in css
assert "background:transparent!important" in css
assert "width:clamp(19px" in css
assert "atlas181-cayo-hotspots.js?v=181" in loader
assert "atlas181-cayo-hotspots.css?v=181" in loader
assert "if(heistId==='cayo-perico')" in loader
assert "if(document.body.dataset.heist!=='cayo-perico'" in js
assert "teamjura-heist-focus-v1:" not in js
assert "teamjura-cayo-daily-choice-v1" in source
assert "6+(spawn.worldX-3900)/1700*86" in source
assert "2+(-4300-spawn.worldY)/1600*90" in source
assert js.count('{') == js.count('}')
assert css.count('{') == css.count('}')
print("Atlas 18.1: native generic pins removed; colored map hotspots clickable + legend synced + daily source preserved PASS")
