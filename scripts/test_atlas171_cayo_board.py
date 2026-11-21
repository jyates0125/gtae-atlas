#!/usr/bin/env python3
"""Atlas 17.1 Cayo mission board focused regression checks."""
from pathlib import Path
r=Path(__file__).resolve().parents[1]
code=(r/'atlas171-cayo-board.js').read_text()
style=(r/'atlas171-cayo-board.css').read_text()
loader=(r/'heist-pages.js').read_text()
mapjs=(r/'atlas167-heist-focus.js').read_text()
for x in ['j171-cayo-board','teamjura-cayo-mission-v1','Infiltration','Compound','Escape','HALO Jump','Drainage Tunnel','Power Station','Main Dock','Kosatka','localStorage.setItem','URL.createObjectURL','aria-selected','ArrowRight']:
 assert x.lower() in code.lower(), x
assert "document.body.dataset.heist!=='cayo-perico'" in code
assert 'teamJuraHeistViews?.selectPOI' in code
assert 'teamJuraCayoRoute?.setRoute' in code
assert "atlas171-cayo-board.js?v=171" in loader
assert "atlas171-cayo-board.css?v=171" in loader
assert "'halo jump':" in mapjs
assert 'window.teamJuraCayoRoute' in mapjs
assert 'teamjura-heist-focus-v1:' in mapjs, 'Existing save key must remain'
assert 'jura159-heist-' in loader, 'Premium art must remain'
assert '<link rel="stylesheet" href="./atlas181-cayo-hotspots.css?v=202">' in (r/'heist-cayo-perico.html').read_text(), 'Cayo marker-hiding stylesheet must load in page head before async hotspots (Edge race)'
assert style.count('{')==style.count('}') and 'j171-board' in style and '@media(max-width:600px)' in style
print('Atlas 17.1 Cayo mission categories, selectors, entry+exit, local saves and preserved heist art PASS')
