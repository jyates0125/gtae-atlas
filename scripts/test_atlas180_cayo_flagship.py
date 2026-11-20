#!/usr/bin/env python3
"""Atlas 18: owner-approved Cayo map-first layout, 19 chest references, truthful daily status."""
from pathlib import Path
from datetime import datetime, timezone
import json
root=Path(__file__).resolve().parents[1]
script=(root/'atlas180-cayo-flagship.js').read_text()
style=(root/'atlas180-cayo-flagship.css').read_text()
loader=(root/'heist-pages.js').read_text()
sp=json.loads((root/'data/cayo-treasure-spots.json').read_text())
today=json.loads((root/'data/cayo-treasure-today.json').read_text())
assert len(sp['spawns'])==19
assert sorted(p['id'] for p in sp['spawns'])==list(range(1,20))
assert sum(p['kind']=='land' for p in sp['spawns'])==10
assert sum(p['kind']=='underwater' for p in sp['spawns'])==9
assert all(isinstance(p[k],(float,int)) for p in sp['spawns'] for k in ('worldX','worldY','worldZ'))
assert all(p['positionStatus'].startswith('published_game_world_xyz__display_projection_approximate') for p in sp['spawns'])
assert sp['source'].startswith('https://')
assert 1 <= today['land'] <= 10 and 11 <= today['underwater'] <= 19
start=datetime.fromisoformat(today['windowStartUTC'].replace('Z','+00:00'))
end=datetime.fromisoformat(today['windowEndUTC'].replace('Z','+00:00'))
assert (end-start).total_seconds()==86400
assert today['confidence']=='calculated_unconfirmed_in_game'
assert "Date.parse(dailyData.windowStartUTC)<=now.getTime()" in script
assert "now.getTime()<Date.parse(dailyData.windowEndUTC)" in script
assert "teamjura-cayo-daily-choice-v1" in script
assert "teamjura-heist-focus-v1:" not in script
assert "window.teamJuraHeistViews?.activate(mode)" in script
for key in ('j180-shell','j180-legend','j180-drawer','j180-map-frame','j180-chest-active','j180-chest-list','j180-modes'):
 assert key in script or key in style,key
assert 'body.j180-cayo' in style
assert "jura159-heist-cayo-perico.webp" in style
assert "atlas180-cayo-flagship.css?v=180" in loader
assert "atlas180-cayo-flagship.js?v=180" in loader
assert "if(heistId==='cayo-perico')" in loader
assert style.count('{')==style.count('}')
assert style.count('(')>=style.count(')')
assert (root/'art/jura159-heist-cayo-perico.webp').is_file()
assert 'j180-cayo' not in (root/'heist-theme.css').read_text(), 'Style may not alter other 14 heists'
print('PASS Atlas 18: Cayo owner-design, 19 source-backed chest points, expiring daily feed and preserved legacy data')


# Atlas 18.2: prevent invisible pins if externally hosted game art fails.
core=(root/'atlas167-heist-focus.js').read_text()
hotspots=(root/'atlas181-cayo-hotspots.js').read_text()
hotspot_css=(root/'atlas181-cayo-hotspots.css').read_text()
local_map=(root/'art/jura182-cayo-local-road-plan.svg').read_text()
assert '<svg' in local_map and 'viewBox="0 0 1284 1262"' in local_map
assert len(local_map)>1000 and len(local_map)<15000
assert 'jura182-cayo-local-road-plan.svg' in core
assert "juraLocalFallback=true" in core and "sec.dataset.mapAsset='local-trace'" in core
assert "setTimeout(()=>{if(!juraSourceReady" in core
assert "const makeMarkerIcon=cat=>" in hotspots
assert "b.append(makeMarkerIcon(cat))" in hotspots
assert "glyph.append(makeMarkerIcon(cat))" in hotspots
assert "#j167-heist-map .j181-hotspot .j183-svg" in hotspot_css
assert "data-map-asset" in hotspots
assert ".j181-hotspot[data-category=" in hotspot_css
assert ".j180-chest::before" in hotspot_css
assert ".j180-chest.j180-chest-active::before" in hotspot_css
assert 'atlas181-cayo-hotspots.js?v=181' in loader and 'atlas181-cayo-hotspots.css?v=181' in loader
print('PASS Atlas 18.2: local island fallback, visible marker symbols and chest-dot status integrity')
