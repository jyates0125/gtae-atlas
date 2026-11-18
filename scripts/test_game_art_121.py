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
 assert re.search(r"\b"+world+r":\{name:[^\n]*map:'(?:https://|\./art/maps/)[^']+'",classic),world
assert 'originalMapReady' in classic and 'loadOriginalWorldMap()' in classic
assert 'highResUrl||state.background' in classic
assert 'w.coverSrc' in portal and 'im.onerror=' in portal
assert 'j121Original' in cayo and 'j121Planner' in cayo
assert (ROOT/'atlas121-cayo-map.js').exists()
assert (ROOT/'atlas121-cayo-map.css').exists()
assert 'Rockstar\'s published fan-use and removal policy' in credits
print('PASS Atlas 12.1 original world imagery, Cayo map controls and central rights register')

for name in ('gta-vice-city-original.png','gta-iv-liberty-reference.jpg'):
 image=ROOT/'art'/'maps'/name
 assert image.is_file() and image.stat().st_size>100000, name

# Source-hosted wildlife screenshots; never classify landscape photos as verified spawns.
animals=(ROOT/'atlas-animals.html').read_text(encoding='utf-8')
assert 'j121-wildlife-photos' in animals and 'Grassrivers_07' in animals
assert 'Leonida_Keys_07' in animals
assert 'Official Rockstar' in animals
assert (ROOT/'atlas121-wildlife.css').is_file()
assert 'id="atlas-122-wildlife"' in credits

for name,world in [('gta-vice-city-original.png','vc'),('gta-iv-liberty-reference.jpg','iv'),('gta-iv-liberty-reference.jpg','tlad'),('gta-iv-liberty-reference.jpg','tbogt')]:
    assert re.search(r"\{id:'"+world+r"',[^\n]*coverSrc:'\./art/maps/"+name+r"'",directory),world
for id in ('vc','tlad','tbogt'):
    assert re.search(r"\b"+id+r":\{name:[^\n]*map:'\./art/maps/[^']+'",classic),id
