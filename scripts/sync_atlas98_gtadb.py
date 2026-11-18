#!/usr/bin/env python3
"""Mirror CC BY 4.0 GTADB.ORG landmark records for GTA IV and V.

This mirrors LANDMARK RESEARCH (not every collectible or vehicle spawn).
A separate GTA VI mirror is already maintained by the existing Atlas 9.7 pipeline.
Only GTADB.ORG's explicitly licensed data is mirrored. Attribution required.
Run in a network-enabled environment: python scripts/sync_atlas98_gtadb.py
Run offline fixture test: python scripts/sync_atlas98_gtadb.py --fixture-dir docs/test-fixtures --output /tmp/atlas98-sync
"""
from __future__ import annotations
import argparse, datetime as dt, hashlib, json, pathlib, urllib.request

ROOT=pathlib.Path(__file__).resolve().parent.parent
BASE='https://raw.githubusercontent.com/rolux/gtadb.org/main/map/data'
ATTRIBUTION='GTADB.ORG Landmarks Data (CC BY 4.0) — https://map.gtadb.org/'
LICENSE='https://creativecommons.org/licenses/by/4.0/'

def normalize(game: str, raw: bytes) -> tuple[dict,dict]:
    if len(raw)>14_000_000: raise ValueError('Source too large')
    parsed=json.loads(raw)
    if not isinstance(parsed,dict) or len(parsed)<1 or len(parsed)>80_000: raise ValueError('Invalid landmark dataset')
    mapped=0
    for key,record in parsed.items():
        if not isinstance(key,str) or not isinstance(record,list) or len(record)<8 or not isinstance(record[0],str):
            raise ValueError('Invalid row in '+game)
        point=record[1]
        if isinstance(point,list) and len(point)==2 and all(isinstance(n,(float,int)) and not isinstance(n,bool) for n in point):mapped+=1
    now=dt.datetime.now(dt.timezone.utc).isoformat()
    sha=hashlib.sha256(raw).hexdigest()
    doc={'schema':2,'game':game,'status':'community-sourced/landmark-research','source':'GTADB.ORG and contributors','sourceUrl':f'https://github.com/rolux/gtadb.org/tree/main/map/data/{game}', 'license':'CC BY 4.0','licenseUrl':LICENSE,'attribution':ATTRIBUTION,'changes':'Mirrored unchanged landmark row arrays, wrapped in original Team Jura metadata; not a verified collectible spawn dataset.','sourceUpdated':now,'sourceHash':sha,'count':len(parsed),'mappedCount':mapped,'searchOnlyCount':len(parsed)-mapped,'records':parsed}
    manifest={key:doc[key] for key in ('schema','game','status','source','sourceUrl','license','licenseUrl','attribution','sourceUpdated','sourceHash','count','mappedCount','searchOnlyCount')}
    return doc,manifest

def run(argv=None):
    ap=argparse.ArgumentParser();ap.add_argument('--fixture-dir',type=pathlib.Path);ap.add_argument('--output',type=pathlib.Path,default=ROOT/'data');opts=ap.parse_args(argv)
    opts.output.mkdir(parents=True,exist_ok=True)
    for game in ('4','5'):
        if opts.fixture_dir:
            source=(opts.fixture_dir/f'{game}.json').read_bytes()
        else:
            req=urllib.request.Request(f'{BASE}/{game}/landmarks.json',headers={'User-Agent':'Team-Jura-Atlas-Research-Mirror/9.8'})
            with urllib.request.urlopen(req,timeout=30) as reply:source=reply.read(14_000_001)
        doc,manifest=normalize(game,source)
        # Atomic rename: no partially written source data if network or validation fails.
        for filename,obj in ((f'gtadb-{game}.json',doc),(f'gtadb-{game}-manifest.json',manifest)):
            dest=opts.output/filename;tmp=dest.with_suffix('.tmp');tmp.write_text(json.dumps(obj,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf-8');tmp.replace(dest)
        print(f'GTA {game}: {manifest["count"]} landmarks, {manifest["mappedCount"]} with map X/Y; CC BY 4.0')
if __name__=='__main__':run()
