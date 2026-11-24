#!/usr/bin/env python3
"""Atlas 10.9: a single public brand-consistent, traceable credits page."""
from pathlib import Path
from html.parser import HTMLParser
import json
ROOT=Path(__file__).resolve().parents[1]
html=(ROOT/'atlas-credits.html').read_text(encoding='utf-8')
class Reader(HTMLParser):
    def __init__(self):
        super().__init__();self.ids=set();self.links=[];self.img=[];self.cards=0
    def handle_starttag(self,tag,attrs):
        d=dict(attrs)
        if d.get('id'):self.ids.add(d['id'])
        if tag=='a':self.links.append((d.get('href',''),d.get('target'),d.get('rel','')))
        if tag=='img':self.img.append(d.get('src',''))
        if tag=='article' and 'source-card' in d.get('class','').split():self.cards+=1
p=Reader();p.feed(html)
required={'main','pageTitle','creators','licensed','reference','worlds','notices','corrections'}
assert required.issubset(p.ids),required-p.ids
assert p.cards>=17,p.cards
assert '<h3>Fandom · legacy GTA Wiki</h3>' in html
assert '<h3>GTA Wiki · independent gta.wiki</h3>' in html
assert 'CC BY-NC-SA 3.0' in html and 'CC BY-SA 3.0' in html
assert (ROOT/'atlas109-credits.css').is_file()
assert './atlas109-credits.css?v=109' in html
assert './art/elario-crest.svg' in p.img
assert all(url.startswith('./') for url in p.img),"No new externally hotlinked credits-page images"
for name in ('Rockstar Games','Take-Two Interactive','GTADB.ORG','YANIS','DUPZOR','Toliak','Ian Albert','Flentric','CreepPork','GTAMap.io','GTA Wiki','Grand Theft Wiki','GTAWeb.eu','Stuyk','Mapheist','PowerPyx','Cfx.re'):
    assert name in html,name
assert 'MANY CREWS · ONE VISION' in html and 'ELARIO STUDIOS PRESENTS' in html
assert '2022 and 2026 leak-derived information' in html
assert 'MIT License' in html and 'THE SOFTWARE IS PROVIDED' in html
linkurls=[a[0] for a in p.links]
for needed in ('https://gtamap.io/disclaimer/','https://github.com/rolux/gtadb.org','https://gta.fandom.com/wiki/File:ViceCity-GTAVC-MapHD.jpg','https://ian-albert.com/games/grand_theft_auto_san_andreas_maps/','https://github.com/Toliak/San-Andreas-vector-map','https://support.rockstargames.com/articles/7bNaeoMFTV0iUDGhStTXvz/policy-on-posting-copyrighted-rockstar-games-material'):
    assert needed in linkurls,needed
for href,target,rel in p.links:
    if href.startswith('./'):
        target_path, _, fragment=href[2:].partition('#')
        target_file=ROOT/target_path.split('?',1)[0]
        assert target_file.is_file(),href
        if fragment and target_file.suffix=='.html':
            target_reader=Reader();target_reader.feed(target_file.read_text(encoding='utf-8'))
            assert fragment in target_reader.ids,href
    if href.startswith('https://') and target=='_blank':
        assert 'noopener' in rel and 'noreferrer' in rel,href
manifest=json.loads((ROOT/'data/atlas98-source-rights.json').read_text(encoding='utf-8'))
assert manifest['canonicalCreditsPage']=='atlas-credits.html'
assert manifest['version']=='10.9'
assert any(x['name']=='GTA Wiki Fandom legacy archive' for x in manifest['sources'])
assert any(x['name']=='GTA Wiki independent site' for x in manifest['sources'])
assert any(x['id']=='sa' and x['status'].startswith('Native licensed') for x in manifest['worlds'])
assert 'href="./atlas-credits.html"' in (ROOT/'index.html').read_text(encoding='utf-8')
assert 'href="./atlas-credits.html"' in (ROOT/'maps.html').read_text(encoding='utf-8')
assert 'GTAMap.io' in (ROOT/'atlas-source-registry.html').read_text(encoding='utf-8')
print('PASS Atlas 10.9: single branded credits page, 17 source cards, attributed upstream sources and preserved MIT notice')
