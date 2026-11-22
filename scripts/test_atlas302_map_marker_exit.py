#!/usr/bin/env python3
"""Atlas 30.2: map marker exit does not change landmark records or persistence."""
from pathlib import Path
import subprocess
root=Path(__file__).resolve().parents[1]
script=(root/'atlas302-map-marker-exit.js').read_text(encoding='utf-8')
css=(root/'atlas302-map-marker-exit.css').read_text(encoding='utf-8')
for page in ['atlas.html','atlas-online.html','atlas-vi.html']:
 html=(root/page).read_text(encoding='utf-8')
 assert html.count('atlas302-map-marker-exit.js?v=302')==1,page
 assert html.count('atlas302-map-marker-exit.css?v=302')==1,page
 for id in ('selectedCard','closeSelected','atlasCanvas','selectedName'):
  assert 'id="'+id+'"' in html,(page,id)
assert "close.click()" in script,'Return must reuse existing map selection handler'
assert "canvas.focus({preventScroll:true})" in script
assert "if(event.key==='Escape'" in script
assert "if(!card||!close||!canvas" in script
assert "localStorage.setItem" not in script and "history.pushState" not in script and "location.assign" not in script
assert "position:fixed" in css and "max-height" in css and "overscroll-behavior:contain" in css
assert "max-height:calc(100dvh - 72px)" in css
assert "min-height:44px" in css and "min-width:44px" in css
assert "prefers-reduced-motion" in css
for name in ('atlas302-map-marker-exit.js','atlas.js'):
 x=subprocess.run(['node','--check',str(root/name)],capture_output=True,text=True)
 assert x.returncode==0,x.stderr
print('Atlas 30.2 source checks passed: three map pages, non-destructive close, 44px controls, short landscape')
