#!/usr/bin/env python3
"""Atlas 15.2: artwork integration contract, staging only."""
from pathlib import Path
root=Path(__file__).resolve().parents[1]
char=(root/'atlas-characters.html').read_text()
css=(root/'atlas152-characters.css').read_text()
assert 'id="mainCharacterEra"' in char and 'a152-grid' in char
for era in ['iii','vc','sa','iv','v','vi']:
 assert f'art/atlas152-era-{era}.svg' in char
 assert (root/'art'/f'atlas152-era-{era}.svg').is_file()
assert (root/'art/atlas152-era-ensemble.svg').is_file()
assert 'atlas152-era-ensemble.svg' in css
elario=(root/'elario.html').read_text()
assert 'atlas152-studio.css' in elario and 'atlas152-studio-future.svg' in elario
assert 'ATLAS 9.3</em>' not in elario
assert (root/'art/atlas152-studio-future.svg').is_file()
heist_js=(root/'atlas93-global.js').read_text()
for ident in ['fleeca','prison-break','humane-labs','series-a','pacific-standard','doomsday-act-1','doomsday-act-2','doomsday-act-3','diamond-casino','cayo-perico','cluckin-bell','salvage-yard','auto-shop','agency-vip','kortz-center']:
 assert (root/'art'/f'atlas152-heist-{ident}.svg').is_file(),ident
 assert (root/'art'/f'atlas152-planning-{ident}.svg').is_file(),ident
assert '--j120-hero-image' in heist_js
assert 'atlas152-heist-' in heist_js and 'atlas152-planning-' in heist_js
print('Atlas 15.2 six game-specific art groups, studio and 15 heist/map pair assets: PASS')
