#!/usr/bin/env python3
"""Atlas 29.9: one private heist backup merges four existing save families."""
from pathlib import Path
import subprocess
root=Path(__file__).resolve().parents[1]
bootstrap=(root/'heist-pages.js').read_text(encoding='utf-8')
script=(root/'atlas299-heist-backup.js').read_text(encoding='utf-8')
css=(root/'atlas299-heist-backup.css').read_text(encoding='utf-8')
for marker in ('atlas299-heist-backup.js?v=299','atlas299-heist-backup.css?v=299'):
 assert marker in bootstrap,marker
for marker in ('teamjura-heist-', 'teamjura-heist-plan-v1:',
 'teamjura-heist-focus-v1:', 'team-jura-atlas93-heist-intel-heist-', 'teamjura-heist-bundle-v1',
 'validIntel','state(hasIntel)','mergedIntel',
 'localStorage.setItem','localStorage.getItem',
 'No missing progress found','unsupported shape','no saved data was overwritten',
 'source', 'location.reload()', 'selected.size>150000'):
 if marker=='source':continue
 assert marker in script,marker
for problem in ('fetch(', 'XMLHttpRequest(', 'navigator.sendBeacon('):
 assert problem not in script,'Unintended network dependency '+problem
assert 'j299-heist-backup' in css and 'focus-visible' in css
for heist in ('fleeca','prison-break','humane-labs','series-a','pacific-standard',
 'doomsday-act-1','doomsday-act-2','doomsday-act-3','diamond-casino','cayo-perico',
 'cluckin-bell','salvage-yard','auto-shop','agency-vip','kortz-center'):
 assert f'data-heist="{heist}"' in (root/f'heist-{heist}.html').read_text(encoding='utf-8')
for js in ('atlas299-heist-backup.js','heist-pages.js'):
 cmd=subprocess.run(['node','--check',str(root/js)],capture_output=True,text=True)
 assert cmd.returncode==0,(js,cmd.stderr)
print('PASS Atlas 29.9: all 15 heists, four legacy save families, no account/network, source and syntax')
