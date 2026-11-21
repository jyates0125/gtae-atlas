#!/usr/bin/env python3
"""Atlas 15.4: three map engines keep native zoom, plus accessible mobile control and 3D delegation."""
from pathlib import Path
root=Path(__file__).resolve().parents[1]
pages=['atlas.html','atlas-online.html','atlas-vi.html']
for page in pages:
 html=(root/page).read_text(encoding='utf-8')
 assert 'atlas154-map-zoom.css?v=154' in html,page
 assert 'atlas154-map-zoom.js?v=154' in html,page
 for key in ['id="zoomIn"','id="zoomOut"','id="resetView"','id="atlasCanvas"']:
  assert key in html,(page,key)
css=(root/'atlas154-map-zoom.css').read_text(encoding='utf-8')
js=(root/'atlas154-map-zoom.js').read_text(encoding='utf-8')
for token in ['z-index:55','touch-action:manipulation','env(safe-area-inset-right','min-width:48px']:
 assert token in css,token
for token in ['jura3dZoomIn','jura3dZoomOut','stopImmediatePropagation','reset.click()','DOMContentLoaded']:
 assert token in js,token
print('Atlas 15.4 native map zoom controls: PASS')
