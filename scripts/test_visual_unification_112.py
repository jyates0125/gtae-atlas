#!/usr/bin/env python3
"""Team Jura Atlas 11.2 — current designed-brand visual parity guard.
Presentation-only verification; never rewrites player data or map controls.
"""
from pathlib import Path
from html.parser import HTMLParser
ROOT=Path(__file__).resolve().parents[1]
pages=('atlas-activities.html','directory.html','discovery.html','explorer.html','online-explorer.html','legacy-explorer.html','leonida-hq.html','atlas8-preview.html','atlas81-hq.html','atlas87-daily.html')
class Inspect(HTMLParser):
    def __init__(self):
        super().__init__();self.ids=set();self.class_attrs=[];self.urls=[]
    def handle_starttag(self,t,attrs):
        data=dict(attrs)
        if 'id' in data:
            assert data['id'] not in self.ids, 'duplicate ID '+data['id']
            self.ids.add(data['id'])
        if 'class' in data:self.class_attrs.extend(data['class'].split())
        for k in ('src','href'):
            value=data.get(k,'')
            if value.startswith('./'):self.urls.append(value.split('?',1)[0].split('#',1)[0][2:])
css=(ROOT/'atlas112-unified-design.css').read_text(encoding='utf8')
assert css.count('{')==css.count('}')
assert 'body.j112-activities .j112-activity-hero' in css
assert 'atlas93-dispatch-hero.webp' in css
assert (ROOT/'art/atlas93-dispatch-hero.webp').stat().st_size>10000
assert (ROOT/'art/elario-crest.svg').stat().st_size>100
for page in pages:
    raw=(ROOT/page).read_text(encoding='utf8')
    obj=Inspect();obj.feed(raw)
    assert './atlas112-unified-design.css?v=112' in raw,page
    assert ('j112-activities' if page=='atlas-activities.html' else 'j112-unified') in obj.class_attrs,page
    assert '<title>' in raw and 'Elario Studios</title>' in raw,page
    assert '9.3 · Community Preview |' not in raw,page
    assert all((ROOT/url).is_file() for url in obj.urls if url), (page,[x for x in obj.urls if x and not (ROOT/x).is_file()])
activity=Inspect();activity.feed((ROOT/'atlas-activities.html').read_text(encoding='utf8'))
for id in ('headline','intro','linkStory','linkOnline','linkVi','onlineControls','storyControls','viControls','ruleCount','completeCount','activeCount','statusCount','ruleList','search','group','export','resetProgress','gameHour','events','prereqs','importSnapshot','clearSnapshot','message'):
    assert id in activity.ids,id
activity_html=(ROOT/'atlas-activities.html').read_text(encoding='utf8')
assert 'ELARIO STUDIOS PRESENTS' in activity_html and 'MANY CREWS · ONE VISION' in activity_html
assert './atlas87-daily.html' in activity_html and './atlas93-dispatch.html' in activity_html
assert (ROOT/'atlas-activities.js').read_text().count("jura68-conditions-")>=1,'Do not rewrite saved activity progress key'
assert "const legacy=" in (ROOT/'atlas97-connect.js').read_text()
assert 'Earlier workspace preserved' not in (ROOT/'atlas97-connect.js').read_text()
print('Atlas 11.2 visual unification contract PASS: 10 redesigned pages, all functional controls and asset URLs preserved')
