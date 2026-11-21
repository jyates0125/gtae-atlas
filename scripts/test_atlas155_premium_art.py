#!/usr/bin/env python3
"""Atlas 15.5 release guard: original cinematic WebP art is actually served and used."""
from pathlib import Path
from hashlib import sha256
root=Path(__file__).resolve().parents[1]
assets=['story','online','vi','cayo','characters','heists','map','studio']
hashes=[]
for label in assets:
 path=root/'art'/f'jura155-{label}.webp'
 assert path.is_file(),path
 content=path.read_bytes()
 assert len(content)>25000,(label,len(content))
 assert content[:4]==b'RIFF' and content[8:12]==b'WEBP',label
 hashes.append(sha256(content).hexdigest())
assert len(set(hashes))==8, 'Every premium page image must be distinct'
worlds=(root/'atlas98-worlds.js').read_text()
portal=(root/'atlas98-portal.js').read_text()
for label in assets[:4]:
 assert f"coverSrc:'./art/jura155-{label}.webp'" in worlds,label
assert 'const sources=[premiumCover,featuredConcept' in portal
assert 'original-cinematic' in portal
assert 'frame.append(blur,im);setCover()' in portal
for page in ['atlas-characters.html','heists.html','elario.html','maps.html']:
 assert 'atlas155-premium.css' in (root/page).read_text(),page
assert 'jura155-studio.webp' in (root/'elario.html').read_text()
assert 'jura155-characters.webp' in (root/'atlas155-premium.css').read_text()
assert 'jura155-heists.webp' in (root/'atlas155-premium.css').read_text()
print('Atlas 15.5: 8 distinct cinematic raster assets and page integrations PASS')
