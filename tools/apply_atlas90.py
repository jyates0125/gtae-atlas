#!/usr/bin/env python3
from pathlib import Path
root=Path(__file__).resolve().parents[1]
for n in ('atlas90-seed.json','atlas90-gallery.js','atlas90-gallery.css','atlas90-weapons.html','atlas90-vehicles5.html','atlas90-vehicles6.html'):
 assert (root/n).stat().st_size>300,n
p=root/'atlas.js';s=p.read_text();s=s.replace("['loki,view','Loki · DUPZOR V51'],",'');assert "['loki,view','Loki · DUPZOR V51']," not in s;p.write_text(s)
p=root/'atlas86-ui.js';s=p.read_text().replace("'loki,view':'Loki · DUPZOR',",'');p.write_text(s)
p=root/'atlas89-shell.js';s=p.read_text();needle="['♜ Heists','heists.html']";assert needle in s
if 'atlas90-weapons.html' not in s:s=s.replace(needle,"['⚔ Weapons Gallery','atlas90-weapons.html'],['◆ GTA V Vehicles','atlas90-vehicles5.html'],['◇ GTA VI Vehicles','atlas90-vehicles6.html'],"+needle,1)
p.write_text(s)
p=root/'atlas87-all-maps.js';s=p.read_text();needle='<a href="./atlas-catalog.html">▦ Vehicles & database</a>';assert needle in s
if 'atlas90-weapons.html' not in s:s=s.replace(needle,needle+'<a href="./atlas90-weapons.html">⚔ Weapons · pictured catalog</a><a href="./atlas90-vehicles5.html">◆ GTA V vehicles · pictured catalog</a><a href="./atlas90-vehicles6.html">◇ GTA VI vehicles · research catalog</a>',1)
p.write_text(s)
for name in ('atlas.html','atlas-online.html','atlas-vi.html'):
 p=root/name;s=p.read_text()
 if 'atlas90-shortcuts.js?v=90' not in s:
  assert s.count('</head>')==1
  s=s.replace('</head>','<script defer src="./atlas90-shortcuts.js?v=90"></script>\n</head>',1)
 p.write_text(s)
print('PASS Atlas 9.0 catalog integration and Loki view retirement')
