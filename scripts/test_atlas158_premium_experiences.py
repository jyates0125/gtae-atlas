#!/usr/bin/env python3
"""Atlas 15.8 — no dead decorative controls, distinct image-backed world CTAs."""
from pathlib import Path
root=Path(__file__).resolve().parents[1]
dashboard=(root/'atlas-dashboard.html').read_text(encoding='utf-8')
maps=(root/'maps.html').read_text(encoding='utf-8')
classic=(root/'atlas98-classic.js').read_text(encoding='utf-8')
css=(root/'atlas158-premium-experiences.css').read_text(encoding='utf-8')
ids=["iv","sa","vc","iii","vcs","lcs","ctw","tlad","tbogt"]
assert 'class="map-preview j158-map-preview"' in dashboard
assert 'jura158-map-world-cinematic.webp' in css
assert (root/'art'/'jura158-map-world-cinematic.webp').is_file()
assert 'j158-map-hud' in dashboard and 'aria-hidden="true"' in dashboard
assert 'class="j158-nine-grid"' in dashboard
assert dashboard.count('class="j158-nine-card"') == 9
assert len(ids)==9 and len(set(ids))==9
for id in ids:
    img=f'jura157-{id}-cinematic.webp'
    assert img in dashboard,id
    assert (root/'art'/img).is_file(),id
assert 'j158-classic-directory' in maps
assert 'j158-verification-link' in maps
assert 'const premiumClassicArt' in classic
assert "'./art/jura157-'+id+'-cinematic.webp'" in classic
assert 'classicWorldArt.onerror' in classic
for href in ['./atlas.html','./atlas-online.html','./atlas-vi.html','./heist-cayo-perico.html','./atlas-iv.html','./atlas-sa.html']:
    assert href in dashboard,href
for href in ['map-hub.html?game=vc','map-hub.html?game=iii','map-hub.html?game=vcs','map-hub.html?game=lcs','map-hub.html?game=ctw','atlas-iv.html?scope=tlad','atlas-iv.html?scope=tbogt']:
    assert href in dashboard,href
print('Atlas 15.8: dashboard map artwork, nine real world links and classic-specific images PASS')
