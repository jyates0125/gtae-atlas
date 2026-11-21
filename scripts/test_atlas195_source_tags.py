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
print('Atlas 19.5 local source tags / mapped and search-only counts: PASS')
