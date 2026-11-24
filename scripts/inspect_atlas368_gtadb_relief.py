#!/usr/bin/env python3
"""Inspect GTADB's pinned, repository-published relief image. No live GTADB media.
This is a source examination, NOT a calibrated elevation export.
"""
import hashlib,json,urllib.request
from collections import Counter
from pathlib import Path
from io import BytesIO
from PIL import Image

REV='d406fea099e1df2bce42fd6b87eed04bce646629'
SOURCE='https://raw.githubusercontent.com/rolux/gtadb.org/'+REV+'/files/GTA6Relief.png'
BLOB='58636e04eb58215d0a9c21e2c1e689da5c25289f'
with urllib.request.urlopen(SOURCE,timeout=35) as response:
    raw=response.read(2_000_000)
assert len(raw)==116535,'unexpected upstream length'
assert hashlib.sha1(b'blob '+str(len(raw)).encode()+b'\0'+raw).hexdigest()==BLOB,'source revision mismatch'
im=Image.open(BytesIO(raw))
im.load()
rgba=im.convert('RGBA')
colors=Counter(rgba.getdata())
w,h=rgba.size
report={'source':SOURCE,'gitBlob':BLOB,'sha256':hashlib.sha256(raw).hexdigest(),
        'size':[w,h],'format':im.format,'mode':im.mode,'metadata':{k:str(v)[:300] for k,v in im.info.items()},
        'topColors':colors.most_common(20),'uniqueColors':len(colors),
        'transparent':sum(n for c,n in colors.items() if c[3]==0),
        'opaque':sum(n for c,n in colors.items() if c[3]==255),
        'grayscale':sum(n for c,n in colors.items() if c[0]==c[1]==c[2]),
        'corners':[rgba.getpixel(p) for p in [(0,0),(w-1,0),(0,h-1),(w-1,h-1)]],
        'center':rgba.getpixel((w//2,h//2))}
print('ATLAS368_SOURCE_REPORT '+json.dumps(report,default=str,separators=(',',':')))
preview=rgba.resize((64,40),Image.Resampling.BOX)
palette=' .:-=+*#%@'
for y in range(40):
    row=''
    for x in range(64):
        r,g,b,a=preview.getpixel((x,y))
        row+=(' ' if a<24 else palette[min(9,int((r*.2126+g*.7152+b*.0722)*10/256))])
    print('ATLAS368_LUMA '+row)
# Save original bytes and a small RGB data summary to the review artifact only.
out=Path('qa-evidence/atlas368');out.mkdir(parents=True,exist_ok=True)
(out/'GTA6Relief.png').write_bytes(raw)
(out/'source-inspection.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
preview.save(out/'relief-preview.png')
print('ATLAS368_SOURCE_INSPECTION_COMPLETE (not a calibrated terrain file)')
