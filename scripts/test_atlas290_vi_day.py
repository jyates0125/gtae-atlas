#!/usr/bin/env python3
"""Atlas 29.0: precise new GTA VI in-game Day source and saved-state regression."""
from pathlib import Path
import re
R=Path(__file__).resolve().parents[1]
engine=(R/'atlas.js').read_text(encoding='utf-8')
vi=(R/'atlas-vi.html').read_text(encoding='utf-8')
credits=(R/'atlas-credits.html').read_text(encoding='utf-8')
assert "day:[[0,0,2,3],[1,1,5,6],[2,2,10,12],[4,4,20,25],[8,8,41,51],[17,17,83,103],[34,34,167,206]]" in engine
assert "'6':[['day','In-game Day · GTADB map'],['scaly,view','Scaly · YANIS V18']" in engine
assert "['yanis,18','YANIS V18 · Current']" in engine and "['dupzor,51','Loki · DUPZOR V51']" in engine
assert "view.base==='day'?6:5" in engine, "Native Day zoom 6 must not force mismatched community zoom"
assert "const APP='team-jura-atlas-v41'" in engine, "Never invalidate personal save namespace"
assert "https://raw.githubusercontent.com/rolux/gtadb.org/main/" in engine and "const TILE_HOSTS=[UPSTREAM+'maps/tiles/'" in engine
assert 'GTA VI' in vi and 'in-game Day tiles' in vi
assert "Rockstar's separate official printable poster view" in vi
assert 'GTADB GTA VI in-game Day tile family' in credits
assert 'Rockstar/Take-Two intellectual property' in credits
assert "LICENSE-DATA" in credits and 'creativecommons.org/licenses/by/4.0/' in credits
for page in ('atlas.html','atlas-online.html','atlas-vi.html'):
    html=(R/page).read_text(encoding='utf-8')
    assert 'atlas.js?v=369' in html, (page,'stale map engine')
    assert html.count('atlas.js?v=369')==1,page
assert 'atlas-sw.js?v=290' in engine
assert "const LAYERS=" in engine and "'5':[['radar','In-game radar']" in engine
assert "SHELL='team-jura-atlas-v290-shell'" in (R/'atlas-sw.js').read_text(encoding='utf-8')
# Local CC BY source snapshot contains ALL upstream landmarks, including the
# 91 without X/Y which must stay searchable and never be auto-positioned.
data=__import__('json').loads((R/'data/gtadb-6.json').read_text(encoding='utf-8'))
rows=data['records']
valid=lambda p:isinstance(p,list) and len(p)==2 and all(isinstance(n,(float,int)) and not isinstance(n,bool) and abs(n)<=16384 for n in p)
located=sum(valid(r[1]) for r in rows.values())
assert data['schema']==2 and data['game']=='6'
assert len(rows)==data['count']==3754 and located==data['mappedCount']==3663
assert data['searchOnlyCount']==len(rows)-located==91
for key in ('j290-vi-ledger','j290-search','j290-kind','j290-tag','j290-list','j290-prev','j290-next'):
    assert 'id="'+key+'"' in vi,('Missing source index control',key)
ledger=(R/'atlas290-vi-source-ledger.js').read_text(encoding='utf-8')
assert 'atlas290-vi-source-ledger.js?v=290' in vi
assert 'atlas290-vi-source-ledger.css?v=290' in vi
assert 'validPosition' in ledger and 'Search-only · no verified map point' in ledger
assert "item.mapped?'Community X/Y · provisional':'Search-only · no verified map point'" in ledger
assert 'textContent' in ledger and 'innerHTML' not in ledger and 'eval(' not in ledger
assert "encodeURIComponent(item.id)" in ledger
assert '"./atlas290-vi-source-ledger.js"' in (R/'atlas-sw.js').read_text(encoding='utf-8')
print('PASS Atlas 29.0: GTADB Day map, native tile bounds, saved keys, legal credits and V/Online isolation')
