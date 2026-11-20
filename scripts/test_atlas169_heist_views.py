#!/usr/bin/env python3
"""Atlas 16.9: honest heist views, self-authored premium pins and non-destructive progress."""
from pathlib import Path
root=Path(__file__).resolve().parents[1]
js=(root/'atlas169-heist-views.js').read_text()
css=(root/'atlas169-heist-views.css').read_text()
loader=(root/'heist-pages.js').read_text()
assert "j169-views" in js and 'j169-view' in css
for phrase in ['Enhanced map','Objective details','Route planning','Original island explorer','Vault & objectives','Museum & objectives','Compound & objectives']:
 assert phrase in js,phrase
assert "id==='cayo-perico'" in js and "originalFrame.src='./atlas-cayo.html'" in js
assert 'oldLink.replaceWith(sourceBtn)' in js, 'Cayo original map CTA must not duplicate the existing full-size source link'
assert "id==='diamond-casino'?'Vault & objectives'" in js
assert 'jura159-heist-' in js and 'jura159-heist-' in loader
assert 'j169-surface' in css and 'j169-objective-grid' in css
assert 'j167-pin' in css and 'radial-gradient' in css and not '.svg' in css
assert 'teamjura-heist-focus-v1:' not in js and 'localStorage.setItem' not in js
assert 'selectPOI' in js and "activate('enhanced')" in js
assert 'atlas169-heist-views.js?v=169' in loader and 'atlas169-heist-views.css?v=169' in loader
assert 'views.async=false' in loader and 'focus.async=false' in loader
assert css.count('{')==css.count('}')
assert 'source-informed' not in js.lower() or 'schematic' in js.lower()
print('Atlas 16.9 views and custom icon parity: PASS')
