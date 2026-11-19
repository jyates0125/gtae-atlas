#!/usr/bin/env python3
"""Official Rockstar poster must be a real, switchable in-map view, not merely a link.
Rockstar image remains user-supplied from the official download (rights + bandwidth safety).
"""
from pathlib import Path
root=Path(__file__).resolve().parents[1]
html=(root/'atlas-vi.html').read_text()
js=(root/'atlas143-official-map-view.js').read_text()
css=(root/'atlas143-official-map-view.css').read_text()
for dep in ('atlas143-official-map-view.js','atlas143-official-map-view.css'):
    assert dep in html, f'Missing map viewer dependency: {dep}'
for s in ['j143-official-button','j143-official-layer','j143-stage','j143-poster','j143-empty','j143-actions',
          'pointerdown','pointermove','wheel','indexedDB','URL.createObjectURL','stored(\'put\'',
          'stored(\'get\'','stored(\'delete\'','https://www.rockstargames.com/VI/media']:
    assert s in js, f'Missing official map viewer control: {s}'
assert 'position:absolute;inset:0' in css
assert '.j143-official-layer[hidden]' in css
assert "No upload or third-party relay" in js
assert 'Community pins are hidden' in js or 'Community pins are hidden' in js
assert 'atlas143' not in (root/'atlas.html').read_text()
assert 'atlas143' not in (root/'atlas-online.html').read_text()
print('Atlas 14.3 in-map official poster viewer, image persistence and safe coordinate separation PASS')
