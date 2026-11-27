#!/usr/bin/env python3
"""Team Jura Atlas 12.7: multi-game cheat guide and sourced Rockstar news regression."""
from pathlib import Path
from html.parser import HTMLParser
import json
ROOT=Path(__file__).resolve().parents[1]
read=lambda path:(ROOT/path).read_text(encoding='utf-8')
db=json.loads(read('data/atlas-news-cheats.json'))
assert db['schema']==1 and db['checkedAt']>='2026-11-18'
assert len(db['news'])>=5
counts={'story':36,'sa':17,'iii':24,'vc':58,'iv':16,'tlad':6,'tbogt':9,'lcs':11,'vcs':11,'ctw':21}
for game,num in counts.items():
 assert len([x for x in db['cheats'] if x['game']==game])>=num,game
assert all(x['game'] in counts for x in db['cheats'])
assert len(db['cheats'])==209
assert len([x for x in db['cheats'] if x['game']=='ctw' and x.get('ds')])==16
assert len([x for x in db['cheats'] if x['game']=='ctw' and x.get('mobile')])==15
assert all(x['game'] in db['credits'] for x in db['cheats'])
for x in db['cheats']:
 assert x['name'] and x['group'] and (x.get('code') or x.get('ps') or x.get('phone') or x.get('ds') or x.get('mobile')),x
 if x.get('code'):assert x['code'].isalnum() and x['code'].upper()==x['code'],x
 if x.get('ps'):assert all(t in {'Cross','Circle','Square','Triangle','Up','Down','Left','Right','L1','L2','R1','R2'} for t in x['ps'].split())
 if x.get('ds'):assert x['game']=='ctw' and all(t in {'A','B','X','Y','L','R','Up','Down','Left','Right'} for t in x['ds'].split())
 if x.get('mobile'):assert x['game']=='ctw' and x['mobile'].isalpha() and x['mobile'].isupper()
assert len({(x['game'],x.get('code') or x.get('phone') or x['name']) for x in db['cheats']})==len(db['cheats'])
assert all(x['url'].startswith(('https://www.rockstargames.com/','https://support.rockstargames.com/')) for x in db['news'])
assert all(x['date']<=db['checkedAt'] for x in db['news'])
assert all(x['game'] in ('vi','online') for x in db['news'])
class Parser(HTMLParser):
 def __init__(self):super().__init__();self.ids=set();self.links=set();self.mode=''
 def handle_starttag(self,tag,attrs):
  p=dict(attrs)
  if p.get('id'):assert p['id'] not in self.ids,p['id'];self.ids.add(p['id'])
  if tag=='body':self.mode=p.get('data-hub','')
  if tag in ('a','script','link'):
   ref=p.get('src') or p.get('href')
   if ref:self.links.add(ref)
for page,mode,js_ver,css_ver in [('atlas-cheats.html','cheats','131','131'),('atlas-news.html','news','355','103a')]:
 p=Parser();p.feed(read(page));assert p.mode==mode
 assert {'main','hubGame','hubSearch','hubCards','hubCount','hubSources','resultsTitle','resetHub'}.issubset(p.ids)
 assert f'./atlas103-hub.js?v={js_ver}' in p.links
 assert f'./atlas103-hub.css?v={css_ver}' in p.links
 assert './atlas-credits.html' in p.links
 if mode=='cheats':
  assert {'hubPlatform','cheatPlatformHelp'}.issubset(p.ids)
  for game in list(counts)+['vi','online']:
   assert f'value="{game}"' in read(page),game
js=read('atlas103-hub.js')
for text in ('MODERN_PHONE','PS_TO_XBOX','PS3_HD','X360_SWAP','function available','function cheatCard','function newsCard','copyText','syncPlatform','whiteboard'):
 assert text in js
assert './atlas-dashboard.html' in read('index.html') and 'Continue as Guest' in read('index.html')
assert './atlas-cheats.html' not in read('index.html') and './atlas-news.html' not in read('index.html')
for page in ('atlas-dashboard.html','maps.html','atlas97-journey.html','atlas81-hq.html'):
 h=read(page);assert './atlas-cheats.html' in h and './atlas-news.html' in h
print('PASS Atlas multi-game cheat guide, edition selectors, verified newsroom and credits')
