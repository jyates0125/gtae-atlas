#!/usr/bin/env python3
from pathlib import Path
r=Path(__file__).resolve().parents[1]
vi=(r/'atlas-vi.html').read_text()
js=(r/'atlas171-research-usability.js').read_text()
css=(r/'atlas171-research-usability.css').read_text()
brand=(r/'atlas128-map-chrome.css').read_text()
for f in ['atlas171-research-usability.js?v=171','atlas171-research-usability.css?v=171']:
 assert f in vi,f
assert "document.body.dataset.startWorld!=='6'" in js
for s in ['j171-expand-map','j171-bright-map','requestAnimationFrame(redraw)','j171-full-map']:
 assert s in js,s
assert "e.key==='Escape'" in js
assert 'height:77dvh' in css and 'brightness(1.32)' in css
assert css.count('{')==css.count('}')
for name in ['jura155-story.webp','jura155-online.webp','jura155-vi.webp']:
 assert name in brand and (r/'art'/name).is_file(),name
for old in ['atlas93-los-santos.svg','atlas93-gta-online.svg','atlas93-leonida.svg']:
 assert old not in brand,old
print('Atlas 17.1: brighter and expandable VI map, premium V/Online/VI headers PASS')