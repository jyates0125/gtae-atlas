#!/usr/bin/env python3
"""Atlas 14.9: only one Rockstar map action in player toolbar; source link in sidebar."""
from pathlib import Path
root=Path(__file__).resolve().parents[1]
page=(root/'atlas-vi.html').read_text(encoding='utf-8')
viewer=(root/'atlas143-official-map-view.js').read_text(encoding='utf-8')
css=(root/'atlas141-leonida-views.css').read_text(encoding='utf-8')
assert 'j141-official-flat' not in page
assert 'j141-official-flat' not in css
assert "controls.querySelector('#layer')" in viewer
assert "mapSelector.insertAdjacentElement('afterend',button)" in viewer
assert "button.id='j143-official-button'" in viewer
assert page.count('href="https://www.rockstargames.com/VI/media"')==1
assert 'Official Leonida map and poster' not in (root/'atlas.js').read_text(encoding='utf-8'), 'Duplicate source-shelf link to poster'
assert 'Official Leonida screenshots' in (root/'atlas.js').read_text(encoding='utf-8')
assert 'Rockstar official map source' in page
assert "aria-label=\"Open dedicated GTA VI Community Research map\"" in page
assert 'data-j143="fetch"' in viewer
print('Atlas 14.9 single official-map toolbar viewer and retained source-sidebar link PASS')
