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
# The illustrative (aria-hidden) 2D canvas must never swallow real Cayo taps.
assert "body.j180-cayo.j181-map-hotspots .j167-canvas{pointer-events:none!important}" in css
assert "j180-chest.j180-chest-active:after" in css
assert "background:transparent!important" in css
assert "width:clamp(19px" in css
assert "atlas181-cayo-hotspots.js?v=191" in loader
assert "atlas181-cayo-hotspots.css?v=202" in loader
assert "if(heistId==='cayo-perico')" in loader
assert "if(document.body.dataset.heist!=='cayo-perico'" in js
assert "teamjura-heist-focus-v1:" not in js
assert "teamjura-cayo-daily-choice-v1" in source
assert "(68+(spawn.worldX-3900)*.698)/1284*100" in source
assert "(38+(-4293-spawn.worldY)*.69)/1262*100" in source
# Audited published game-space anchors must project close to the actual
# yellow source-image dot centers (not merely be scattered around an island).
import json
spots=json.loads((root/'data/cayo-treasure-spots.json').read_text())['spawns']
anchors={1:(70,327),2:(270,87),4:(710,52),7:(1249,676),8:(1150,1122),15:(796,39),19:(788,638)}
for p in spots:
 if p['id'] in anchors:
  x=68+(p['worldX']-3900)*.698
  y=38+(-4293-p['worldY'])*.69
  ax,ay=anchors[p['id']]
  assert abs(x-ax)<20 and abs(y-ay)<23,(p['id'],x,y,ax,ay)

assert js.count('{') == js.count('}')
assert css.count('{') == css.count('}')
print("Atlas 18.1: native generic pins removed; colored map hotspots clickable + legend synced + daily source preserved PASS")
