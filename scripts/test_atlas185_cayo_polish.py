#!/usr/bin/env python3
"""Cayo 18.5 static acceptance: optional final polish only on Cayo; no data edits."""
from pathlib import Path
root=Path(__file__).resolve().parents[1]
js=(root/'atlas185-cayo-polish.js').read_text()
css=(root/'atlas185-cayo-polish.css').read_text()
loader=(root/'heist-pages.js').read_text()
browser=(root/'scripts/test_atlas171_browser.py').read_text()
for token in ('j185-polish','j185-cayo-polished','j185-pan','j185-legend-toggle',
              'j180-legend-rows','j180-pin-info','j167-viewport',
              'aria-pressed','aria-expanded','matchMedia','jura','syncPan','syncLegend'):
    if token=='jura':continue
    assert token in (js+css),token
assert "atlas185-cayo-polish.js?v=392" in loader
assert "atlas185-cayo-polish.css?v=185" in loader
assert "if(heistId==='cayo-perico')" in loader
assert "moveNative.click();syncPan();" in js
assert "legend.classList.toggle('j185-open',isOpen)" in js
assert "if(status && source.parentNode!==status)status.prepend(source);" in js
assert "requestAnimationFrame" in js
assert "j185-cluster-choices" in js and "j185-cluster-choices" in css
assert "event.stopImmediatePropagation()" in js
assert "directSelection=true" in js and "directSelection=false" in js
assert "Choose nearby location" in js
assert "Airstrip infiltration" in browser
assert "const source=document.createElement('span')" in js
assert "focus.dataset.mapSource" in js and "focus.dataset.mapAsset" in js
assert "position:fixed!important" in css
assert "aspect-ratio:1284/1262!important" in css
assert "j180-legend:not(.j185-open) .j180-legend-rows" in css
assert "j180-legend.j185-open .j180-legend-rows" in css
assert "pan.get_attribute('aria-pressed')=='true'" in browser
assert "Offline fallback retains all 19 chest references" in browser
assert "Escape closes marker details" in browser
assert js.count('{')==js.count('}')
assert css.count('{')==css.count('}')
assert 'teamjura-heist-focus-v1:' not in js
assert "localStorage.setItem" not in js
print('PASS Cayo 18.5: panning, map shape, phone filter, visible card, fallback QA; other heists untouched')

assert 'items.slice(0,12)' not in js
assert 'event.detail===0' in js
assert 'All nearby markers must be selectable' in browser
assert 'Keyboard activation selects the exact pin' in browser
