#!/usr/bin/env python3
"""Atlas 30.2: seven classical map notebook recovery contracts."""
from pathlib import Path
import re,subprocess
root=Path(__file__).resolve().parents[1]
js=(root/'atlas98-classic.js').read_text(encoding='utf-8')
css=(root/'atlas98-classic.css').read_text(encoding='utf-8')
html=(root/'map-hub.html').read_text(encoding='utf-8')
world_config=js.split('const worlds={',1)[1].split('};',1)[0]
worlds=re.findall(r'^\s*(iii|vc|vcs|lcs|ctw|tlad|tbogt):\{name:',world_config,re.M)
assert len(worlds)==7 and len(set(worlds))==7,worlds
for part in (
 "function validNotebook(x)", "let storageIssue=null,lastStoredRaw=null",
 "storageIssue={kind:'corrupt',raw}", "function exportRecovery()",
 "unreadableRaw:storageIssue.raw", "function showRecovery()",
 "function persist()", "if(actual!==lastStoredRaw)",
 "storageIssue={kind:'stale',raw:actual}", "if(storageIssue){",
 "window.addEventListener('storage'",
 "if(!persist()){state.markers=previous;return}",
 "if(!persist()){state.markers=previousMarkers;return}",
 "if(!persist()){state.completed=previous;check.checked=previous.includes(name);return}"
): assert part in js,part
assert re.search(r'src="\./atlas98-classic\.js\?v=(\d+)"',html)
assert int(re.search(r'src="\./atlas98-classic\.js\?v=(\d+)"',html).group(1))>=334
assert 'href="./atlas98-classic.css?v=302"' in html
assert '.j302-recovery[hidden]' in css
assert '#j302-recovery-action' in js and '#j302-recovery-export' in js
assert "localStorage.removeItem(key)" not in js
assert "'team-jura-classic-recovery-v1'" in js
p=subprocess.run(['node','--check',str(root/'atlas98-classic.js')],capture_output=True,text=True)
assert p.returncode==0,p.stderr
print('Atlas 30.2 source passed: seven classic maps, read-only recovery, stale-write refusal and cache identity')
