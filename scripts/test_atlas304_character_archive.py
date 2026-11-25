#!/usr/bin/env python3
"""Atlas 30.4 — source evidence for character archive usability."""
import json
import subprocess
from pathlib import Path
root=Path(__file__).resolve().parents[1]
records=json.loads((root/'data/atlas-universe-profiles.json').read_text(encoding='utf-8'))['records']
records=[r for r in records if r.get('kind')=='character']
concepts=[r for r in records if r.get('preferConceptPortrait') is True and
          isinstance(r.get('conceptPortrait'),str) and r['conceptPortrait'].startswith('art/')]
assert len(records)==59 and len(concepts)==15,(len(records),len(concepts))
assert len(records)-len(concepts)==44
assert {r['scope'] for r in records}=={'classic','story','online','vi'}
assert {r['scope'] for r in records if r['name']=='Lamar Davis'}=={'story','online'}
html=(root/'atlas-characters.html').read_text(encoding='utf-8')
js=(root/'atlas222-characters.js').read_text(encoding='utf-8')
css=(root/'atlas222-characters.css').read_text(encoding='utf-8')
for token in ('data-j304-art="all"','data-j304-art="concept"','data-j304-art="reference"','j304-portrait-metrics'):
 assert html.count(token)==1,token
assert 'atlas222-characters.js?v=304' in html and 'atlas222-characters.css?v=304' in html
for token in ("hasLocalConcept", "visibleCharacters=display", "u.searchParams.set('art',art)",
              "u.searchParams.delete('art')", "history.replaceState(state,'',u)", "if(art!=='all'",
              "showProfile(dialog,next)", "art='all'"):
 assert token in js,token
assert 'j304-profile-browse' in css and '@media(max-height:540px)' in css
for name in ('atlas222-characters.js','atlas100-universe.js'):
 p=subprocess.run(['node','--check',str(root/name)],capture_output=True,text=True)
 assert p.returncode==0,(name,p.stderr)
print('Atlas 30.4 source contracts: 59 appearances, 15 local concepts, 44 reference/pending records, URL navigation')
