#!/usr/bin/env python3
"""Atlas 10.5 script-derived San Andreas collectible map-pin overlay provenance."""
from pathlib import Path
import json, math
D=Path(__file__).resolve().parents[1]
data=json.loads((D/'data/atlas-sa-approx-collectibles.json').read_text(encoding='utf8'))
assert data['schema']==1 and data['game']=='san-andreas'
assert data['width']==data['height']==6000
assert data['basis']=='approx-linear-world-to-vector-pixels'
assert data['verifiedMapPosition'] is False
assert data['image']=='./art/atlas-sa-vector.svg'
assert 'Flentric/SA.MapCollectibles' in data['source']
assert (D/'data/atlas-sa-coordinates-MIT-LICENSE.txt').exists()
assert 'MIT License' in (D/'data/atlas-sa-coordinates-MIT-LICENSE.txt').read_text(encoding='utf8')
assert len(data['records'])==150
counts={'snapshots':0,'horseshoes':0,'oysters':0}
seen=set()
for p in data['records']:
    assert p['set'] in counts
    assert isinstance(p['slot'],int) and 1<=p['slot']<=50
    assert (p['set'],p['slot']) not in seen
    seen.add((p['set'],p['slot']))
    counts[p['set']]+=1
    assert p['verifiedMapPosition'] is False
    assert math.isclose(p['x'],3000+p['worldX'],rel_tol=0,abs_tol=.0001)
    assert math.isclose(p['y'],3000-p['worldY'],rel_tol=0,abs_tol=.0001)
    assert 0<=p['x']<=6000 and 0<=p['y']<=6000
assert counts=={'snapshots':50,'horseshoes':50,'oysters':50}
html=(D/'atlas-sa.html').read_text(encoding='utf8')
code=(D/'atlas85-sa.js').read_text(encoding='utf8')
enhance=(D/'atlas86-sa-enhance.js').read_text(encoding='utf8')
loader=(D/'atlas105-sa-sourced-pins.js').read_text(encoding='utf8')
assert 'id="showApproximate"' in html and 'atlas105-sa-sourced-pins.js?v=105' in html
assert 'atlas105-sa-sourced-pins.css?v=105' in html
assert 'MIT license notice' in html
assert "isVectorReady" in code and "loadSourcedApproximate" in code
assert "if(positions.length&&!approximateBuiltIn)return false" in code
assert "team-jura-sa-v1" in code
assert "jura-sa-vector-ready" in enhance and loader
assert "atlas-sa-approx-collectibles.json" in loader
assert "j105-approx-pin" in code
assert (D/'art/atlas-sa-vector.svg').exists()
print('PASS Atlas 10.5: 150 credited script-derived approximate SA pins and original progress/import protection')
