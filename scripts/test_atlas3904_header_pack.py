#!/usr/bin/env python3
"""Verify the complete new header pack before release; no missing art or impostors."""
import argparse,hashlib,json
from pathlib import Path
R=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser()
p.add_argument('--require',action='store_true')
a=p.parse_args()
entries=json.loads((R/'docs/ATLAS3904-HEADER-ART.json').read_text())['images']
assert len(entries)==9
present=[]
for key,entry in entries.items():
    source=R/entry['path']
    if source.is_file():
        data=source.read_bytes()
        assert data[:4]==b'RIFF' and data[8:12]==b'WEBP',key
        assert hashlib.sha256(data).hexdigest()==entry['sha256'],key
        present.append(key)
if a.require:
    assert len(present)==9,'Release blocked: complete original cinematic artwork installation required'
if len(present)==9 and (R/'public/atlas3903-header-refresh.css').is_file():
    rendered=(R/'public/atlas3903-header-refresh.css').read_text()
    for key,entry in entries.items():
        assert '[data-gtae-header="'+key+'"]{--j3904-art:url("./'+entry['path']+'")}' in rendered,key
print('Atlas 39.0.4 art: '+str(len(present))+'/9 exact original images installed')
