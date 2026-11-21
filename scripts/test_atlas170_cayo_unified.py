#!/usr/bin/env python3
from pathlib import Path
r=Path(__file__).resolve().parents[1]
a=(r/'atlas167-heist-focus.js').read_text();b=(r/'atlas169-heist-views.js').read_text()
assert "const juraOriginalMap=" in a and "wikiassets.net" in a
for item in ["airstrip","north dock","main dock","el rubio compound","drainage tunnel"]:
 assert "'"+item+"'" in a
for item in ["juraCoord(p)","juraSwitchMap('enhanced')","window.teamJuraHeistBaseMap","sec.dataset.mapSource='original'"]:
 assert item in a,item
assert "next==='enhanced'||next==='route'||next==='original'" in b
assert "activate(id==='cayo-perico'?'original':'enhanced')" in b
assert "original.hidden=true" in b
assert "original.scrollIntoView" not in b
assert "teamjura-heist-focus-v1:" not in b
assert 'j167-pin' in (r/'atlas169-heist-views.css').read_text()
# The featured Cayo destination must open the modern interactive heist map,
# while the older illustrative schematic remains explicitly discoverable.
worlds=(r/'atlas98-worlds.js').read_text()
old_schematic=(r/'atlas-cayo.html').read_text()
assert "href:'heist-cayo-perico.html'" in worlds
assert 'href="./heist-cayo-perico.html"' in old_schematic
assert 'The MAIN CAYO MAP WORKSPACE' not in old_schematic or 'j192-flagship-jump' in old_schematic
assert 'optional illustrative schematic' in old_schematic
print('Atlas 17.0 Cayo map: same native basemap, approximate pins and routes PASS')
