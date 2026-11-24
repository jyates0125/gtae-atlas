#!/usr/bin/env python3
"""Atlas 30.1: source checks guard every shared heist checklist call site."""
from pathlib import Path
import re,subprocess
root=Path(__file__).resolve().parents[1]
s=(root/'heist-pages.js').read_text(encoding='utf-8')
html=(root/'heists.html').read_text(encoding='utf-8')
styling=(root/'heist-theme.css').read_text(encoding='utf-8')
pages=set(re.findall(r'href="\./heist-([a-z0-9-]+)\.html"',html))
assert len(pages)==15,(len(pages),sorted(pages))
for id in pages:
 page=(root/('heist-'+id+'.html')).read_text(encoding='utf-8')
 assert 'src="./heist-pages.js' in page,id
 assert 'data-heist="'+id+'"' in page,id
for key in [
 'function readChecklist()',
 'function refreshChecklist()',
 'function saveOneStep(step,wanted)',
 'function paintProgress()',
 'if(!latest.ok)',
 'const next={...latest.value,[step]:wanted}',
 "window.addEventListener('storage'",
 'refreshChecklist(); // read only; never write during initial page load',
 'Only current displayed steps are reset',
 'unreadableRaw:latest.raw',
 "notice.setAttribute('aria-live','polite')",
 "if(url)setTimeout(()=>URL.revokeObjectURL(url),1000)"
]: assert key in s,key
assert s.count("localStorage.setItem(key,") == 2, 'One scoped edit and one explicit reset only'
assert "localStorage.setItem(key,JSON.stringify(Object.fromEntries(checks" not in s
assert "data-step" in s and 'check.dataset.step' in s
assert 'j301-checklist-notice[hidden]' in styling
assert 'atlas298-heist-map-kit.js' in s and 'atlas299-heist-backup.js' in s
assert "heistId!=='cayo-perico'" in s
# Daily-source cache parameters can coexist with the checklist version.
# Assert the actual script path and a non-regressed numeric version.
from html import unescape
from urllib.parse import urlsplit, parse_qs
cayo=(root/'heist-cayo-perico.html').read_text(encoding='utf-8')
scripts=[urlsplit(unescape(src)) for src in re.findall(r'<script\b[^>]*\bsrc="([^"]+)"',cayo)]
checklist=[u for u in scripts if u.path=='./heist-pages.js']
assert len(checklist)==1, 'Cayo must load one shared checklist script'
versions=parse_qs(checklist[0].query).get('v',[])
assert len(versions)==1 and versions[0].isdigit() and int(versions[0])>=301, 'Cayo must fetch current checklist script'
result=subprocess.run(['node','--check',str(root/'heist-pages.js')],capture_output=True,text=True)
assert result.returncode==0,result.stderr
print('Atlas 30.1 source guard: all fifteen heists, no load write, scoped saves, history and backups passed')
