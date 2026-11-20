#!/usr/bin/env python3
"""Atlas 8.8: connect existing game rule engine, ghost icon/status and events legend."""
from pathlib import Path
root=Path(__file__).resolve().parents[1]
for name in ['atlas-online.html','atlas87-daily.html']:
 p=root/name;s=p.read_text(encoding='utf-8');assert s.count('</head>')==1,name
 for line in ['<link rel="stylesheet" href="./atlas88-events.css?v=88">','<script defer src="./atlas88-events.js?v=88"></script>']:
  if line not in s:s=s.replace('</head>',line+'\n</head>',1)
 p.write_text(s,encoding='utf-8')
# Make the real map renderer use identical event symbols / status criteria as sidebar.
p=root/'atlas.js';s=p.read_text(encoding='utf-8')
needle="function atlas85CollectibleIcon(r){"
assert s.count(needle)==1,'Map icon function not found'
if "window.TeamJuraEventIcon88?.forRecord(r)" not in s:
 s=s.replace(needle,"function atlas85CollectibleIcon(r){\n const eventIcon=window.TeamJuraEventIcon88?.forRecord(r);if(eventIcon)return eventIcon;",1)
# For a ghost event switched off, use a white possible/inactive marker rather than blue unknown.
a="function conditionPinColor(r,storeCache){const c=conditionForRecord(r,storeCache);return c?window.JuraConditions.markerColor(c.status):r.markerColor||CATEGORIES[r.category]?.[1]||'#f7c97b';}"
b="function conditionPinColor(r,storeCache){const c=conditionForRecord(r,storeCache);if(c&&/^ghost-/i.test(r.activityId||'')&&['closed','unknown','possible'].includes(c.status))return '#f8fafc';return c?window.JuraConditions.markerColor(c.status):r.markerColor||CATEGORIES[r.category]?.[1]||'#f7c97b';}"
assert s.count(a)==1 or b in s,'Map condition coloring changed; manual review required'
if a in s:s=s.replace(a,b,1)
p.write_text(s,encoding='utf-8')
print('PASS: 8.8 events and ghost icon rendering connected. No saved progress overwritten.')
