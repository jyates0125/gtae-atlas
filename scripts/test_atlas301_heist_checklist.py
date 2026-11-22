#!/usr/bin/env python3
"""Atlas 30.1 - prevent guest mission checklist data loss on page open."""
from pathlib import Path
import subprocess
root=Path(__file__).resolve().parents[1]
js=(root/'heist-pages.js').read_text(encoding='utf-8')
css=(root/'atlas301-heist-checklist.css').read_text(encoding='utf-8')
html=(root/'heist-fleeca.html').read_text(encoding='utf-8')
for required in (
    "const readChecklist=()=>", "function loadReadOnly()", "loadReadOnly();",
    "const latest=readChecklist().value", "localStorage.setItem(key,JSON.stringify(next))",
    "window.addEventListener('storage'", "j301-rescue-download", "j301-rescue-reset",
    "badRaw===null", "localStorage.getItem(key)!==badRaw",
    "downloaded=true;repair.disabled=false", "raw-checklist-recovery.txt",
    "atlas301-heist-checklist.css", "atlas299-heist-backup.js",
    "atlas298-heist-map-kit.js", "if(heistId!=='cayo-perico')"
):
    assert required in js,required
assert "function update()=>{" not in js
assert "checks.forEach(x=>{x.checked=!!saved" not in js
assert "j301-rescue" in css and "min-height:44px" in css
assert "function ensureCayoRecovery()" in js, "Cayo must expose raw rescue outside its hidden legacy UI"
assert "document.getElementById('j301-cayo-recovery')?.remove();" in js
assert "body.j180-cayo #j301-cayo-recovery" in css
assert 'data-heist="fleeca"' in html
for name in ('fleeca','prison-break','humane-labs','series-a','pacific-standard',
    'doomsday-act-1','doomsday-act-2','doomsday-act-3','diamond-casino',
    'cayo-perico','cluckin-bell','salvage-yard','auto-shop','agency-vip','kortz-center'):
    assert f'data-heist="{name}"' in (root/f'heist-{name}.html').read_text(encoding='utf-8'),name
subprocess.run(['node','--check',str(root/'heist-pages.js')],check=True,capture_output=True,text=True)
print('Atlas 30.1 checklist source contract PASS: 15 pages, isolated saves, recovery, map/backup compatibility')
