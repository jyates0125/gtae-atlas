#!/usr/bin/env python3
"""Atlas 16.5: two distinct cinematic evidence pages, data/functions unchanged."""
from pathlib import Path
from hashlib import sha256
root=Path(__file__).resolve().parents[1]
css=(root/'atlas165-premium-evidence.css').read_text()
work=(root/'.github/workflows/team-jura-release.yml').read_text()
assert 'test_atlas165_evidence_brand.py' in work
assert '.j165-feature-image' in css
hashes=set()
for page,asset,body in [('atlas-coverage.html','jura165-coverage.webp','j127-coverage'),
                        ('atlas-feature-audit.html','jura165-parity.webp','j127-history')]:
 h=(root/page).read_text()
 image=(root/'art'/asset).read_bytes()
 assert image[:4]==b'RIFF' and image[8:12]==b'WEBP' and len(image)>60000
 hashes.add(sha256(image).hexdigest())
 assert body in h and 'atlas165-premium-evidence.css?v=165' in h
 assert 'src="./art/'+asset+'"' in h and 'not a verified gameplay map' in h.lower() if page=='atlas-coverage.html' else 'not real georeferenced game data' in h.lower()
 assert 'class="j165-feature-image"' in h
 assert 'atlas-credits.html' in h and 'maps.html' in h
assert len(hashes)==2
coverage=(root/'atlas-coverage.html').read_text()
for term in ['id="q"','id="family"','id="only"','id="export"','id="items"','atlas-coverage.js']:
 assert term in coverage,term
print('Atlas 16.5 distinct premium Coverage and Feature Audit artwork with existing data controls PASS')
