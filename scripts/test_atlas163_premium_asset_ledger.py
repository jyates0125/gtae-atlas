#!/usr/bin/env python3
"""16.3: owner-approved premium raster inventory and non-regression gate.

Checks intrinsic dimensions, RIFF completeness, unique subjects and connected
page references. This is NOT a substitute for visual, provenance or map QA.
"""
import hashlib
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
DATA=json.loads((ROOT/'docs/ATLAS151-VISUAL-ACCEPTANCE.json').read_text())
WORLDS=DATA['approved_world_covers']
HEISTS=('fleeca','prison-break','humane-labs','series-a','pacific-standard',
 'doomsday-act-1','doomsday-act-2','doomsday-act-3','diamond-casino',
 'cayo-perico','cluckin-bell','salvage-yard','auto-shop','agency-vip','kortz-center')
SUBJECTS=('wildlife','collectibles','weapons','vehicles','vehicles6')
MEDIA={**{'world:'+k:v for k,v in WORLDS.items()},
 **{'heist:'+k:f'art/jura159-heist-{k}.webp' for k in HEISTS},
 'heist-hq':'art/jura159-heist-hq.webp',
 **{'subject:'+k:f'art/jura161-{k}.webp' for k in SUBJECTS}}

def dimensions(content,path):
 assert len(content)>=32 and content[:4]==b'RIFF' and content[8:12]==b'WEBP',path
 assert int.from_bytes(content[4:8],'little')+8==len(content),f'{path} incomplete RIFF'
 fourcc=content[12:16]
 length=int.from_bytes(content[16:20],'little')
 assert length>0 and 20+length<=len(content),f'{path} corrupt WebP chunk'
 if fourcc==b'VP8 ':
  assert content[23:26]==bytes.fromhex('9d012a'),f'{path} bad VP8 frame signature'
  width=int.from_bytes(content[26:28],'little')&0x3fff
  height=int.from_bytes(content[28:30],'little')&0x3fff
 elif fourcc==b'VP8L':
  assert content[20]==0x2f,f'{path} bad VP8L signature'
  width=1+content[21]+((content[22]&0x3f)<<8)
  height=1+(content[22]>>6)+(content[23]<<2)+((content[24]&15)<<10)
 elif fourcc==b'VP8X':
  width=1+int.from_bytes(content[24:27],'little')
  height=1+int.from_bytes(content[27:30],'little')
 else: raise AssertionError(f'{path} invalid WebP chunk {fourcc!r}')
 assert width>=250 and height>=160,f'{path} undersized {width}×{height}'
 return width,height

assert len(WORLDS)==13 and len(HEISTS)==15 and len(SUBJECTS)==5
assert len(MEDIA)==34
world_js=(ROOT/'atlas98-worlds.js').read_text()
heist_page=(ROOT/'heists.html').read_text()
heist_css=(ROOT/'atlas120-heist-worlds.css').read_text()
subject_css=(ROOT/'atlas162-subject-heroes.css').read_text()
for key,path in WORLDS.items():
 assert path.startswith('art/') and path.endswith('.webp') and './'+path in world_js,key
for key in HEISTS:
 path=MEDIA['heist:'+key]
 assert './'+path in (ROOT/f'heist-{key}.html').read_text(),key
 assert './'+path in heist_page and './'+path in heist_css,key
for key in SUBJECTS:
 assert './'+MEDIA['subject:'+key] in subject_css,key

checksums=set()
inventory=[]
for role,path in MEDIA.items():
 data=(ROOT/path).read_bytes()
 assert len(data)>25000,path
 width,height=dimensions(data,path)
 sha=hashlib.sha256(data).hexdigest()
 assert sha not in checksums,f'Repeated premium art for {role}: {path}'
 checksums.add(sha)
 inventory.append({'role':role,'path':path,'size':len(data),'dimensions':[width,height],'sha256':sha})
assert DATA['status']=='APPROVED' and DATA['approved_by_owner'] is True
report=ROOT/'qa-evidence'/'atlas163-premium-inventory.json'
report.parent.mkdir(parents=True,exist_ok=True)
report.write_text(json.dumps({'schema':'atlas163-premium-inventory-v1','count':len(inventory),
 'caveat':'Asset integrity is not proof of verified gameplay maps, image rights or full visual parity',
 'images':inventory},indent=2)+'\n')
print(f'Atlas 16.3: {len(inventory)} distinct premium WebPs and source/page references verified')
