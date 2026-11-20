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
assert "YANIS V18 · Current" in controls
assert "research,view" in controls and "dupzor,51" in controls
assert 'DUPZOR V51 · Source' in controls
assert 'Loki · Styled V51' in (root/'atlas94-ui.js').read_text()
assert "style==='loki,view'" in mapjs and "base:'dupzor,51'" in mapjs
assert 'Current · YANIS V18' in hq
assert 'Research · YANIS V18' in hq
assert 'Rockstar' in hq and 'Official worldwide launch' in hq
assert 'Out now · Rockstar confirmed GTA VI launched November 19, 2026' in countdown
assert 'Official Rockstar Map' in (root/'atlas143-official-map-view.js').read_text() or 'Rockstar · Official Map' in (root/'atlas143-official-map-view.js').read_text()
assert 'COMMUNITY RESEARCH · UNVERIFIED' in (root/'atlas-vi.html').read_text()
print('Atlas 14.6 Rockstar Nov 19 launch truth, V18 community research views and provisional status PASS')
