#!/usr/bin/env python3
"""Atlas 16.2 original cinematic subject-specific artwork / release-source guard."""
import json
from pathlib import Path
r=Path(__file__).resolve().parents[1]
cases={
 'wildlife':('atlas-animals.html','data-atlas-kind="animal"'),
 'collectibles':('atlas-collectibles.html','data-atlas-kind="collectible"'),
 'weapons':('atlas90-weapons.html','data-gallery="weapons"'),
 'vehicles':('atlas90-vehicles5.html','data-gallery="vehicles5"'),
 'vehicles6':('atlas90-vehicles6.html','data-gallery="vehicles6"'),
}
css=(r/'atlas162-subject-heroes.css').read_text(encoding='utf-8')
build=(r/'scripts/build-cloudflare.cjs').read_text(encoding='utf-8')
flow=(r/'.github/workflows/team-jura-release.yml').read_text(encoding='utf-8')
for slug,(page,attr) in cases.items():
    media=r/'art'/('jura161-'+slug+'.webp')
    raw=media.read_bytes()
    assert len(raw)>25000 and raw[:4]==b'RIFF' and raw[8:12]==b'WEBP',slug
    assert ('jura161-'+slug+'.webp') in css,slug
    html=(r/page).read_text(encoding='utf-8')
    assert attr in html and 'role="img"' in html, page
assert 'atlas162-subject-heroes.css?v=162' in build
assert 'test_atlas162_subject_heroes.py' in flow
assert len({(r/'art'/('jura161-'+x+'.webp')).read_bytes()[:2000] for x in cases})==len(cases),'Repeated media'
accept=json.loads((r/'docs/ATLAS151-VISUAL-ACCEPTANCE.json').read_text(encoding='utf-8'))
assert accept['owner_cinematic_art_direction_approved'] is True
assert accept['status'] in ('HOLD','APPROVED')
if accept['status']=='APPROVED':
    assert accept.get('approved_by_owner') is True
    assert accept.get('owner_final_site_merge_approval') is True
    assert accept.get('reviewed_cloudflare_preview','').startswith('https://')
else:
    assert accept.get('approved_by_owner') is False and accept.get('owner_final_site_merge_approval') is False
assert len(set(accept['approved_world_covers'].values()))==13
for path in accept['approved_world_covers'].values():
    assert (r/path).is_file(),path
print('Atlas 16.2: 5 unique premium subjects, 13 owner-reviewed covers and signed release status PASS')
