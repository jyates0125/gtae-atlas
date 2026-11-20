#!/usr/bin/env python3
"""Team Jura Atlas 15.8 browser regression: keep the newly approved navigation/share flow and screenshot page coverage."""
from pathlib import Path
p=Path(__file__).resolve().parents[1]
smoke=(p/'scripts/browser_smoke.py').read_text()
capture=(p/'scripts/capture_design_review.py').read_text()
assert 'Mobile map all-pages button is not kept at the left edge' not in smoke
assert 'getComputedStyle(el.closest(".j132-nav")).position' in smoke
assert 'Mobile map all-pages control still floats above map content' in smoke
assert 'Discontinued film share kit still interrupts content' in smoke
assert "Bottom-of-page community social buttons missing on film" in smoke
for page in ['atlas155-art-review.html','atlas-characters.html','heists.html','elario.html','atlas-online.html','atlas90-weapons.html','atlas-vehicle-configurator.html','map-hub.html?game=vc']:
 assert f"'{page}'" in capture,page
print('Atlas 15.8 browser QA expectations match approved non-overlap footer and visual coverage PASS')
