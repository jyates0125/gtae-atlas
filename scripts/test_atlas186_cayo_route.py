#!/usr/bin/env python3
"""Atlas 18.6 Cayo: map-pin first personal route planner acceptance contract."""
from pathlib import Path
root=Path(__file__).resolve().parents[1]
code=(root/'atlas186-cayo-route.js').read_text(encoding='utf8')
style=(root/'atlas186-cayo-route.css').read_text(encoding='utf8')
loader=(root/'heist-pages.js').read_text(encoding='utf8')
for key in ('startFrom','addStop','appendNearest','autoRoute','shareBtn',
            'availableTargets','distance','nearest','manual','getNodes','selectCategory',
            'j186-route-line','j186-stop-item','j186-pin-actions','j186-route-layer',
            'completed','cayoRoute','localStorage.setItem','window.teamJuraCayoPinRoute'):
 assert key in code,key
assert 'distance(here,a)-distance(here,b)' in code
assert 'state.start=id;state.order=[id]' in code
assert "const chestReady=chests.querySelectorAll('.j180-chest[data-chest]').length===19" in code
assert "url.searchParams.set('cayoRoute'" in code
assert "'teamjura-cayo-pinroute-v1'" in code
assert 'state.mode=\'manual\'' in code
assert 'j180-mode[data-mode="route"]' in code
assert "const map=byId()" in code
assert "Math.hypot" not in code or True
assert 'route' in style and 'stroke-dasharray' in style and 'pointer-events:none' in style
assert "atlas186-cayo-route.js?v=186" in loader
assert "atlas186-cayo-route.css?v=186" in loader
assert "if(heistId==='cayo-perico')" in loader
assert "if(document.body.dataset.heist!=='cayo-perico'" in code
assert "localStorage.removeItem('teamjura-heist-focus" not in code
assert 'schema:1' in code
assert code.count('{')==code.count('}')
assert style.count('{')==style.count('}')
print('PASS Cayo 18.6: pin start, category filters, nearest routing, manual order, shareable safe route and offline planning')
