#!/usr/bin/env python3
"""Apply Team Jura's unobtrusive universal navigation to ALL website pages.
Never removes older content, maps, game data or saved progress. Idempotent.
"""
from pathlib import Path
root=Path(__file__).resolve().parents[1]
links=['<link rel="stylesheet" href="./atlas89-shell.css?v=89">','<script defer src="./atlas89-shell.js?v=89"></script>']
updated=[];excluded=[]
for p in sorted(root.glob('*.html')):
 src=p.read_text(encoding='utf-8')
 if src.count('</head>')!=1:excluded.append(p.name);continue
 for link in links:
  if link not in src:src=src.replace('</head>',link+'\n</head>',1)
 p.write_text(src,encoding='utf-8');updated.append(p.name)
assert len(updated)>=15, f'Too few HTML pages: {len(updated)}'
print(f'Atlas 8.9 global navigation installed in {len(updated)} HTML pages; skipped {excluded}')
