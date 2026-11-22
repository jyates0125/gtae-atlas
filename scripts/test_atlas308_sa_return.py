#!/usr/bin/env python3
"""Atlas 30.8 SA Back-to-map UI source and scope guard."""
from pathlib import Path
import subprocess
root=Path(__file__).resolve().parents[1]
html=(root/'atlas-sa.html').read_text()
js=(root/'atlas308-sa-return.js').read_text()
css=(root/'atlas308-sa-return.css').read_text()
for tag in ('mapContainer','items','pinLayer','search'):
 assert 'id="'+tag+'"' in html,tag
for f in ('atlas308-sa-return.js?v=308','atlas308-sa-return.css?v=308'):
 assert html.count(f)==1,f
for text in ('goBack()','selectedPoint','pin.dataset.juraSaPoint',"event.key!=='Escape'","focus({preventScroll:true})"):
 assert text in js,text
for forbidden in ('localStorage','indexedDB','history.pushState','history.replaceState','transform.scale=','mapContents.style'):
 assert forbidden not in js,forbidden
assert 'min-height:44px' in css and 'focus-visible' in css
for f in ('atlas85-sa.js','atlas308-sa-return.js'):
 p=subprocess.run(['node','--check',str(root/f)],capture_output=True,text=True)
 assert p.returncode==0,(f,p.stderr)
print('Atlas 30.8 San Andreas map return source checks passed')
