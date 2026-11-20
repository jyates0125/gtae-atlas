#!/usr/bin/env python3
"""Atlas 15.7: all 13 unique local cinematic covers load without relying on remote art."""
from pathlib import Path
from hashlib import sha256
import re
r=Path(__file__).resolve().parents[1]
ids=["iv","sa","vc","iii","vcs","lcs","ctw","tlad","tbogt"]
js=(r/'atlas98-worlds.js').read_text()
portal=(r/'atlas98-portal.js').read_text()
review=(r/'atlas155-art-review.html').read_text()
assets=[]
for id in ids:
 path=r/'art'/f'jura157-{id}-cinematic.webp'
 assert path.is_file(),id
 buf=path.read_bytes()
 assert len(buf)>25000 and buf[:4]==b'RIFF' and buf[8:12]==b'WEBP',id
 assets.append(sha256(buf).hexdigest())
 assert f"coverSrc:'./art/jura157-{id}-cinematic.webp'" in js,id
 assert f'./art/jura157-{id}-cinematic.webp' in review,id
assert len(set(assets))==9
assert len(re.findall(r"coverSrc:'./art/jura157-[a-z]+-cinematic.webp'",js))==9
assert len(re.findall(r"coverSrc:'./art/jura155-[a-z]+.webp'",js))==4
assert "jura157-(?:iv|sa|vc|iii|vcs|lcs|ctw|tlad|tbogt)-cinematic" in portal
assert 'const sources=[premiumCover,featuredConcept' in portal
assert "Original Team Jura fan illustration for " in portal
assert 'Not a game map or screenshot' not in portal or 'world' in portal
print('13 distinct local cinematic covers (9 classic + 4 flagship): PASS')
