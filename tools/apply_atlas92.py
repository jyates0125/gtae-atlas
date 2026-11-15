#!/usr/bin/env python3
"""Idempotent, additive Team Jura 9.2 updater. Run from repository root.
No existing map, source database, or localStorage schema is overwritten.
"""
from pathlib import Path
import sys
ROOT=Path(__file__).resolve().parent.parent
PAGES=sorted(p.name for p in ROOT.glob('*.html') if not p.name.startswith('heist-'))
HEISTS=sorted(p.name for p in ROOT.glob('heist-*.html'))
STYLE='<link rel="stylesheet" href="./atlas92-style.css?v=92">'
UI='<script defer src="./atlas92-ui.js?v=92"></script>'
DAILY='<script defer src="./atlas92-daily.js?v=92"></script>'
HEIST='<script defer src="./atlas92-heists.js?v=92"></script>'

def inject(text, tags):
    if '</head>' not in text.lower():raise ValueError('Missing </head>')
    for tag in tags:
        if tag not in text:
            index=text.lower().rindex('</head>')
            text=text[:index]+tag+'\n'+text[index:]
    return text

def run(check=False):
    if not (ROOT/'atlas92-ui.js').exists():raise FileNotFoundError('Upload files into repository root first')
    touched=[]
    for name in PAGES+HEISTS:
        path=ROOT/name
        if not path.exists():
            if name in PAGES:print('Optional page absent:',name)
            continue
        before=path.read_text(encoding='utf-8')
        tags=[STYLE,UI]
        if name=='atlas87-daily.html':tags.append(DAILY)
        if name in HEISTS:tags.append(HEIST)
        if '</head>' not in before.lower():
            print('SKIP non-document HTML without </head>:', name)
            continue
            after=inject(before,tags)
            if before!=after:
                touched.append(name)
        if before!=after:
            touched.append(name)
            if not check:path.write_text(after,encoding='utf-8')
    print(('Would update' if check else 'Updated'),len(touched),'pages:',', '.join(touched) or '(already current)')
    return touched
if __name__=='__main__':run('--check' in sys.argv)
