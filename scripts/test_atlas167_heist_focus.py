#!/usr/bin/env python3
"""Atlas 16.7: focus-specific 15 heists, schematic honesty, saved progress, existing map safety."""
from pathlib import Path
p=Path(__file__).resolve().parents[1]
src=(p/'atlas167-heist-focus.js').read_text(encoding='utf-8')
css=(p/'atlas167-heist-focus.css').read_text(encoding='utf-8')
loader=(p/'heist-pages.js').read_text(encoding='utf-8')
old=(p/'atlas164-heist-workspace.js').read_text(encoding='utf-8')
ids=('fleeca','prison-break','humane-labs','series-a','pacific-standard','doomsday-act-1','doomsday-act-2','doomsday-act-3','diamond-casino','cayo-perico','cluckin-bell','salvage-yard','auto-shop','agency-vip','kortz-center')
assert len(ids)==15
for slug in ids:
 assert '"'+slug+'":' in src,slug
 assert (p/f'heist-{slug}.html').exists(),slug
assert 'j167-heist-map' in src and 'j167-canvas' in src
assert 'canvas.getContext' in src
assert "teamjura-heist-focus-v1:" in src and 'localStorage.setItem' in src
assert 'ILLUSTRATIVE POSITIONS · NOT GEOREFERENCED' in src and 'not real travel paths' in src
assert 'Chances & Progress' not in src and 'Challenges & progress' in src
assert "advancedRoutes=id!=='cayo-perico'" in src
for marker in ('closestSequence','data-route-point','Nearest next','Reverse order','Starting point updated.'):
 assert marker in src,marker
from hashlib import sha256
files=[p/'art'/('jura167-map-'+slug+'.webp') for slug in (*ids,'heist-hq')]
assert len(files)==16
assert all(f.is_file() and f.stat().st_size>20000 for f in files)
assert len({sha256(f.read_bytes()).hexdigest() for f in files})==16
assert "id==='kortz-center'?'./art/jura168-kortz-center-aerial.webp':'./art/jura167-map-'+id+'.webp'" in src and 'photoReady' in src
kortz=p/'art/jura168-kortz-center-aerial.webp'
assert kortz.is_file() and kortz.stat().st_size>100000
assert kortz.read_bytes()[:4]==b'RIFF' and kortz.read_bytes()[8:12]==b'WEBP'
assert "Regional support map · optional" in src and "Original Cayo island map · source reference" in src

assert 'jura159-heist-' in loader and 'atlas167-heist-focus.js?v=4743' in loader
assert 'atlas167-heist-focus.css?v=4743' in loader
assert 'teamjura-heist-plan-v1:' in old and "const map='./atlas-online.html'" in old
assert 'Wider GTA route-planning map' in old
assert css.count('{')==css.count('}')
assert '.j167-pin' in css and '@media(max-width:440px)' in css
print('Atlas 16.7: 15 focused mission map layouts, independent saves, optional regional map and accessible pins PASS')
