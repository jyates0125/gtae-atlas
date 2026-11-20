#!/usr/bin/env python3
"""Source checks: modern classic map pointer gestures and accessible zoom are present."""
from pathlib import Path
r=Path(__file__).resolve().parents[1]
js=(r/'atlas98-classic.js').read_text()
css=(r/'atlas98-classic.css').read_text()
for part in ['const pointers=new Map()','function setZoom(next,clientX,clientY)','function spacing()','pointercancel','lostpointercapture','pinch.zoom*span.distance/pinch.distance','setZoom(scale*1.3)','Map fitted to viewport.','classicZoomLevel',"e.key==='0'"]:
    assert part in js,part
assert "pointer=null" not in js
assert 'touch-action:none' in css
assert 'min-height:44px' in css
assert 'zoom>=6' in js
assert 'team-jura:classic-change' in js
print('Atlas 15.7 classic map zoom/pinch source contract PASS')
