#!/usr/bin/env python3
"""Atlas 30.3 structural: exactly thirteen original world routes, not fake placeholders."""
from pathlib import Path
import re,subprocess
root=Path(__file__).resolve().parents[1]
data=(root/'atlas98-worlds.js').read_text(encoding='utf-8')
portal=(root/'atlas98-portal.js').read_text(encoding='utf-8')
index=(root/'maps.html').read_text(encoding='utf-8')
classic=(root/'atlas98-classic.js').read_text(encoding='utf-8')
routes=re.findall(r"\{id:'([a-z0-9]+)',name:'[^']+',short:'[^']+',game:'[^']+',href:'([^']+)'",data)
assert [id for id,_ in routes]==['story','online','vi','cayo','iv','sa','vc','iii','vcs','lcs','ctw','tlad','tbogt'],routes
assert len({path for _,path in routes})==13
for game,href in routes:
 file=href.partition('?')[0]
 assert (root/file).is_file(),(game,file)
 if href.startswith('map-hub.html?'):
  assert href=='map-hub.html?game='+game,(game,href)
  assert re.search(r'\b'+game+r':\{name:',classic),game
assert "window.TeamJuraWorlds" not in data or 'root.TeamJuraWorlds=Object.freeze' in data
assert "w.group==='featured'" in portal
for query in ('#directoryFeatured','#directoryAdditional','#worldSearch','#resetWorldSearch','#j212RecentLink'):
 assert query in portal or query.lstrip('#') in index,query
for code in ['atlas98-worlds.js','atlas98-portal.js','atlas98-classic.js']:
 r=subprocess.run(['node','--check',str(root/code)],capture_output=True,text=True)
 assert r.returncode==0,r.stderr
assert 'id="clearWorldSearch"' in index and 'id="resetWorldSearch"' in index
assert "const resetWorlds=" in portal and "resetTool.hidden" in portal
assert "clearWorldSearch').onclick=resetWorlds" in portal
assert "./atlas98-portal.js?v=303" in index and "./atlas98-portal.css?v=303" in index
assert 'jura155-' in data and 'jura157-' in data,'Preserve original approved world images'
assert 'Community map positions are not verified gameplay coordinates.' in data
assert '2,648 of 2,650 GTADB IV landmarks have positions' in data
print('Atlas 30.3: 13 unique destination routes and seven classic game IDs, source distinctions and original artwork passed')
