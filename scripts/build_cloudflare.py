#!/usr/bin/env python3
"""Build a static Cloudflare Pages `public/` directory; no Node bundler needed.
Network-enabled CI can optionally update explicitly licensed GTADB landmark snapshots.
Never overwrites or touches people's browser-local progress; no account APIs exist.
"""
from __future__ import annotations
import argparse,shutil,subprocess,sys,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'public'
EXCLUDE={'.git','.github','.venv','node_modules','tests','tools','scripts','reference','optional','private-lab','atlas-lab-private','research-private','user-exports','public','__pycache__'}

def main():
    p=argparse.ArgumentParser();p.add_argument('--sync-licensed-data',action='store_true');args=p.parse_args()
    if args.sync_licensed_data:
        for script in ('sync_atlas98_gtadb.py','sync_gtadb_vi.py'):
            try:
                run=subprocess.run([sys.executable,str(ROOT/'scripts'/script)],cwd=ROOT,timeout=110,check=False,capture_output=True,text=True)
                if run.returncode:print('WARNING: '+script+' unavailable; existing data left unchanged',file=sys.stderr)
                else:print(run.stdout.strip()[-280:])
            except (OSError,subprocess.TimeoutExpired) as e:print('WARNING: '+script+' '+str(e),file=sys.stderr)
    if OUT.exists():shutil.rmtree(OUT)
    OUT.mkdir()
    copied=0
    for src in ROOT.rglob('*'):
        if not src.is_file():continue
        rel=src.relative_to(ROOT)
        if any(x in EXCLUDE for x in rel.parts):continue
        if src.suffix.lower() in {'.zip','.ps1','.pem','.key','.token'}:continue
        if src.name.startswith('.env'):continue
        if src.name in {'MANIFEST-SHA256.txt'}:continue
        dst=OUT/rel;dst.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(src,dst);copied+=1
    for f in ('index.html','atlas.html','atlas-online.html','atlas-vi.html','one-last-ride.html','film/assets/one-last-ride-motion-preview.mp4'):
        if not (OUT/f).is_file():raise RuntimeError('Missing published dependency: '+f)
    print(json.dumps({'publicFiles':copied,'output':str(OUT),'bytes':sum(f.stat().st_size for f in OUT.rglob('*') if f.is_file())}))

if __name__=='__main__':main()
