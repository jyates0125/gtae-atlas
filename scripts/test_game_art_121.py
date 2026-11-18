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
assert len(re.findall(r"\bcoverSrc:'", directory))==13
for world in worlds:
 assert re.search(r"\{id:'"+world+r"',[^\n]*coverSrc:'[^']+'",directory),world
for world in ['iii','vc','vcs','lcs','ctw','tlad','tbogt']:
 assert re.search(r"\b"+world+r":\{name:[^\n]*map:'https://[^']+'",classic),world
assert 'originalMapReady' in classic and 'loadOriginalWorldMap()' in classic
assert 'highResUrl||state.background' in classic
assert 'w.coverSrc' in portal and 'im.onerror=' in portal
assert 'j121Original' in cayo and 'j121Planner' in cayo
assert (ROOT/'atlas121-cayo-map.js').exists()
assert (ROOT/'atlas121-cayo-map.css').exists()
assert 'Rockstar\'s published fan-use and removal policy' in credits
print('PASS Atlas 12.1 original world imagery, Cayo map controls and central rights register')
