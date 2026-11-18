#!/usr/bin/env python3
"""Atlas 11.3 public tools alignment: no loss of controls or asset provenance."""
from pathlib import Path
from html.parser import HTMLParser
ROOT=Path(__file__).resolve().parents[1]
PAGES=('atlas-catalog.html','atlas-checklist.html','atlas-toolkit.html','atlas-passport.html','guides.html','team-jura.html','command-center.html','hunt-hq.html')
class Scan(HTMLParser):
 def __init__(self):
  super().__init__();self.ids=set();self.classes=set();self.local_links=[];self.text=[]
 def handle_starttag(self,tag,attrs):
  data=dict(attrs)
  if data.get('id'):self.ids.add(data['id'])
  self.classes.update(data.get('class','').split())
  for k in ('src','href'):
   url=data.get(k,'')
   if url.startswith('./'):self.local_links.append(url.split('?',1)[0].split('#',1)[0][2:])
 def handle_data(self,data):self.text.append(data)
css=(ROOT/'atlas113-workspaces.css').read_text(encoding='utf8')
assert css.count('{')==css.count('}')
assert "body.j113-workspace :is(.db-head,.tk-intro,.checkhead)" in css
assert (ROOT/'art/atlas98-approved-hero.webp').stat().st_size>10000
for name in PAGES:
 content=(ROOT/name).read_text(encoding='utf8')
 p=Scan();p.feed(content)
 assert 'j113-workspace' in p.classes,(name,'theme')
 assert 'j112-unified' in p.classes,(name,'unified theme')
 assert './atlas113-workspaces.css?v=113' in content,(name,'stylesheet')
 assert './atlas112-unified-design.css?v=112' in content,(name,'base stylesheet')
 assert 'Elario Studios</title>' in content,(name,'title')
 assert '9.3 · Community Preview |' not in content,(name,'placeholder')
 assert all((ROOT/path).is_file() for path in p.local_links if path),(name,[u for u in p.local_links if u and not (ROOT/u).is_file()])
 assert ('<main' in content or 'class="tk-shell"' in content or 'class="layout"' in content or 'class="db-wrap"' in content or 'class="portal-app"' in content),(name,'main workspace')
for name,wanted in {'atlas-catalog.html':('dbSearch','dbCards'), 'atlas-checklist.html':('setSearch','itemGrid'), 'atlas-toolkit.html':(), 'hunt-hq.html':('sidebar','search'), 'atlas-passport.html':()}.items():
 p=Scan();p.feed((ROOT/name).read_text(encoding='utf8'))
 for key in wanted:assert key in p.ids,(name,key)
hunt=(ROOT/'hunt-hq.html').read_text()
assert '34 PROVISIONAL LANDMARKS' in hunt
assert 'COLLECTION RESEARCH' in hunt and 'LEGACY · HUNT HQ' not in hunt
assert 'No verified GTA VI collectible claim' in hunt
assert '34 GTADB community landmarks' in hunt,'Do not claim 34 verified GTA VI points'
for file in ('atlas-catalog.js','atlas-checklist.js','atlas-toolkit.js','atlas-passport.js'):
 assert (ROOT/file).stat().st_size>300,(file,'functionality missing')
print('Atlas 11.3 designed-brand source/asset contract PASS: eight functional tools remain intact')
