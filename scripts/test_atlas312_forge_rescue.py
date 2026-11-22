#!/usr/bin/env python3
"""Atlas 31.2 — Forge corrupt-save rescue, exact bytes and scope source audit."""
from pathlib import Path
import subprocess
r=Path(__file__).resolve().parents[1]
html=(r/'atlas-vehicle-configurator.html').read_text(encoding='utf-8')
js=(r/'atlas101-configurator.js').read_text(encoding='utf-8')
css=(r/'atlas312-forge-rescue.css').read_text(encoding='utf-8')
for tag in ('j312-recovery','j312-export','j312-reset','j312-recovery-message'):
 assert html.count('id="'+tag+'"')==1,tag
assert 'atlas101-configurator.js?v=312' in html
assert html.count('atlas312-forge-rescue.css?v=312')==1
for token in ('function inspectForgeRecovery()','function downloadForgeRecovery()',
 'function resetForgeAfterRecovery()',"'team-jura-forge-recovery-v1'",
 'unreadableRaw:issue.raw','forgeRecoveryExported=true',
 'localStorage.getItem(KEY)!==issue.raw',
 "if(!window.confirm('Start fresh ONLY",
 "localStorage.setItem(KEY,JSON.stringify(empty))",
 "if(e.key===KEY)inspectForgeRecovery()"):
 assert token in js,token
assert js.count('localStorage.getItem(KEY)!==issue.raw')==2
assert "forgeRecoveryExported=false" in js
assert "new Blob([JSON.stringify(backup,null,2)]" in js
assert 'min-height:44px' in css and 'focus-visible' in css
for f in ('atlas101-configurator.js','atlas99-garage3d.js'):
 p=subprocess.run(['node','--check',str(r/f)],capture_output=True,text=True)
 assert p.returncode==0,(f,p.stderr)
print('Atlas 31.2 Forge raw recovery static safeguards and syntax passed')
