#!/usr/bin/env python3
"""Atlas 30.2: emergency-only visible Cayo recovery and single heist map loader."""
from pathlib import Path
import subprocess
r=Path(__file__).resolve().parents[1]
html=(r/'heist-cayo-perico.html').read_text(encoding='utf-8')
page=(r/'heist-pages.js').read_text(encoding='utf-8')
js=(r/'atlas302-cayo-legacy-rescue.js').read_text(encoding='utf-8')
css=(r/'atlas302-cayo-legacy-rescue.css').read_text(encoding='utf-8')
assert html.count('atlas302-cayo-legacy-rescue.js?v=302')==1
assert html.count('atlas302-cayo-legacy-rescue.css?v=302')==1
assert 'heist-pages.js?v=4742' in html
assert 'atlas220-cayo-recovery.js?v=4742' in html
assert page.count("phases.src='./atlas298-heist-map-kit.js?v=298'")==1
assert page.count("phasesStyle.href='./atlas298-heist-map-kit.css?v=298'")==1
assert "heistId!=='cayo-perico'" in page
assert "atlas299-heist-backup.js" in page
assert "refreshChecklist(); // read only" in page
for marker in ("id='j302-cayo-recovery'", "'teamjura-heist-cayo-perico'","raw-checklist-recovery.txt",
 "readRaw().raw!==raw","window.confirm(","localStorage.setItem(KEY,'{}')","exported=true;reset.disabled=false",
 "if(!record.accessible||!invalid(record.raw))return","window.addEventListener('storage'"):
    assert marker in js,marker
for prohibited in ("fetch(","XMLHttpRequest(","navigator.sendBeacon(","eval("):
    assert prohibited not in js,prohibited
assert ".j302-cayo-recovery" in css and "min-height:44px" in css and "focus-visible" in css
for name in ("heist-pages.js","atlas302-cayo-legacy-rescue.js"):
    subprocess.run(['node','--check',str(r/name)],check=True,capture_output=True,text=True)
print("Atlas 30.2 source acceptance: Cayo emergency rescue, old island map intact, fourteen phase maps mounted exactly once")
