#!/usr/bin/env python3
"""Source-tag coverage data is generated only from bundled, attributed GTADB snapshots."""
import json, math
from collections import Counter
from pathlib import Path
r=Path(__file__).resolve().parents[1]
audit=json.loads((r/'data/atlas195-source-tags.json').read_text(encoding='utf-8'))
assert audit['schema']==1 and len(audit['sources'])==3
for source in audit['sources']:
 game=source['game'];data=json.loads((r/f'data/gtadb-{game}.json').read_text(encoding='utf-8'))
 assert source['records']==data['count']==len(data['records'])
 assert source['sourceUpdated']==data['sourceUpdated']
 assert source['scope']==('provisional/unverified game placement' if game=='6' else 'community-sourced landmark research, not collectible verification')
 tag_counts=Counter();mapped_counts=Counter();search_counts=Counter();mapped=0
 for item in data['records'].values():
  xy=item[1] if len(item)>1 else None
  valid=isinstance(xy,list) and len(xy)>=2 and all(isinstance(v,(int,float)) and not isinstance(v,bool) and math.isfinite(v) for v in xy[:2])
  mapped+=int(valid)
  tags={str(t).strip().lower() for t in (item[6] if len(item)>6 and isinstance(item[6],list) and item[6] else ['unclassified']) if str(t).strip()}
  for tag in tags:
   tag_counts[tag]+=1
   (mapped_counts if valid else search_counts)[tag]+=1
 assert mapped==source['mapped']==data['mappedCount']
 assert source['searchOnly']==data['searchOnlyCount']
 assert len(source['tags'])==len(tag_counts)
 for t in source['tags']:
  name=t['label']
  assert t['tagged']==tag_counts[name] and t['mapped']==mapped_counts[name] and t['searchOnly']==search_counts[name]
html=(r/'atlas-coverage.html').read_text(encoding='utf-8')
js=(r/'atlas195-source-tags.js').read_text(encoding='utf-8')
assert 'id="j195-source-tags"' in html and 'atlas195-source-tags.js?v=195' in html and 'atlas195-source-tags.css?v=195' in html
assert 'atlas195-source-tags.json' in js and "current.tags.filter" in js and "filtered.map" in js
sets=json.loads((r/'atlas-collections.json').read_text(encoding='utf-8'))['sets']
hq={x['id']:x for x in json.loads((r/'atlas81-collections.json').read_text(encoding='utf-8'))['sets']}
assert len(sets)==len({x['id'] for x in sets})==20
assert all(x['mode']==hq[x['id']]['mode'] and x['total']==hq[x['id']]['total'] for x in sets)
assert all(x['locationVerification']=='not-imported' and x['slotsAreLocations'] is False for x in sets)
coverage=(r/'atlas-coverage.js').read_text(encoding='utf-8')
assert 'scopeOf(row)!==category.scope' in coverage and 'Number.isFinite(row?.x)' in coverage
assert 'atlas81-hq.html?collection=' in coverage and 'match.mode!==r.mode||match.total!==r.total' in coverage
assert 'j229-collection-evidence' in html and 'j229-collection-rows' in html
print('Atlas 19.5/22.9: attributed source tags, 20 cross-checked collection sets, game-scoped reference counts: PASS')

# Pinned community source bundle: IDs and coordinates, not invented spots.
snapshot=json.loads((r/'data/atlas-story-source-snapshot.json').read_text(encoding='utf-8'))
assert snapshot['sourceCommit']=='584f2f1d2d1b33dd8a9e1dd8c0c55f37f002c4c3' and snapshot['license']=='WTFPL'
assert snapshot['originalCount']==276 and snapshot['count']==len(snapshot['records'])==275
assert len({x['id'] for x in snapshot['records']})==275
assert Counter(x['type'] for x in snapshot['records'])==snapshot['counts']
for item in snapshot['records']:
 assert set(item)=={'id','type','title','lat','lng'}
 x=103.22126231*item['lng']+12851.6855908
 y=5913.52505828*math.log(math.tan(math.pi/4+item['lat']*math.pi/360))-10162.16009065
 assert math.isfinite(x) and math.isfinite(y) and abs(x)<=16384 and abs(y)<=16384
print('PASS pinned Story community coordinate source, 275 unique bounded records')

# Source-specific numbering audit: do not use an arbitrary list index to claim a match.
import re
numbered_types={'Spaceship Part','Letter Scrap','Nuclear Waste','Stunt Jump','Under the Bridge','Knife Flight','Epsilon Tract'}
numbered=Counter()
for item in snapshot['records']:
 if item['type'] in numbered_types:
  numbered[item['type']]+=1
  assert int(re.search(r'#(\d+)\b',item['title']).group(1))==numbered[item['type']]
assert sum(numbered.values())==255
assert 'mappedProgress[mapped.id]' in (r/'atlas81-hq.js').read_text(encoding='utf-8')
assert 'routes[\'5\']=[...current,...additions]' in (r/'atlas-completion.js').read_text(encoding='utf-8')
print('PASS seven Story sets with 255 source-number-matched coordinates')
