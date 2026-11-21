#!/usr/bin/env python3
"""Atlas 14.8: each of 13 map covers is local original Elario work, never an external hotlink."""
from pathlib import Path
import re
root=Path(__file__).resolve().parents[1]
worlds=(root/'atlas98-worlds.js').read_text(encoding='utf-8')
portal=(root/'atlas98-portal.js').read_text(encoding='utf-8')
art=re.findall(r"\bart:'([^']+)'",worlds)
assert len(art)==13 and len(set(art))==13, "13 distinct world cover artworks required"
for filename in art:
 assert re.fullmatch(r'atlas[0-9]+-[a-z0-9-]+\.svg',filename),filename
 assert (root/'art'/filename).is_file(),filename
for game in ('story','online','vi','cayo'):
 assert (root/'art'/f'atlas140-{game}-concept.svg').is_file(),game
assert "const sources=[premiumCover,featuredConcept,'./art/'+w.art].filter(Boolean)" in portal
assert "Original Team Jura fan illustration for " in portal
assert "'original-cinematic':'original-elario'" in portal
assert "w.coverSrc,w.coverFallback" not in portal
assert worlds.count("coverSrc:'./art/jura155-")==4, "Four local premium raster covers expected"
assert "https://m.media-amazon.com/images" not in worlds
assert "https://fwmedia.fandomwire.com" not in worlds
assert "im.src=sources[sourceIndex]" in portal
assert "frame.append(blur,im);setCover()" in portal
assert "im.onerror=" in portal
assert "blur.src=premiumCover" in portal
print('Atlas 14.8 13 distinct bundled original game-world covers, no remote hotlink dependency PASS')
