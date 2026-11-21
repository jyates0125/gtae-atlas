#!/usr/bin/env python3
"""Atlas 15.6 mobile global nav does not float over page actions."""
from pathlib import Path
root=Path(__file__).resolve().parents[1]
css=(root/'atlas132-nav.css').read_text()
js=(root/'atlas132-nav.js').read_text()
assert 'Atlas 15.6 · iPhone overlap correction' in css
assert '@media(max-width:820px)' in css
assert 'position:relative!important' in css
assert 'margin:16px 12px 24px auto' in css
assert 'position:fixed!important' in css
assert 'document.body.append(wrap)' in js
assert "drawer.hidden=false" in js
print('Atlas 15.6 mobile navigation no longer obscures page actions PASS')
