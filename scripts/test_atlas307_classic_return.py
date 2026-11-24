#!/usr/bin/env python3
"""Safe seven-world classic notebook map exit source checks."""
from pathlib import Path
import subprocess
root=Path(__file__).resolve().parents[1]
html=(root/'map-hub.html').read_text()
js=(root/'atlas307-classic-editor-return.js').read_text()
css=(root/'atlas307-classic-editor-return.css').read_text()
for id in ('classicEditor','markerCancel','markerName','markerCategory','markerNote','classicViewport','classicAddPin'):
 assert 'id="'+id+'"' in html,id
for n in ('atlas307-classic-editor-return.js?v=307','atlas307-classic-editor-return.css?v=307'):
 assert html.count(n)==1,n
for n in ("cancel.click()","add.click()","new MutationObserver(sync)","map.focus({preventScroll:true})","fingerprint()!==baseline"):
 assert n in js,n
assert not any(s in js for s in ('localStorage','indexedDB','history.pushState','history.replaceState'))
assert 'min-height:44px' in css and 'focus-visible' in css
for name in ('atlas98-classic.js','atlas307-classic-editor-return.js'):
 p=subprocess.run(['node','--check',str(root/name)],capture_output=True,text=True)
 assert p.returncode==0,(name,p.stderr)
print('Atlas 30.7 safe classic map return source checks passed')
