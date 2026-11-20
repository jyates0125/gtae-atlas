#!/usr/bin/env python3
"""Atlas 19.2: world-isolated weapons, honest VI evidence, garage usability, film treatment."""
from pathlib import Path
import json
r=Path(__file__).resolve().parents[1]
read=lambda p:(r/p).read_text(encoding='utf-8')
html=read('atlas90-weapons.html')
gallery=read('atlas90-gallery.js')
vihtml=read('atlas90-weapons6.html')
vijs=read('atlas192-weapons6.js')
vidata=json.loads(read('data/atlas192-vi-weapons.json'))
garagehtml=read('atlas93-garage.html')
garage=read('atlas93-garage.js')
film=read('one-last-ride.html')
story=read('film/atlas192-storyboard.js')
nav=read('atlas132-nav.js')
assert 'data-gallery="weapons"' in html
assert 'atlas192-armory-worlds.css?v=192' in html
assert 'atlas90-gallery.js?v=192' in html
assert 'atlas90-weapons.html?world=story' in html
assert 'atlas90-weapons.html?world=online' in html
assert 'atlas90-weapons6.html' in html
assert "const weaponWorld=game==='weapons'" in gallery
assert "'weapons-story':kind)+':'+key" in gallery
assert "const STORE='team-jura-atlas90-collection-v1'" in gallery
assert "weaponWorld==='story'?'GTA V Story Weapon References'" in gallery
assert "GTA V archive reference; availability in Story Mode needs per-item checking." in gallery
assert 'data/atlas192-vi-weapons.json' in vijs and 'teamjura-vi-weapon-notes-v1' in vijs
assert 'no GTA V equipment' not in vihtml.lower() or 'GTA V equipment' in vihtml
assert 'jura155-vi.webp' in read('atlas192-weapons6.css')
assert 'atlas90-weapons6.html' in nav
assert vidata['scope']=='vi' and vidata['kind']=='weapon' and vidata['schema']==1
assert len(vidata['records'])>=7
assert len({x['id'] for x in vidata['records']})==len(vidata['records'])
for x in vidata['records']:
 for key in ('id','name','group','grade','evidence','description','sourceName','sourceUrl'):
  assert x.get(key), (x.get('id'),key)
 assert x['sourceUrl'].startswith('https://'),x['id']
 assert not any(k in x for k in ('damage','spawn','price','rateOfFire','range','accuracy'))
assert 'art/jura161-vehicles.webp' in garage
assert 'j192-garage-empty' in garage
assert "team-jura-atlas93-garage-v1" in garage
assert 'atlas192-garage-empty.css?v=192' in garagehtml
assert 'atlas93-garage.js?v=192' in garagehtml
assert 'My vehicles' in garagehtml and 'Boats &amp;' not in garagehtml
assert 'olrSceneList' in film and 'one-last-ride-motion-preview.mp4' in film
assert 'film/atlas192-storyboard.js?v=192' in film
assert 'olrStoryboardPlay' in film and 'olrStoryboardRestart' in film
assert 'INTERVAL_MS=9000' in story
assert "const TOTAL=9" in story and "if(document.hidden)" in story
assert "NOT the full animated film" in story
print('PASS 19.2: isolated Story/Online/VI weapon routes, owned saves, VI sources, usable garage and film storyboard')
