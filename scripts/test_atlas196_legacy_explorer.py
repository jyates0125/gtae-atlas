#!/usr/bin/env python3
"""Atlas 19.6: legacy explorers stay usable and sourced without per-pin canvas allocation."""
from pathlib import Path
r=Path(__file__).resolve().parents[1]
for name in ('legacy-explorer.html','online-explorer.html'):
 s=(r/name).read_text(encoding='utf-8')
 assert "const SOURCE='./data/gtadb-6.json'" in s, name
 assert 'normalize(raw.records||raw)' in s, name
 assert 'markerRenderer=L.canvas({padding:0.2})' in s, name
 assert 'renderer:markerRenderer' in s, name
 assert 'renderer:L.canvas()' not in s, name
 assert "FALLBACK.map(d=>({...d,tags:Array.isArray(d.tags)" in s, name
 assert "atlas132-nav.js?v=222" in s, "Legacy explorers must load updated universal search, not the stale v192 script"
 assert 'oldExport' not in s, name
 assert "teamjura" not in s or 'gme-v9-pins' in s, name
assert "switchGame(5);populateCategories();restoreDeepLink();loadFullData();" in (r/'online-explorer.html').read_text()
assert "switchGame(6);populateCategories();restoreDeepLink();loadFullData();" in (r/'legacy-explorer.html').read_text()
import json
pack=json.loads((r/'data/gtadb-6.json').read_text(encoding='utf-8'))
manifest=json.loads((r/'data/gtadb-6-manifest.json').read_text(encoding='utf-8'))
assert pack['game']=='6' and pack['count']==manifest['count'] and pack['mappedCount']==manifest['mappedCount']
assert pack['searchOnlyCount']==manifest['searchOnlyCount']
assert len(pack['records'])==manifest['count']
print('Atlas 19.6 legacy map performance/source/nav regression: PASS')
