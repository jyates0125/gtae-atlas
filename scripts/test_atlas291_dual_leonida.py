#!/usr/bin/env python3
"""Atlas 29.1 integration contract: one Leonida map workflow, no location claims or lost guest saves."""
from pathlib import Path
import json,re,subprocess
R=Path(__file__).resolve().parents[1]
vi=(R/'atlas-vi.html').read_text(encoding='utf-8')
mapjs=(R/'atlas.js').read_text(encoding='utf-8')
indexjs=(R/'atlas290-vi-source-ledger.js').read_text(encoding='utf-8')
posterjs=(R/'atlas290-official-landmarks.js').read_text(encoding='utf-8')
official=(R/'atlas143-official-map-view.js').read_text(encoding='utf-8')
worker=(R/'atlas-sw.js').read_text(encoding='utf-8')
workflow=(R/'.github/workflows/team-jura-release.yml').read_text(encoding='utf-8')
pack=json.loads((R/'data/gtadb-6.json').read_text(encoding='utf-8'))
assert len(pack['records'])==pack['count']==3754
assert pack['mappedCount']==3663 and pack['searchOnlyCount']==91
assert "styles={'5':'radar','6':'scaly,view'}" in mapjs, 'Do not replace known Scaly default without pin calibration'
assert "['day','In-game Day · GTADB map']" in mapjs
for name in ('atlas290-vi-source-ledger.js','atlas290-vi-source-ledger.css', 'atlas290-official-landmarks.js','atlas290-official-landmarks.css'):
 assert name in vi and '"./'+name+'"' in worker, ('missing VI link/offline support',name)
 assert name not in (R/'atlas.html').read_text(encoding='utf-8'), ('accidentally leaked into GTA V',name)
 assert name not in (R/'atlas-online.html').read_text(encoding='utf-8'), ('accidentally leaked into Online',name)
assert "landmark='+encodeURIComponent(item.id)" in indexjs
assert "new URLSearchParams(location.search).get('landmark')" in posterjs
assert "query.value=requested;list();select(requested)" in posterjs
assert "picking=id" not in posterjs, 'Placement state must use explicit hint and safe cancel helper'
assert "function pickup(id)" in posterjs and "data-j290='cancel'" in posterjs
assert "window.addEventListener('jura:poster:clear',clear)" in posterjs
assert "window.dispatchEvent(new Event('jura:poster:clear'))" in official
assert "crypto.subtle.digest('SHA-256'" in official
assert 'jura3-progress' in mapjs or 'jura3-progress' in (R/'atlas98b-progress.js').read_text(encoding='utf-8')
assert "team-jura-atlas-v41" in mapjs, 'Guest pin storage namespace cannot change'
assert "SHELL='team-jura-atlas-v290-shell'" in worker
assert workflow.count('python scripts/test_atlas290_poster_browser.py')==2
assert workflow.count('python scripts/test_atlas290_vi_day_browser.py')==2
for name in ('atlas290-official-landmarks.js','atlas290-vi-source-ledger.js','atlas143-official-map-view.js'):
 check=subprocess.run(['node','--check',str(R/name)],capture_output=True,text=True)
 assert check.returncode==0,(name,check.stderr)
print('PASS Atlas 29.1: Day opt-in, existing map fallback, 3754 sources, manual poster deep links, private saves, offline and game isolation')
