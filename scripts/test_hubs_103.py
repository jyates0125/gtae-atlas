#!/usr/bin/env python3
"""Atlas 10.3 curated news and single-player cheat hub contract."""
from pathlib import Path
from html.parser import HTMLParser
import json
ROOT=Path(__file__).resolve().parents[1]
source=json.loads((ROOT/'data/atlas-news-cheats.json').read_text(encoding='utf-8'))
assert source['schema']==1 and source['checkedAt']=='2026-11-17'
assert len(source['cheats'])>=18 and len(source['news'])>=5
assert all(c['game'] in ('story','sa') for c in source['cheats']), 'No Online or speculative GTA VI cheats'
for code in source['cheats']:
    assert code['code'].isalnum() and code['code'].upper()==code['code']
    assert code['name'] and code['group']
assert len({(c['game'],c['code']) for c in source['cheats']})==len(source['cheats'])
assert all(n['url'].startswith(('https://www.rockstargames.com/','https://support.rockstargames.com/')) for n in source['news'])
assert all(n['date']<=source['checkedAt'] for n in source['news']), 'No articles from future'
assert all(n['game'] in ('vi','online') for n in source['news'])
class Parser(HTMLParser):
    def __init__(self):super().__init__();self.ids=set();self.mode='';self.links=set()
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if a.get('id'):assert a['id'] not in self.ids, 'Duplicate ID: '+a['id'];self.ids.add(a['id'])
        if tag=='body':self.mode=a.get('data-hub','')
        if tag in ('a','script','link'):
            ref=a.get('href') or a.get('src')
            if ref:self.links.add(ref)
for page,mode in (('atlas-cheats.html','cheats'),('atlas-news.html','news')):
    parser=Parser();parser.feed((ROOT/page).read_text(encoding='utf-8'))
    assert parser.mode==mode and {'main','hubGame','hubSearch','hubCards','hubCount','hubSources','resultsTitle','resetHub'}.issubset(parser.ids),page
    for file in ('atlas103-hub.css?v=103a','atlas103-hub.js?v=103a'):
        assert './'+file in parser.links and (ROOT/file.split('?')[0]).is_file()
    assert './atlas-credits.html' in parser.links
for page in ('index.html','maps.html','atlas97-journey.html','atlas81-hq.html'):
    text=(ROOT/page).read_text(encoding='utf-8')
    assert './atlas-cheats.html' in text and './atlas-news.html' in text,page
js=(ROOT/'atlas103-hub.js').read_text(encoding='utf-8')
assert 'copyText' in js and "data/atlas-news-cheats.json" in js
assert 'No matching entries' in js and 'No leaked or speculative codes are displayed' in js
assert 'document.body.dataset.hub' in js
print('PASS Atlas 10.3 official-news and offline single-player cheat hub')
