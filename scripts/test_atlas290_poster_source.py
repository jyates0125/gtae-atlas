#!/usr/bin/env python3
"""Atlas 29.0 — official poster source boundaries, private notebook, and data integrity."""
from pathlib import Path
import json,re,subprocess

root=Path(__file__).resolve().parents[1]
html=(root/'atlas-vi.html').read_text(encoding='utf8')
poster=(root/'atlas143-official-map-view.js').read_text(encoding='utf8')
notebook=(root/'atlas290-official-landmarks.js').read_text(encoding='utf8')
style=(root/'atlas290-official-landmarks.css').read_text(encoding='utf8')
pack=json.loads((root/'data/gtadb-6.json').read_text(encoding='utf8'))
manifest=json.loads((root/'data/gtadb-6-manifest.json').read_text(encoding='utf8'))

assert pack['schema']==2 and pack['game']=='6' and pack['status']=='community-provisional'
assert pack['count']==len(pack['records'])==manifest['count']
assert pack['mappedCount']+pack['searchOnlyCount']==pack['count']
assert manifest['sourceHash']==pack['sourceHash']
assert manifest['upstreamRevision']=='d406fea099e1df2bce42fd6b87eed04bce646629'
assert all(re.fullmatch(r'L[1-9][0-9]*',key) for key in pack['records'])
assert len(pack['records'])==len(set(pack['records']))
assert 'atlas290-official-landmarks.js?v=290' in html and 'atlas290-official-landmarks.css?v=290' in html
assert 'atlas290-official-landmarks.js' not in (root/'atlas.html').read_text()
assert 'atlas290-official-landmarks.js' not in (root/'atlas-online.html').read_text()
assert "crypto.subtle.digest('SHA-256'" in poster
assert "jura:poster:ready" in poster and "jura:poster:clear" in poster
assert "jura:poster:ready" in notebook and "jura:poster:clear" in notebook
assert "input.fingerprint!==fingerprint" in notebook
assert "validCoordinate(xy)" in notebook and "game:'6'" in notebook
assert 'MAX_PINS=500' in notebook and 'MAX_RESULTS=30' in notebook
assert 'No Rockstar art copied into the deployable package' in poster
assert 'The official image stays in the player' in notebook
assert 'Never' in notebook or 'NEVER projected' in notebook
assert '.j290-pins[hidden]' in style and '.j290-pin' in style
for file in ('atlas143-official-map-view.js','atlas290-official-landmarks.js'):
    result=subprocess.run(['node','--check',str(root/file)],capture_output=True,text=True)
    assert result.returncode==0,(file,result.stderr)
print(f'PASS Atlas 29.0 poster notebook: {pack["count"]} source records, {pack["mappedCount"]} provisional coordinates and {pack["searchOnlyCount"]} search-only; private SHA-scoped manual pins, syntax, world separation')
