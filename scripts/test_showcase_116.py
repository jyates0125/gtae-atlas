#!/usr/bin/env python3
"""Atlas 11.6: current Project Showcase, QA center and collection labels."""
from pathlib import Path
from html.parser import HTMLParser
ROOT=Path(__file__).resolve().parents[1]
class Check(HTMLParser):
    def __init__(self):
        super().__init__();self.links=[];self.ids=set();self.img=[]
    def handle_starttag(self,tag,attrs):
        d=dict(attrs)
        if 'id' in d:
            assert d['id'] not in self.ids, ('duplicate id',d['id'])
            self.ids.add(d['id'])
        for k in ('src','href'):
            v=d.get(k,'')
            if v.startswith('./'):
                self.links.append(v.split('?',1)[0].split('#',1)[0][2:])
        if tag=='img':self.img.append(d.get('src',''))
for path in ('project.html','atlas98b-test.html','atlas-checklist.html'):
    text=(ROOT/path).read_text(encoding='utf-8')
    p=Check();p.feed(text)
    missing=[v for v in p.links if v and not (ROOT/v).is_file()]
    assert not missing,(path,missing)
    assert 'ELARIO STUDIOS' in text,path
    assert '7.0 Preview' not in text and 'TEAM JURA ATLAS 7.4' not in text and 'ATLAS 9.3' not in text,path
    if path=='project.html':
        assert 'atlas116-showcase.css?v=116' in text
        assert 'j116-showcase' in text and 'MANY CREWS · ONE VISION' in text
        assert 'https://github.com/jyates0125/team-jura-atlas-preview' in text
        assert 'leonida-explorer' not in text
        assert './atlas-credits.html' in text
        assert './one-last-ride.html' in text
        assert 'Full One Last Ride community film' in text
    if path=='atlas98b-test.html':
        assert './art/elario-crest.svg' in p.img
        assert 'MANY CREWS · ONE VISION' in text
        for control in ('qaRunCore','qaRunAll','qaExport','qaStatus','qaResults'):
            assert control in p.ids,(path,control)
    if path=='atlas-checklist.html':
        for control in ('summaryDone','modeStory','modeOnline','setList','itemGrid','exportProgress','importProgress','setProgress'):
            assert control in p.ids,control
showcase=(ROOT/'atlas116-showcase.css').read_text(encoding='utf-8')
assert showcase.count('{') == showcase.count('}')
assert "atlas98-neon-poster.webp" in showcase
assert (ROOT/'art/atlas98-neon-poster.webp').stat().st_size>100_000
assert (ROOT/'art/elario-crest.svg').stat().st_size>100
print('Atlas 11.6 project, QA and collection visual parity PASS')
