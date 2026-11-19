#!/usr/bin/env python3
"""Check all thirteen authentic map-image selections and seven classic viewer controls."""
from pathlib import Path
import re
ROOT=Path(__file__).resolve().parents[1]
directory=(ROOT/'atlas98-worlds.js').read_text(encoding='utf-8')
classic=(ROOT/'atlas98-classic.js').read_text(encoding='utf-8')
portal=(ROOT/'atlas98-portal.js').read_text(encoding='utf-8')
cayo=(ROOT/'atlas-cayo.html').read_text(encoding='utf-8')
credits=(ROOT/'atlas-credits.html').read_text(encoding='utf-8')
worlds=['story','online','vi','cayo','iv','sa','vc','iii','vcs','lcs','ctw','tlad','tbogt']
assert "coverSrc:" not in directory, "Source URLs must never be rendered as map covers"
for world in worlds:
 assert re.search(r"\{id:'"+world+r"',[^\n]*art:'([^']+)'",directory),world
for world in ['iii','vc','vcs','lcs','ctw','tlad','tbogt']:
 assert re.search(r"\b"+world+r":\{name:[^\n]*map:'(?:https://|\./art/)[^']+'",classic),world
for name in ('atlas128-gta3-radar.png','atlas128-vice-city-radar.png','atlas128-gta4-landmarks.jpg'):
 assert (ROOT/'art'/name).is_file(),name
assert 'originalMapReady' in classic and 'loadOriginalWorldMap()' in classic
assert 'highResUrl||state.background' in classic
# Public cards and registry must use validated local illustrations, not a third-party CDN.
assert "const sources=[featuredConcept,'./art/'+w.art].filter(Boolean)" in portal
assert "w.coverSrc" not in portal and 'im.onerror=' in portal
assert 'Original Team Jura fan illustration' in portal
local_covers=re.findall(r"\bart:'([^']+)'",directory)
assert len(local_covers)==13 and len(set(local_covers))==13
assert all((ROOT/'art'/name).is_file() for name in local_covers)
assert 'j121Original' in cayo and 'j121Planner' in cayo
assert (ROOT/'atlas121-cayo-map.js').exists()
assert (ROOT/'atlas121-cayo-map.css').exists()
assert 'Rockstar\'s published fan-use and removal policy' in credits
print('PASS Atlas 12.1 local original world art and Cayo map controls with central rights register')
