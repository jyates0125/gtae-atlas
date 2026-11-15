#!/usr/bin/env python3
"""Apply Atlas 8.6 UI integration to original Team Jura development branch.
Idempotent, narrowly scoped. Does not replace saved progress, databases, routes, or map engine.
"""
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]

def insert_before_head(name, lines):
    p=ROOT/name
    text=p.read_text(encoding='utf-8')
    assert text.count('</head>')==1, f'Unexpected head in {name}'
    for line in lines:
        if line not in text:
            text=text.replace('</head>',line+'\n</head>',1)
    p.write_text(text,encoding='utf-8')

COMMON=['<link rel="stylesheet" href="./atlas86-ui.css?v=86">','<script defer src="./atlas86-ui.js?v=86"></script>']
for name in ['atlas.html','atlas-online.html','atlas-vi.html','atlas81-hq.html']:
    insert_before_head(name,COMMON)

insert_before_head('atlas-sa.html',[
 '<link rel="stylesheet" href="./atlas86-ui.css?v=86">',
 '<script defer src="./atlas86-sa-enhance.js?v=86"></script>',
 '<script defer src="./atlas86-ui.js?v=86"></script>'
])
insert_before_head('atlas-cayo.html',[
 '<link rel="stylesheet" href="./atlas86-ui.css?v=86">',
 '<script defer src="./atlas86-cayo.js?v=86"></script>'
])
# One shared icon function: the map renderer and left legend now draw from the same category definitions.
engine=ROOT/'atlas.js';src=engine.read_text(encoding='utf-8')
needle='function atlas85CollectibleIcon(r){'
assert src.count(needle)==1, 'Atlas 8.5 map icon engine not found; refusing unsafe change'
replacement="""function atlas85CollectibleIcon(r){
 const unified=window.TeamJuraIcon86?.forRecord(r);
 if(unified)return unified;"""
if 'window.TeamJuraIcon86?.forRecord(r)' not in src:
    src=src.replace(needle,replacement,1)
engine.write_text(src,encoding='utf-8')
print('Atlas 8.6 integration applied: five pages and central map icon function.')
