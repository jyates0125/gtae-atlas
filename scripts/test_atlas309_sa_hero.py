#!/usr/bin/env python3
"""Atlas 30.9 — San Andreas-specific cinematic hero, no dashboard crew placeholder."""
from pathlib import Path
root=Path(__file__).resolve().parents[1]
html=(root/'atlas-sa.html').read_text()
css=(root/'atlas85-sa.css').read_text()
new=(root/'atlas309-sa-hero.css').read_text()
art=root/'art'/'jura157-sa-cinematic.webp'
assert art.is_file() and art.stat().st_size>25000
assert html.count('<img src="./art/jura157-sa-cinematic.webp"')==1  # One rendered hero; OG/Twitter references are legitimate
assert html.count('atlas309-sa-hero.css?v=309')==1
assert 'j309-sa-hero-art' in html
assert 'not a game map or gameplay screenshot' in html
assert 'class="sketch"' not in html
assert 'atlas81-approved-dashboard-crew.webp' not in css
assert 'j309-sa-hero-art img' in new
assert 'id="mapContainer"' in html and 'id="pinLayer"' in html
assert 'Pin alignment is approximate' in html
print('Atlas 30.9 original, subject-specific San Andreas hero source passed')
