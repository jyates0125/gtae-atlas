#!/usr/bin/env python3
"""Atlas 30.6: reuse original IV source-detail dismiss handler safely."""
from pathlib import Path
import subprocess
root=Path(__file__).resolve().parents[1]
html=(root/'atlas-iv.html').read_text(encoding='utf-8')
js=(root/'atlas306-iv-return.js').read_text(encoding='utf-8')
css=(root/'atlas306-iv-return.css').read_text(encoding='utf-8')
for name in ('classicCanvas','classicDetail','closeDetail','detailContent','classicMapShell'):
 assert 'id="'+name+'"' in html
assert html.count('atlas306-iv-return.js?v=306')==1
assert html.count('atlas306-iv-return.css?v=306')==1
assert 'close.click()' in js and 'canvas.focus({preventScroll:true})' in js
assert 'MutationObserver(sync)' in js and "event.key!=='Escape'" in js
assert 'localStorage.setItem' not in js and 'history.pushState' not in js and 'window.location=' not in js
assert 'min-height:44px' in css and 'max-height:calc(100dvh - 18px)' in css
for name in ('atlas306-iv-return.js','atlas-iv.js'):
 result=subprocess.run(['node','--check',str(root/name)],capture_output=True,text=True)
 assert result.returncode==0,(name,result.stderr)
print('Atlas 30.6 IV/episode map exit source checks passed')
