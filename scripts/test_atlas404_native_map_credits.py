#!/usr/bin/env python3
from html.parser import HTMLParser
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
class Page(HTMLParser):
    def __init__(self): super().__init__(); self.ids=[]; self.href=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if 'id' in a:self.ids.append(a['id'])
        if tag=='a' and 'href' in a:self.href.append(a['href'])
def page(path):
    p=Page();p.feed((ROOT/path).read_text());return p
credits=page('atlas-credits.html')
for world in ['sa','iv']:
    name='atlas-'+world+'.html'
    m=page(name)
    anchor=world+'-map-sources'
    assert credits.ids.count(anchor)==1
    assert m.href.count('./atlas-credits.html#'+anchor)==1
    assert 'Sources &amp; credits' in (ROOT/name).read_text()
sa=page('atlas-sa.html');iv=page('atlas-iv.html')
for link in ['https://github.com/Toliak/San-Andreas-vector-map','https://dev.prineside.com/en/']:
    assert link in sa.href and link in credits.href
for link in ['https://github.com/rolux/gtadb.org','https://creativecommons.org/licenses/by/4.0/','https://github.com/whampson/pigeon-locator','https://opensource.org/license/mit']:
    assert link in iv.href
assert 'https://github.com/whampson/pigeon-locator/blob/de21b7df7ec8b10dfe5abe7290d894efbfc1bd11/LICENSE' in credits.href
assert 'https://github.com/Flentric/SA.MapCollectibles/blob/main/source/CollectibleCoords.h' in credits.href
assert 'Imported location pack format' in (ROOT/'atlas-sa.html').read_text()
for p in ['atlas-sa.html','atlas-iv.html','atlas-credits.html']:
    assert (ROOT/'public'/p).is_file()
print('PASS native SA/IV compact central source links, visible attribution and import guidance')
