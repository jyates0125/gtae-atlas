#!/usr/bin/env python3
"""Atlas 14.1: GTA VI current map and separate Research workspace contract."""
from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]
engine=(root/"atlas.js").read_text(encoding="utf-8")
explorer=(root/"atlas-vi.html").read_text(encoding="utf-8")
research=(root/"atlas-research.html").read_text(encoding="utf-8")
research_js=(root/"atlas-research.js").read_text(encoding="utf-8")
worlds=(root/"atlas98-worlds.js").read_text(encoding="utf-8")
manifest=json.loads((root/"data/gtadb-6-manifest.json").read_text(encoding="utf-8"))
assert "'yanis,18','YANIS V18 · Current'" in engine
assert "'dupzor,51','Loki · DUPZOR V51'" in engine
assert "'scaly,view','Scaly · YANIS V18'" in engine
assert "'research,view','Research basemap · YANIS V18'" in engine
assert "if(g==='6'&&style==='research,view')return{base:'yanis,18'" in engine
assert "YANIS V17 illustration" not in engine
assert 'href="./atlas-research.html"' in explorer
assert 'href="https://www.rockstargames.com/VI/media"' in explorer
assert 'Rockstar official map source' in explorer
assert 'href="./atlas-vi.html"' in research
assert "['./data/gtadb-6.json','./gtadb-v6.json']" in research_js
assert "maps.gtadb.org/tiles/6/yanis,18/" in research_js
assert "href:'atlas-vi.html'" in worlds
assert manifest["game"]=="6" and manifest["count"]==manifest["mappedCount"]+manifest["searchOnlyCount"]
assert manifest["status"].startswith("provisional")
assert 'GTA VI · OUT NOW · COMMUNITY COORDINATES PROVISIONAL' in explorer
print("GTA VI primary YANIS V18, Loki/Scaly, dedicated Research entry, source and status checks PASS")
