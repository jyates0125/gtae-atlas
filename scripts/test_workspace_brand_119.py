#!/usr/bin/env python3
"""Atlas 11.9 designed-brand and source-state regression for active workspaces."""
from pathlib import Path
from html.parser import HTMLParser
ROOT=Path(__file__).resolve().parents[1]
class Reader(HTMLParser):
    def __init__(self):
        super().__init__();self.ids=set();self.srcs=[];self.urls=[]
    def handle_starttag(self,tag,attrs):
        d=dict(attrs)
        if d.get('id'):
            assert d['id'] not in self.ids,('Duplicate ID',d['id'])
            self.ids.add(d['id'])
        if tag=='img':self.srcs.append(d.get('src',''))
        for key in ('src','href'):
            u=d.get(key,'')
            if u.startswith('./'):self.urls.append(u[2:].split('#',1)[0].split('?',1)[0])
specs={
 'heists.html':('j119-heists',('heist-fleeca.html','heist-cayo-perico.html','heist-doomsday-act-3.html')),
 'atlas-iv.html':('j119-iv',('classicCanvas','classicLayer','classicSearch','recordStatus')),
 'atlas-research.html':('j119-research',('q','researchSourceStatus','groups','resultList','showResearchPins')),
 'atlas98-data-lab.html':('j119-lab',('sourceFile','sourceName','license','coordinateSystem','review'))
}
for name,(class_name,required) in specs.items():
    raw=(ROOT/name).read_text(encoding='utf-8')
    parsed=Reader();parsed.feed(raw)
    assert class_name in raw and './atlas119-workspace-brand.css?v=119' in raw,name
    assert './art/elario-crest.svg' in parsed.srcs,name
    assert 'MANY CREWS · ONE VISION' in raw,name
    assert 'ATLAS 9.3' not in raw,name
    assert 'Thanksgiving × Winter' not in raw,name
    assert not [p for p in parsed.urls if p and not (ROOT/p).is_file()],name
    for need in required:assert need in (parsed.ids if not need.endswith('.html') else raw),(name,need)
    if name=='atlas-research.html':
        assert 'community-provisional and not verified gameplay coordinates' in raw
    if name=='atlas-iv.html':
        assert 'GTADB · CC BY 4.0' in raw
    if name=='heists.html':
        assert 'NO FABRICATED' not in raw or 'Illustrative schematics' in raw
css=(ROOT/'atlas119-workspace-brand.css').read_text(encoding='utf-8')
assert css.count('{')==css.count('}')
assert (ROOT/'art/atlas93-heists.svg').is_file()
print('Atlas 11.9 original Elario heist/IV/research/data-lab parity and source preservation PASS')
