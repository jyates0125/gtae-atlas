#!/usr/bin/env python3
"""Atlas 11.7: original E crest and current-game branding on flagship worlds."""
from pathlib import Path
import re
from html.parser import HTMLParser
ROOT=Path(__file__).resolve().parents[1]
worker_version=re.search(r'\./atlas-sw\.js\?v=(\d+)',(ROOT/'atlas.js').read_text(encoding='utf-8'))
assert worker_version, 'Core map worker version missing'
class Probe(HTMLParser):
    def __init__(self):super().__init__();self.ids=set();self.images=[];self.refs=[]
    def handle_starttag(self,tag,attrs):
        d=dict(attrs)
        if 'id' in d:self.ids.add(d['id'])
        if tag=='img':self.images.append(d.get('src',''))
        for k in ('src','href'):
            x=d.get(k,'')
            if x.startswith('./'):self.refs.append(x[2:].split('?',1)[0].split('#',1)[0])
css=(ROOT/'atlas117-world-brand.css').read_text(encoding='utf-8')
assert css.count('{')==css.count('}')
for page,expected_title in (
    ('atlas.html','GTA V Story Map'),
    ('atlas-online.html','GTA Online Map'),
    ('atlas-vi.html','GTA VI Leonida Interactive World Map'),
    ('atlas-cayo.html','Cayo Perico Heist Planner'),
    ('one-last-ride.html','One Last Ride')):
    data=(ROOT/page).read_text(encoding='utf-8')
    p=Probe();p.feed(data)
    assert './atlas117-world-brand.css?v=117' in data,page
    assert './art/elario-crest.svg' in p.images,page
    assert expected_title in data,page
    assert 'ATLAS 9.3 · EXPLORER EDITION' not in data,page
    assert 'TEAM JURA ATLAS 9.3' not in data,page
    assert '🍁❄️' not in data,page
    missing=[x for x in p.refs if x and not (ROOT/x).is_file()]
    assert not missing,(page,missing)
    if page.startswith('atlas.') or page in ('atlas-online.html','atlas-vi.html'):
        assert 'j117-map-world' in data,page
        for name in ('layer','atlasCanvas','legend','sidebar'):
            assert name in p.ids,(page,name)
        assert ('./atlas.js?v='+worker_version[1]) in data, 'Keep the original Atlas map engine linked on each game workspace; current cache revision must match'
    if page=='atlas-cayo.html':
        assert 'j117-cayo' in data and 'Illustrative schematic:' in data
    if page=='one-last-ride.html':
        assert 'j117-film' in data
        assert 'one-last-ride-motion-preview.mp4' in data
style=(ROOT/'atlas98-style-lab.html').read_text(encoding='utf-8')
assert 'ONE CREW · ONE VISION' not in style
assert 'MANY CREWS · ONE VISION · ONE LAST RIDE' in style
print('Atlas 11.7 flagship game headers, source images and saved-map controls PASS')
