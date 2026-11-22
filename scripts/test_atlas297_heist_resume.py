#!/usr/bin/env python3
"""Atlas 29.7: Heist HQ resumes only meaningful saved guest progress."""
from pathlib import Path
import re,subprocess
root=Path(__file__).resolve().parents[1]
directory=(root/'heist-directory.js').read_text(encoding='utf-8')
html=(root/'heists.html').read_text(encoding='utf-8')
css=(root/'atlas151-heist-gallery.css').read_text(encoding='utf-8')
routes=set(re.findall(r'href="\./heist-([a-z0-9-]+)\.html"',html))
assert len(routes)==15,('Expected all distinct workspace routes',sorted(routes))
assert 'id="heistStarted"> Saved progress' in html
for token in ('teamjura-heist-plan-v1:','teamjura-heist-focus-v1:','j297-heist-resume','j297-resume-card','p.hasProgress','safeJson','fields.filter'):
    assert token in directory, token
assert 'localStorage.setItem' not in directory and 'localStorage.removeItem' not in directory
assert "link.href=item.href" in directory,'Resume URLs must derive only from validated on-page workspace links'
assert "resumable.slice(0,5)" in directory,'Bound resume list length'
assert 'j297-heist-resume[hidden]' in css and 'j297-resume-card:focus-visible' in css
cmd=subprocess.run(['node','--check',str(root/'heist-directory.js')],capture_output=True,text=True)
assert cmd.returncode==0,cmd.stderr
print('Atlas 29.7: 15 routed heist workspaces, read-only device resume, safe links and keyboard styling PASS')
