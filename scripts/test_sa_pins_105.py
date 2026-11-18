#!/usr/bin/env python3
"""Check sourced SA 2D positions, projection, licensing and save-key preservation."""
from pathlib import Path
import json,math
D=Path(__file__).resolve().parents[1]
data=json.loads((D/'data/atlas-sa-150-sourced-pins.json').read_text(encoding='utf8'))
assert data['schema']==1 and data['game']=='san-andreas'
assert data['basis']=='image-pixels' and data['width']==data['height']==6000
assert data['counts']=={'snapshots':50,'horseshoes':50,'oysters':50}
assert len(data['records'])==150
assert 'Flentric/SA.MapCollectibles' in data['sourceUrl'] and 'MIT' in data['license']
assert 'approximate' in data['status'].lower()
seen=set()
for r in data['records']:
    name=r['set']
    assert name in ('snapshots','horseshoes','oysters')
    k=(name,r['slot']);assert k not in seen,k;seen.add(k)
    assert 1<=r['slot']<=50
    assert all(math.isfinite(r[x]) for x in ('x','y','worldX','worldY','worldZ'))
    assert 0<=r['x']<=6000 and 0<=r['y']<=6000
    assert math.isclose(r['x'],r['worldX']+3000,abs_tol=0.006),(k,r['x'])
    assert math.isclose(r['y'],3000-r['worldY'],abs_tol=0.006),(k,r['y'])
for category in ('snapshots','horseshoes','oysters'):
    assert sum(x['set']==category for x in data['records'])==50
license=(D/'docs/ATLAS-SA-COORDINATES-MIT-LICENSE.txt').read_text(encoding='utf8')
assert 'Copyright (c) 2026 Flentric' in license and 'MIT License' in license
assert (D/'art/atlas-sa-vector.svg').is_file() and (D/'art/atlas-sa-vector.LICENSE.txt').is_file()
js=(D/'atlas85-sa.js').read_text(encoding='utf8')
html=(D/'atlas-sa.html').read_text(encoding='utf8')
for required in ('loadAtlasSourcePins','atlas-sa-150-sourced-pins.json','builtIn=true','positions=verified','set=sets[1]','customMap=true','customPack=true',"KEY='team-jura-sa-v1'"):
    assert required in js,required
assert '150 source-backed approximate collectible pins' in html
assert 'atlas105-sa-pins.css?v=105' in html
assert 'atlas85-sa.js?v=105' in html
assert 'id="pinLayer"' in html
assert 'Flentric/SA.MapCollectibles' in html
print('PASS Atlas 10.5: 150 source-backed approximate SA pins, projection and full MIT license; existing progress save key preserved')
