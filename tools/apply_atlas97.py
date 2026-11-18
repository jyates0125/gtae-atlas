#!/usr/bin/env python3
"""Atlas 9.7 cumulative installation: Atlas 9.4/9.5/9.6 plus human-first navigation.
Development only; preservation-first. Unifies the visitor journey without removing
legacy pages, original map engines, game data, art or existing localStorage keys.
"""
from pathlib import Path
import argparse
from apply_atlas96 import apply as apply_96

ROOT=Path(__file__).resolve().parents[1]
TAGS=(
 '<link rel="stylesheet" href="./atlas97-connect.css?v=97">',
 '<script defer src="./atlas97-connect.js?v=97"></script>',
)
REQUIRED=('atlas97-journey.html','atlas97-journey.css','atlas97-journey.js',
          'atlas97-connect.js','atlas97-connect.css',
          'art/atlas97-proposed-loki-scaly-hero.webp')

def insert(html, tags):
    for tag in tags:
        if tag not in html:
            lowered=html.lower()
            idx=lowered.rfind('</head>')
            if idx<0:raise ValueError('Cannot install into malformed HTML without </head>')
            html=html[:idx]+tag+'\n'+html[idx:]
    return html

def apply(check=False):
    apply_96(check)
    for name in REQUIRED:
        if not (ROOT/name).is_file():raise FileNotFoundError('Atlas 9.7 missing: '+name)
    changed=[]
    for path in sorted(ROOT.glob('*.html')):
        old=path.read_text('utf-8')
        # Journey page is complete and already owns its 9.7 script/style refs.
        updated=insert(old, TAGS)
        if updated!=old:
            changed.append(path.name)
            if not check:path.write_text(updated,'utf-8')
    print(('Would update' if check else 'Updated'),len(changed),'Atlas 9.7 page headers:',', '.join(changed) or '(already current)')
    return changed

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--check',action='store_true')
    opt=p.parse_args();apply(opt.check)
