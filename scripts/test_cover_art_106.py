#!/usr/bin/env python3
"""Check 13 Atlas map-cover assets and the seven original classic-world variants."""
from pathlib import Path
import re,xml.etree.ElementTree as ET
D=Path(__file__).resolve().parents[1]
source=(D/'atlas98-worlds.js').read_text(encoding='utf8')
covers=re.findall(r"\bart:'([^']+)'",source)
assert len(covers)==13 and len(set(covers))==13, covers
classic=['atlas106-vice-city.svg','atlas106-gta3.svg','atlas106-vcs.svg','atlas106-lcs.svg','atlas106-chinatown-wars.svg','atlas106-lost-damned.svg','atlas106-gay-tony.svg']
assert all(x in covers for x in classic)
assert all((D/'art'/x).is_file() for x in covers)
for x in classic:
    path=D/'art'/x
    xml=path.read_text(encoding='utf8')
    root=ET.fromstring(xml)
    svg='{http://www.w3.org/2000/svg}'
    assert root.tag==svg+'svg' and root.get('viewBox')=='0 0 1600 900',x
    title=root.find(svg+'title')
    desc=root.find(svg+'desc')
    assert title is not None and 'Elario Studios original' in (title.text or ''),x
    assert desc is not None and 'not a Rockstar game screenshot' in (desc.text or ''),x
    assert len(list(root.iter(svg+'rect')))>120,x
    assert 'ELARIO STUDIOS' in xml and 'TEAM JURA ATLAS' in xml,x
    assert not re.search(r'\b(?:href|xlink:href)\s*=\s*["\']https?://',xml),x
    assert path.stat().st_size>16000,x
assert '320 source-backed approximate locations' in source, 'Do not undo San Andreas source-backed pins milestone'
import json
for file,expected in [('atlas-sa-150-sourced-pins.json',150),('atlas-sa-100-tag-placements.json',100),('atlas-sa-70-jump-zones.json',70)]:
    assert len(json.loads((D/'data'/file).read_text(encoding='utf8'))['records'])==expected
print('PASS Atlas 10.6: 13 resolvable unique map covers, 7 new original game-specific SVG scenes, no remote assets')
