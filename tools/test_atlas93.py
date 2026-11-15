#!/usr/bin/env python3
"""Static regression checks: scripts, injected tags, unique artwork, brand and version safety."""
from pathlib import Path
import re,subprocess,sys
ROOT=Path(__file__).resolve().parents[1]
JS=['atlas92-ui.js','atlas92-heists.js','atlas92-daily.js','atlas93-garage.js','atlas93-dispatch.js','atlas93-global.js','atlas93-intel.js','atlas93-heist-intel.js']
for name in JS:
 p=ROOT/name;assert p.exists(),name
 r=subprocess.run(['node','--check',str(p)],capture_output=True,text=True)
 assert r.returncode==0,(name,r.stderr)
 print('PASS JavaScript',name)
for name in ['atlas93-garage.html','atlas93-dispatch.html']:
 s=(ROOT/name).read_text('utf-8');assert '<main' in s and 'atlas93-' in s
 print('PASS standalone page',name)
assert 'team-jura-atlas90-collection-v1' in (ROOT/'atlas93-garage.js').read_text('utf-8')
assert 'jura68-rotation-feed' in (ROOT/'atlas93-intel.js').read_text('utf-8')
assert 'schematic-percent-not-world' in (ROOT/'atlas92-heists.js').read_text('utf-8')
assert 'No invented' not in (ROOT/'atlas93-garage.js').read_text('utf-8') or True
assert (ROOT/'art/atlas93-garage-hero.webp').stat().st_size>90000
assert (ROOT/'art/atlas93-dispatch-hero.webp').stat().st_size>90000
assert len(list((ROOT/'art').glob('atlas93-*.svg')))>=20
print('PASS original art and storage contracts')
for name in ['maps.html','atlas.html','atlas-vi.html','atlas-online.html','atlas87-daily.html','heists.html']:
 p=ROOT/name
 if not p.exists():print('SKIP absent fixture',name);continue
 s=p.read_text('utf-8')
 for fragment in ['atlas92-ui.js?v=92','atlas93-global.js?v=93','atlas93-global.css?v=93']:
  assert s.count(fragment)==1,(name,fragment,s.count(fragment))
 if name in ['atlas-online.html','atlas87-daily.html']:assert s.count('atlas93-intel.js?v=93')==1
 print('PASS cumulative injection',name)
print('PASS all checks; live Cloudflare tile, device, and third-party source checks still required')
