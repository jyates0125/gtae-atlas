#!/usr/bin/env python3
"""Atlas 29.8: six heist venues link only to source-matched GTADB landmarks."""
from pathlib import Path
import json,re,subprocess
root=Path(__file__).resolve().parents[1]
index=json.loads((root/'data/gtadb-5.json').read_text(encoding='utf-8'))
assert index['game']=='5' and index['license']=='CC BY 4.0'
js=(root/'atlas164-heist-workspace.js').read_text(encoding='utf-8')
css=(root/'atlas164-heist-workspace.css').read_text(encoding='utf-8')
expected={
 'fleeca':('L697','Fleeca'),
 'prison-break':('L508','Bolingbroke Penitentiary'),
 'humane-labs':('L553','Humane Labs'),
 'pacific-standard':('L2013','Pacific Standard'),
 'cluckin-bell':('L1596','Clucking Bell Farms'),
 'kortz-center':('L139','Kortz Center'),
}
for heist,(landmark,site) in expected.items():
    assert f"'{heist}':" in js and f"'{landmark}']]" in js, (heist,landmark)
    item=index['records'][landmark]
    assert site.lower() in item[0].lower(), (heist,item[0])
    assert isinstance(item[1],list) and len(item[1])==2, (heist,'No source coordinates')
    assert (root/f'heist-{heist}.html').exists(),heist
assert js.count("'gtadb-5-'+record")==1
assert 'u.searchParams.set(' in js
assert "new URL(map,document.baseURI)" in js
assert 'not automatically verified heist positions' in js
assert 'j298-mission-sites' in css and 'focus-visible' in css
assert 'L508' not in (root/'atlas-vi.html').read_text(encoding='utf-8')
cmd=subprocess.run(['node','--check',str(root/'atlas164-heist-workspace.js')],text=True,capture_output=True)
assert cmd.returncode==0,cmd.stderr
print('PASS Atlas 29.8: six source-linked heist sites, GTADB provenance, no asserted heist coords or map overlays')
