#!/usr/bin/env python3
"""Heist HQ must display 15 distinct WebP cover images paired with working mission routes."""
from pathlib import Path
from hashlib import sha256
import re
root=Path(__file__).resolve().parents[1]
html=(root/'heists.html').read_text(encoding='utf-8')
links=re.findall(r'href="./heist-([a-z0-9-]+)\.html"',html)
covers=re.findall(r'class="j151-heist-cover"\s+src="./art/jura159-heist-([a-z0-9-]+)\.webp"',html)
assert len(links)==len(covers)==15 and len(set(covers))==15,(len(links),len(covers))
assert links==covers,'Each heist page must match its own locally bundled concept-art card'
digests=set()
for ident in covers:
    image=root/'art'/f'jura159-heist-{ident}.webp'
    data=image.read_bytes()
    assert len(data)>20000 and data[:4]==b'RIFF' and data[8:12]==b'WEBP',ident
    digests.add(sha256(data).hexdigest())
    assert (root/f'heist-{ident}.html').is_file(),ident
assert len(digests)==15,'Duplicate heist artwork would repeat a scene'
assert 'atlas151-heist-gallery.css?v=151' in html
assert 'j151-heist-cover' in (root/'atlas151-heist-gallery.css').read_text()
print('Atlas 16.0: 15 distinct cinematic heist HQ covers match mission routes PASS')
