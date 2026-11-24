#!/usr/bin/env python3
"""Atlas 14.6: current launch and YANIS V18 labels match actual supported views."""
from pathlib import Path
root=Path(__file__).resolve().parents[1]
hq=(root/'leonida-hq.html').read_text()
countdown=(root/'leonida-hq.js').read_text()
mapjs=(root/'atlas.js').read_text()
controls=(root/'atlas86-ui.js').read_text()
assert 'YANIS V17' not in hq and 'YANIS V17' not in mapjs
assert "yanis,17" not in controls
assert "['day','scaly,view','dupzor,51']" in controls
assert 'btn.dataset.view=opt.value' in controls
assert "'6':[['day','In-game Map'],['scaly,view','Scaly · YANIS V18'],['dupzor,51','Loki · DUPZOR V51']]" in mapjs
assert "base:'yanis,18'" in mapjs and "base:'dupzor,51'" in mapjs
assert '<h3>In-game Map</h3>' in hq
assert '<h3>Scaly · YANIS V18</h3>' in hq
assert '<h3>Loki · DUPZOR V51</h3>' in hq
assert 'Three map views of Leonida.' in hq
assert 'Five research views of Leonida.' not in hq
assert 'Rockstar' in hq and 'Official worldwide launch' in hq
assert 'Out now · Rockstar confirmed GTA VI launched November 19, 2026' in countdown
assert 'Official Rockstar Map' in (root/'atlas143-official-map-view.js').read_text() or 'Rockstar · Official Map' in (root/'atlas143-official-map-view.js').read_text()
assert 'GTA VI · OUT NOW · COMMUNITY COORDINATES PROVISIONAL' in (root/'atlas-vi.html').read_text()
print('Atlas 14.6 Rockstar Nov 19 launch truth, V18 community research views and provisional status PASS')
