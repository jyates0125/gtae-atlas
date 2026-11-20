#!/usr/bin/env python3
"""Atlas 16.0: premium map/header composition must not regress to visible SVGs."""
from pathlib import Path
from hashlib import sha256
r=Path(__file__).resolve().parents[1]
ids=["fleeca","prison-break","humane-labs","series-a","pacific-standard","doomsday-act-1","doomsday-act-2","doomsday-act-3","diamond-casino","cayo-perico","cluckin-bell","salvage-yard","auto-shop","agency-vip","kortz-center"]
assert len(ids)==15 and len(set(ids))==15
css=(r/'atlas160-premium-headers.css').read_text()
builder=(r/'scripts/build-cloudflare.cjs').read_text()
classic=(r/'atlas98-classic.js').read_text()
globaljs=(r/'atlas93-global.js').read_text()
hq=(r/'heists.html').read_text()
assert "atlas160-premium-headers.css?v=160" in builder
assert "classicWorldArt.src=premiumClassicArt" in classic
assert ".classic-hero #classicWorldArt" in css and ".classic-hero{flex-direction:column" in css
assert "jura159-heist-hq.webp" in css
assert "--j120-hero-image" in globaljs and "jura159-heist-" in globaljs
all_hashes=[]
for ident in ids+['hq']:
    img=r/'art'/f'jura159-heist-{ident}.webp'
    buf=img.read_bytes()
    assert len(buf)>20000 and buf[:4]==b'RIFF' and buf[8:12]==b'WEBP',ident
    all_hashes.append(sha256(buf).hexdigest())
    if ident=='hq':
        continue
    page=(r/f'heist-{ident}.html').read_text()
    assert f'src="./art/jura159-heist-{ident}.webp"' in page,ident
    assert f'src="./art/atlas93-heist-{ident}.svg"' not in page,ident
    assert 'atlas120-heist-worlds.css' in page,ident
    assert 'id="stepSearch"' in page and 'id="progressBar"' in page,ident
    assert f'src="./art/jura159-heist-{ident}.webp"' in hq,ident
assert len(set(all_hashes))==16, 'Repeated heist photo or HQ art'
assert 'python scripts/test_atlas160_premium_headers.py' in (r/'.github/workflows/team-jura-release.yml').read_text()
review=(r/'atlas155-art-review.html').read_text()
capture=(r/'scripts/capture_design_review.py').read_text()
hub=(r/'map-hub.html').read_text()
for ident in ids:
    assert f'jura159-heist-{ident}.webp' in review,ident
    assert f"'heist-{ident}.html'" in capture,ident
for world in ['iii','vc','vcs','lcs','ctw','tlad','tbogt']:
    assert f"'map-hub.html?game={world}'" in capture,world
assert 'id="classicWorldArt" src="./art/oldcity.svg"' not in hub, 'Old SVG skyline must never flash before world cover'
assert 'j160HeistGallery' in review
print('Atlas 16.0: 16 independent cinematic assets, 15 linked mission workspaces, responsive classic header PASS')
