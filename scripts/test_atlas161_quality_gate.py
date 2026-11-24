#!/usr/bin/env python3
"""Atlas 16.1 staging-only regression suite for real links and cinematic artwork.

No passing source check substitutes for Chromium/Edge QA and owner screenshot approval.
"""
from pathlib import Path
from hashlib import sha256
from urllib.parse import urlsplit
import re

root=Path(__file__).resolve().parents[1]
worlds=(root/'atlas98-worlds.js').read_text(encoding='utf-8')
dashboard=(root/'atlas-dashboard.html').read_text(encoding='utf-8')
directory=(root/'maps.html').read_text(encoding='utf-8')
heist_hq=(root/'heists.html').read_text(encoding='utf-8')
heist_css=(root/'atlas120-heist-worlds.css').read_text(encoding='utf-8')
account=(root/'atlas-account.html').read_text(encoding='utf-8')
builder=(root/'scripts/build-cloudflare.cjs').read_text(encoding='utf-8')
design_css=(root/'atlas158-premium-experiences.css').read_text(encoding='utf-8')
ids=('fleeca','prison-break','humane-labs','series-a','pacific-standard',
     'doomsday-act-1','doomsday-act-2','doomsday-act-3','diamond-casino',
     'cayo-perico','cluckin-bell','salvage-yard','auto-shop','agency-vip','kortz-center')
classic=('iv','sa','vc','iii','vcs','lcs','ctw','tlad','tbogt')
featured=('story','online','vi','cayo')

def webp(path):
    content=path.read_bytes()
    assert len(content)>25000 and content[:4]==b'RIFF' and content[8:12]==b'WEBP',path
    return sha256(content).hexdigest()

# Require all thirteen genuine destination links and a unique local, previewable artwork.
world_images=[]
for name in featured:
    asset=f'art/jura155-{name}.webp'
    assert f"coverSrc:'./{asset}'" in worlds,name
    world_images.append(webp(root/asset))
for name in classic:
    asset=f'art/jura157-{name}-cinematic.webp'
    assert f"coverSrc:'./{asset}'" in worlds,name
    assert f'./{asset}' in dashboard,name
    world_images.append(webp(root/asset))
assert len(world_images)==13 and len(set(world_images))==13
assert len(re.findall(r'class="j158-nine-card"',dashboard))==9
assert 'class="j158-nine-grid"' in dashboard
assert 'id="directoryAdditional"' in directory and 'data-world-filter="gateway"' in directory
assert 'j158-map-hud' in dashboard and 'aria-hidden="true"' in dashboard
assert 'url(\'./art/jura158-map-world-cinematic.webp\')' in design_css
assert webp(root/'art/jura158-map-world-cinematic.webp')
assert 'Atlas 15.7' in (root/'atlas98-classic.css').read_text()

# Every clickable new world card must navigate to a real published HTML page.
nine=dashboard.split('class="j158-nine-grid"',1)[1].split('</div>',1)[0]
hrefs=re.findall(r'class="j158-nine-card" href="([^"]+)"',nine)
assert len(hrefs)==9,(len(hrefs),hrefs)
for url in hrefs:
    destination=urlsplit(url).path.removeprefix('./')
    assert destination.endswith('.html') and (root/destination).exists(),url
    assert not url.startswith('http:'),url

# Fifteen individual artwork files, no duped cover photos or generic title substitution.
mission_hashes=[]
for name in ids:
    image=f'art/jura159-heist-{name}.webp'
    mission_hashes.append(webp(root/image))
    html=(root/f'heist-{name}.html').read_text(encoding='utf-8')
    assert f'src="./{image}"' in html,name
    assert f'src="./art/atlas93-heist-{name}.svg"' not in html,name
    assert f'src="./{image}"' in heist_hq,name
    assert f"--j120-hero-image:url('./{image}')" in heist_css,name
    assert 'id="progressBar"' in html,name
    assert 'atlas120-heist-worlds.css' in html,name
assert len(mission_hashes)==15 and len(set(mission_hashes))==15

# Guest entry and account phase must remain honest. No dead CTA to a not-yet-enabled login.
welcome=(root/'index.html').read_text(encoding='utf-8')
assert 'atlas-dashboard.html' in welcome
assert 'Sign in · Deferred' in account
assert 'disabled aria-describedby="accountNotice"' in account
assert 'Social launch kit' not in welcome
assert 'atlas131-social-icons.js' in builder

# Distinguish a pre-approval HOLD from an owner-signed release; never silently bypass the gate.
import json
release=json.loads((root/'docs/ATLAS151-VISUAL-ACCEPTANCE.json').read_text(encoding='utf-8'))
assert release['status'] in ('HOLD','APPROVED')
if release['status']=='APPROVED':
    assert release.get('approved_by_owner') is True
    assert release.get('owner_final_site_merge_approval') is True
    assert '2026-11-20' in release.get('owner_release_authorization','')
    assert all(release.get(flag) is True for flag in ('desktop_screenshots_compared', 'mobile_screenshots_compared','mobile_controls_overlap_resolved','cloudflare_preview_visual_review'))
else:
    assert release.get('approved_by_owner') is False and release.get('owner_final_site_merge_approval') is False
assert 'href="#"' not in heist_hq, 'Heist HQ must not include dead # link buttons'
print('Atlas 16.1: 13 unique worlds, 15 distinct heists, real links, guest-first flow and owner-signoff gate PASS')
