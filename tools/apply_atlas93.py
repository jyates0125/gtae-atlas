#!/usr/bin/env python3
"""Idempotent Team Jura Atlas 9.3 cumulative upgrade. Must run after apply_atlas92.
Works only on matching existing pages. Never deletes data or changes save keys.
"""
from pathlib import Path
import sys,re
ROOT=Path(__file__).resolve().parents[1]
BASE=sorted(p.name for p in ROOT.glob('*.html') if not p.name.startswith('atlas93-'))
STYLES=['atlas93-global.css']
SCRIPTS=['atlas93-global.js']
MIGRATIONS=[(re.compile(r'(?i)TEAM JURA\s*[·•]\s*ATLAS 7\.0 Preview'), 'TEAM JURA · ATLAS 9.3'),(re.compile(r'(?i)ATLAS 7\.4\.1'), 'ATLAS 9.3'),(re.compile(r'(?i)Team Jura Atlas 7\.4 Explorer'), 'Team Jura Atlas 9.3 Explorer')]
def inject(html,styles,scripts):
    tags=[f'<link rel="stylesheet" href="./{s}?v=93">' for s in styles]+[f'<script defer src="./{s}?v=93"></script>' for s in scripts]
    if '</head>' not in html.lower():
        raise ValueError('HTML missing </head>')
    for tag in tags:
        if tag not in html:
            at=html.lower().rindex('</head>')
            html=html[:at]+tag+'\n'+html[at:]
    return html

def run(check=False):
    for file in ['atlas93-garage.html','atlas93-garage.js','atlas93-dispatch.html','atlas93-dispatch.js','atlas93-intel.js','atlas93-heist-intel.js','atlas93-global.js','atlas93-global.css','atlas92-ui.js']:
        if not (ROOT/file).exists():
            raise FileNotFoundError('Required file not uploaded: '+file)
    changed=[]
    for page in BASE:
        p=ROOT/page
        if not p.exists():
            continue
        old=p.read_text('utf-8')
        styles=STYLES[:]
        scripts=SCRIPTS[:]
        if page in ('atlas87-daily.html','atlas-online.html'):
            styles+=['atlas93-intel.css']
            scripts+=['atlas93-intel.js']
        if page.startswith('heist-'):
            styles+=['atlas93-heist-intel.css']
            scripts+=['atlas93-heist-intel.js']
        if '</head>' not in old.lower():
            print('SKIP non-document HTML without </head>:', page)
            continue
        txt=inject(old,styles,scripts)
        for pattern,repl in MIGRATIONS:
            txt=pattern.sub(repl,txt)
        if txt!=old:
            changed.append(page)
            if not check:
                p.write_text(txt,encoding='utf-8')
    print(('Would update' if check else 'Updated'),len(changed),'pages:',', '.join(changed) or '(already current)')
    return changed
if __name__=='__main__':run('--check' in sys.argv)
