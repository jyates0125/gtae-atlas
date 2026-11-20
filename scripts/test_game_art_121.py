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
# Atlas 15.7: all thirteen original cinematic WebPs are local and distinct.
premium=re.findall(r"coverSrc:'(\./art/(?:jura155-(?:story|online|vi|cayo)|jura157-(?:iv|sa|vc|iii|vcs|lcs|ctw|tlad|tbogt)-cinematic)\.webp)'",directory)
assert len(premium)==13 and len(set(premium))==13, "Thirteen unique premium local world-cover assets required"
assert directory.count("coverSrc:")==13, "Remote or unknown additional map cover source detected"
for source in premium:
 path=ROOT/source.removeprefix('./')
 assert path.is_file(),source
 blob=path.read_bytes()
 assert len(blob)>25000 and blob[:4]==b'RIFF' and blob[8:12]==b'WEBP',source
for world in worlds:
 assert re.search(r"\{id:'"+world+r"',[^\n]*art:'([^']+)'",directory),world
for world in ['iii','vc','vcs','lcs','ctw','tlad','tbogt']:
 assert re.search(r"\b"+world+r":\{name:[^\n]*map:'(?:https://|\./art/)[^']+'",classic),world
for name in ('atlas128-gta3-radar.png','atlas128-vice-city-radar.png','atlas128-gta4-landmarks.jpg'):
 assert (ROOT/'art'/name).is_file(),name
assert 'originalMapReady' in classic and 'loadOriginalWorldMap()' in classic
assert 'highResUrl||state.background' in classic
# Public cards and registry must use validated local illustrations, not a third-party CDN.
assert "const sources=[premiumCover,featuredConcept,'./art/'+w.art].filter(Boolean)" in portal
assert "w.coverSrc" in portal and 'im.onerror=' in portal
assert "jura155-(?:story|online|vi|cayo)" in portal
assert "jura157-(?:iv|sa|vc|iii|vcs|lcs|ctw|tlad|tbogt)-cinematic" in portal
assert 'Original Team Jura fan illustration' in portal
local_covers=re.findall(r"\bart:'([^']+)'",directory)
assert len(local_covers)==13 and len(set(local_covers))==13
assert all((ROOT/'art'/name).is_file() for name in local_covers)
assert 'j121Original' in cayo and 'j121Planner' in cayo
assert (ROOT/'atlas121-cayo-map.js').exists()
assert (ROOT/'atlas121-cayo-map.css').exists()
assert 'Rockstar\'s published fan-use and removal policy' in credits
print('PASS Atlas 12.1 local original world art and Cayo map controls with central rights register')
