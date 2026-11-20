#!/usr/bin/env python3
from pathlib import Path
import sys,subprocess
root=Path(__file__).resolve().parent.parent
pages=['maps.html','atlas.html','atlas-online.html','atlas-vi.html','atlas87-daily.html','heists.html']
for p in pages:
    path=root/p
    if not path.exists():
        print('SKIP missing',p);continue
    s=path.read_text('utf-8')
    assert s.count('atlas92-ui.js?v=92')==1,(p,'missing or duplicate UI')
    assert s.count('atlas92-style.css?v=92')==1,(p,'missing or duplicate CSS')
    print('PASS injection',p)
for f in ['atlas92-ui.js','atlas92-heists.js','atlas92-daily.js']:
    p=subprocess.run(['node','--check',str(root/f)],capture_output=True,text=True)
    assert p.returncode==0,(f,p.stderr)
    print('PASS JS syntax',f)
assert 'document.querySelector' in (root/'atlas92-ui.js').read_text('utf-8')
assert 'coordinateSystem' in (root/'atlas92-heists.js').read_text('utf-8')
assert 'no live location feed' in (root/'atlas92-daily.js').read_text('utf-8')
assert (root/'art/atlas92-map-directory.webp').stat().st_size>50000
print('PASS source guards and artwork')
print('NOTE: real browser/device and all map tiles still require Cloudflare preview QA')
