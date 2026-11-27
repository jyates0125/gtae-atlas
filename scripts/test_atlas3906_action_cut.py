#!/usr/bin/env python3
"""Verify exact media identities, action-cut player wiring and archived master."""
import hashlib,json
from pathlib import Path
R=Path(__file__).resolve().parents[1]
expected={
 'film/assets/one-last-ride-motion-preview.mp4':'ddd2d44c6d58b114cceb523fea47dfce9fbe3259a449a3ce8e61d8b5b002798f',
 'film/assets/one-last-ride-action-cut-3906.mp4':'290a1f34f3bee6f1af99efd5205dbeb1edcbf8aa8c4cb152866b950681cbd3f4',
 'film/assets/one-last-ride-action-opening-3906.jpg':'f6a2fb3b77c96f5d2b5a9c487744c7b56d445950a3b2ac913de7849b3a5c3f82',
}
for rel,digest in expected.items():
    assert hashlib.sha256((R/rel).read_bytes()).hexdigest()==digest,rel
    if (R/'public').is_dir():
        assert hashlib.sha256((R/'public'/rel).read_bytes()).hexdigest()==digest,rel
page=(R/'one-last-ride.html').read_text(encoding='utf-8')
assert '<source src="./film/assets/one-last-ride-action-cut-3906.mp4?v=290a1f34"' in page
assert 'poster="./film/assets/one-last-ride-action-opening-3906.jpg"' in page
assert 'Original music-only master (archive)' in page
assert '00:39 · 720p · Action cut' in page
assert '132 BPM' in page
assert json.loads((R/'docs/ATLAS3906-ACTION-CUT-MANIFEST.json').read_text(encoding='utf-8'))['reviewOnly'] is True
print('PASS exact action media, published bytes and archived master')
