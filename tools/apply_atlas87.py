#!/usr/bin/env python3
"""Non-destructive Atlas 8.7 integration; preserves engine, saved progress and active data."""
from pathlib import Path
root=Path(__file__).resolve().parents[1]

def add(name,links):
 p=root/name
 s=p.read_text(encoding='utf-8')
 assert s.count('</head>')==1, f'{name}: expected a single closing head tag'
 for link in links:
  if link not in s:s=s.replace('</head>',link+'\n</head>',1)
 p.write_text(s,encoding='utf-8')

add('maps.html',['<link rel="stylesheet" href="./atlas87-all-maps.css?v=87">','<script defer src="./atlas87-all-maps.js?v=87"></script>'])
add('atlas-online.html',['<link rel="stylesheet" href="./atlas87-daily.css?v=87">','<script defer src="./atlas87-daily.js?v=87"></script>'])
for page in ['atlas81-hq.html','atlas.html','atlas-vi.html','atlas-sa.html','atlas-cayo.html']:
 p=root/page;s=p.read_text(encoding='utf-8')
 # Add a lightweight cross-site All Maps link at the beginning of body instead of replacing legacy headers.
 marker='<body'
 if 'data-j87-maps-link' in s:continue
 at=s.find('>',s.index(marker))+1
 link='<a data-j87-maps-link href="./maps.html" style="position:fixed;bottom:12px;right:12px;z-index:1000;background:#2a153a;color:#ffcb78;padding:10px 14px;border:1px solid #efae56;border-radius:10px;text-decoration:none;font:700 12px system-ui;box-shadow:0 4px 18px #10091fae">▦ All Maps</a>'
 s=s[:at]+link+s[at:]
 p.write_text(s,encoding='utf-8')
print('Atlas 8.7 maps/daily links inserted; no game data overwritten.')
