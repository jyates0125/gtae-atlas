#!/usr/bin/env python3
"""Atlas 11.5 Elario source/research UI consistency checks."""
from pathlib import Path
from html.parser import HTMLParser
ROOT=Path(__file__).resolve().parents[1]
pages=['atlas-calibration.html','atlas-coverage.html','atlas-verification.html','atlas-test-center.html','atlas-pack-format.html','atlas-feature-audit.html','atlas-completion.html']
class Scan(HTMLParser):
 def __init__(self):
  super().__init__();self.ids=set();self.classes=set();self.files=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if a.get('id'):self.ids.add(a['id'])
  self.classes.update(a.get('class','').split())
  for key in ('href','src'):
   u=a.get(key,'')
   if u.startswith('./'):self.files.append(u.split('?',1)[0].split('#',1)[0][2:])
css=(ROOT/'atlas115-research-workspaces.css').read_text()
assert css.count('{')==css.count('}')
assert (ROOT/'art/atlas98-approved-hero.webp').stat().st_size>10000
for name in pages:
 s=(ROOT/name).read_text()
 o=Scan();o.feed(s)
 assert 'j115-research' in o.classes and 'j112-unified' in o.classes,(name,'brand class')
 assert 'j115-source-head' in o.classes,(name,'original designed-brand hero')
 assert './atlas115-research-workspaces.css?v=115' in s,(name,'theme file')
 assert 'Elario Studios</title>' in s,(name,'current brand')
 assert '9.3 · Community Preview' not in s,(name,'legacy preview copy')
 assert all((ROOT/u).is_file() for u in o.files if u),(name,[u for u in o.files if u and not (ROOT/u).is_file()])
assert '2,335 / 3,401' not in (ROOT/'atlas-calibration.html').read_text(),'Old stale VI snapshot count still displayed'
assert '77 of 94' not in (ROOT/'atlas-calibration.html').read_text(),'Old 2026-11-11 provisional position count still displayed'
assert 'Versioned repository snapshots' in (ROOT/'atlas-calibration.html').read_text()
assert 'historical snapshot' in (ROOT/'atlas-feature-audit.html').read_text().lower(),'Older audit must not be presented as a current source certification'
assert 'not individually verified in gameplay' in (ROOT/'atlas-completion.html').read_text().lower()
assert 'original / authorized' in (ROOT/'atlas-pack-format.html').read_text().lower()
assert 'id="pass"' in (ROOT/'atlas-test-center.html').read_text()
for script in ('atlas-completion.js','atlas-verification.js','atlas-coverage.js'):
 assert (ROOT/script).stat().st_size>150,(script,'functional logic missing')
print('Atlas 11.5 research UI/source verification contract PASS: seven current-brand pages, source caveats intact')
