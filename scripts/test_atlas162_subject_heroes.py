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

# Atlas 39.0.4: all selected headers have real local artwork. The new
# image pack may be absent on intermediate staging, never on final release.
import re, hashlib
header_manifest=json.loads((r/'docs/ATLAS3904-HEADER-ART.json').read_text(encoding='utf-8'))['images']
refresh=(r/'atlas3903-header-refresh.css').read_text(encoding='utf-8')
assert len(header_manifest)==9
assert len({v['sha256'] for v in header_manifest.values()})==9
fallbacks=[]
for key,entry in header_manifest.items():
    html=(r/entry['page']).read_text(encoding='utf-8')
    assert html.count('data-gtae-header="'+key+'"')==1,entry['page']
    assert html.count('atlas3903-header-refresh.css?v=')==1,entry['page']
    rule=re.search(r'\[data-gtae-header="'+key+r'"\]\s*\{([^}]+)\}',refresh)
    assert rule and 'background-image:' in rule.group(1),key
    assert entry['fallback'] in rule.group(1),key
    assert (r/entry['fallback']).is_file(),key
    fallbacks.append(entry['fallback'])
    asset=r/entry['path']
    if asset.is_file():
        assert hashlib.sha256(asset.read_bytes()).hexdigest()==entry['sha256'],key
assert len(set(fallbacks))==len(header_manifest)
preview=(r/'atlas8-preview.html').read_text(encoding='utf-8')
for image in ('jura155-story.webp','atlas86-scaly-approved.webp','atlas86-loki-approved.webp','atlas98-one-last-ride.webp'):
    assert image in preview,image
assert 'Approved character paintings must be integrated' not in preview
assert 'interface-illustration.webp' not in preview
assert 'art/oldcity.svg' not in (r/'guides.html').read_text(encoding='utf-8')
print('Atlas 39.0.4: distinct cinematic treatments, existing world assets intact; final new-art pack validated if installed')
