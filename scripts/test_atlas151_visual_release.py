#!/usr/bin/env python3
"""Atlas 15.1: explicit visual-release acceptance gate.

Source and browser-smoke tests do not prove the owner's approved brand visual
specification has been implemented. This intentionally refuses to green-light
the combined production release while the artwork regression remains open.
"""
import json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
p=root/'docs/ATLAS151-VISUAL-ACCEPTANCE.json'
data=json.loads(p.read_text(encoding='utf-8'))
worlds=('story','online','vi','cayo','iv','sa','vc','iii','vcs','lcs','ctw','tlad','tbogt')
assert data.get('schema')=='team-jura-visual-release-v1'
assert set(data.get('approved_world_covers',{}))==set(worlds), 'Missing map-world visual reviews'
assert (root/'docs/ATLAS151-PREMIUM-VISUAL-RELEASE-HOLD.md').is_file()
if data.get('status')!='APPROVED' or data.get('approved_by_owner') is not True:
 raise SystemExit('VISUAL RELEASE HOLD: owner rejected placeholder map covers; restore approved cinema-style game artwork and obtain visual acceptance before merging to development.')
for prop in ('desktop_screenshots_compared','mobile_screenshots_compared','mobile_controls_overlap_resolved','cloudflare_preview_visual_review','heists_15_individual_final_art_approved'):
 assert data.get(prop) is True, 'Visual release condition incomplete: '+prop
seen=set()
for game,art in data['approved_world_covers'].items():
 assert isinstance(art,str) and art.startswith('art/'),f'{game}: local approved cover missing'
 filename=root/art
 assert filename.exists() and filename.is_file(),f'{game}: approved file missing: {art}'
 assert filename.suffix.lower() in ('.webp','.jpg','.jpeg','.png','.svg')
 assert art not in seen,'Repeated world art prohibited: '+art
 seen.add(art)
print('Atlas 15.1 Premium art/visual acceptance gate PASS')
