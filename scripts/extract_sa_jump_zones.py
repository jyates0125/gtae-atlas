#!/usr/bin/env python3
"""Extract numeric zones only from pinned SA reference save; never distribute the save."""
import json, math, struct, sys
from pathlib import Path
raw=Path(sys.argv[1]).read_bytes()
assert len(raw)==202752
assert struct.unpack_from('<I',raw,len(raw)-4)[0]==sum(raw[:-4])==14857859
at=160411
assert raw[at:at+5]==b'BLOCK' and struct.unpack_from('<I',raw,at+5)[0]==70
assert raw[at+9+70*68:at+14+70*68]==b'BLOCK'
rows=[]
for i in range(70):
    p=at+9+i*68
    a=[round(x,4) for x in struct.unpack_from('<12f',raw,p)]
    s,l=a[:6],a[6:]
    assert all(math.isfinite(x) and abs(x)<=3000 for x in a)
    assert all(z[j]<=z[j+3] for z in (s,l) for j in range(3))
    assert struct.unpack_from('<i',raw,p+60)[0]==500
    rows.append(dict(slot=i+1,startZone=s,landingZone=l))
assert len({tuple(p['startZone']) for p in rows})==70
print(json.dumps(rows,indent=2))
