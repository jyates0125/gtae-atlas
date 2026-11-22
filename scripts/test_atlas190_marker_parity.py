#!/usr/bin/env python3
"""Atlas 19.0: evidence-backed map and marker parity without invented coordinates."""
from pathlib import Path
import json, re

ROOT=Path(__file__).resolve().parents[1]
def read(path):
    return (ROOT/path).read_text(encoding='utf-8')

iv=read('atlas-iv.js')
ivhtml=read('atlas-iv.html')
sa=read('atlas85-sa.js')
saplan=read('atlas190-sa-route.js')
sacss=read('atlas190-sa-route.css')
sah=read('atlas-sa.html')
classic=read('atlas98-classic.js')
hub=read('map-hub.html')

birds=json.loads(read('data/atlas-iv-300-source-birds.json'))
assert birds['schema']==1 and birds['game']=='4' and birds['license']=='MIT'
assert birds['sourceCommit']=='de21b7df7ec8b10dfe5abe7290d894efbfc1bd11'
assert birds['count']==300
assert {k:len(v) for k,v in birds['sets'].items()}=={'iv':200,'tlad':50,'tbogt':50}
ids=set()
for scope,rows in birds['sets'].items():
    for r in rows:
        assert r['id'].startswith(scope+'-bird-') and r['edition']==scope
        assert r['id'] not in ids and all(isinstance(r[k],(int,float)) for k in ('x','y','z'))
        assert abs(r['x'])<10000 and abs(r['y'])<10000
        assert 'collectible' in r['tags']
        ids.add(r['id'])
assert len(ids)==300
gtadb=json.loads(read('data/gtadb-4-manifest.json'))
assert gtadb['license']=='CC BY 4.0' and gtadb['count']==2650
assert gtadb['mappedCount']==2648
# Never discard positioned entries whose upstream source left the title blank.
source_rows=json.loads(read('data/gtadb-4.json'))['records']
untitled=[key for key,row in source_rows.items() if isinstance(row,list) and isinstance(row[0],str) and not row[0].strip()]
assert len(untitled)==14 and len(source_rows)==2650
assert 'Unnamed community landmark (source ${id})' in iv
assert 'Source title unavailable' in iv
assert 'Math.ceil(visible.length/400)' not in iv,'Old stride-based data omission returned'
for token in ('hitTargets.push','const clustered=size>1','getComputedStyle' if False else 'j190-marker-status',
              "loadBirds()", "setScope(which)", "birdRecords={iv:[],tlad:[],tbogt:[]}",
              "sourceFile", "birdFound", "j190-iv-hide-found", "j190-iv-found"):
    assert token in iv,token
for token in ('j190-iv-scope','GTA IV · 200 Flying Rats','50 Seagulls','j190-iv-found',
              'j190-marker-status','pigeon-locator','MIT'):
    assert token in ivhtml,token
assert 'atlas-iv.js?v=210' in ivhtml and 'atlas-iv.css?v=200' in ivhtml
# New touch support must preserve accessible single-pointer, marker, wheel and keyboard behavior.
for token in ("const activePointers=new Map()", "activePointers.size>=2",
              "pinch.zoom+Math.log2(distance/pinch.distance)",
              "canvas.addEventListener('pointercancel'",
              "canvas.addEventListener('wheel'",
              "canvas.addEventListener('keydown'",
              "if(found.members.length===1){select(found.members[0],false);return}"):
    assert token in iv,token
assert "pinch with two fingers" in ivhtml.lower()
pack=json.loads(read('data/atlas-sa-150-sourced-pins.json'))
assert pack['schema']==1 and len(pack['records'])==150
assert pack['counts']=={'snapshots':50,'horseshoes':50,'oysters':50}
assert 'juraSaPoint' in sa and 'juraSaSet' in sa
assert "loadAtlasSourcePins" in sa and "team-jura-sa-v1" in sa
for token in ('getRoute:()=>lastRoute.map','sourceReady()', 'atlas-sa-150-sourced-pins.json',
              "state.skipCollected", "Map selection canceled", "Math.max(1,state.limit",
              'j190-sa-overlay', 'No required ending pin', 'TeamJuraSARoute'):
    assert token in saplan,token
assert 'j190-sa-line' in sacss and 'pointer-events:none' in sacss
assert 'atlas190-sa-route.js?v=190' in sah and 'atlas190-sa-route.css?v=190' in sah
assert 'j190-episode-collectibles' in hub
assert "atlas-iv.html?scope=" in classic
assert 'atlas98-classic.js?v=190' in hub
assert len(set(ids))==300
print('PASS Atlas 19.0: 2650 sourced IV landmarks (2648 positioned), 300 MIT GTA IV/episode birds, 150 SA pickups, scoped routes, markers and credits')

# Exact upstream comparison performed during Atlas 23.7 source audit.
for bundle, count, revision in ((pack,150,'77dcc3d65e86df7a3806d4e1607445aacfda1855'),(birds,300,'de21b7df7ec8b10dfe5abe7290d894efbfc1bd11')):
    audit=bundle['coordinateAudit']
    assert audit['matched']==count and audit['mismatched']==0 and audit['sourceCommit']==revision
    assert audit['gameplayVerified'] is False and audit['mapAlignmentVerified'] is False
    assert 'Permission is hereby granted' in bundle['coordinateSourceLicenseText']
    assert revision in bundle['sourceUrl'] and revision in bundle['licenseUrl']
print('PASS Atlas 23.7: pinned coordinate provenance and retained MIT notices (audit evidence, not gameplay certification)')

# New separate tag placement pack, leaving all previous SA source IDs untouched.
tags=json.loads(read('data/atlas-sa-100-tag-placements.json'))
assert len(tags['records'])==100 and tags['counts']=={'tags':100}
assert tags['directSourceMatches']==sum(p['directSourceChecked'] for p in tags['records'])==61
assert tags['transcriptionOnly']==39 and tags['gameplayVerified'] is False
assert len({(p['worldX'],p['worldY'],p['worldZ']) for p in tags['records']})==100
assert {p['slot'] for p in tags['records']}==set(range(1,101))
for p in tags['records']:
 assert p['set']=='tags' and abs(p['x']-(p['worldX']+3000))<.001 and abs(p['y']-(3000-p['worldY']))<.001
 assert p['sourceUrl'].startswith('https://dev.prineside.com/en/gtasa_samp_model_id/model/')
assert 'TeamJuraSATags' in sa and 'TeamJuraSATags' in saplan
print('PASS attributed 100 tag object positions; 61 direct export matches, 39 transcription-only')

jumps=json.loads(read('data/atlas-sa-70-jump-zones.json'))
assert jumps['sourceRevision']=='6611e3cf21422bdd530a38743c1d15178d5d5df2' and jumps['sourceValidation']['checksum']==14857859
assert jumps['counts']=={'jumps':70} and len(jumps['records'])==70 and jumps['gameplayVerified'] is False
assert {p['slot'] for p in jumps['records']}==set(range(1,71))
assert len({tuple(p['startZone']) for p in jumps['records']})==70
for p in jumps['records']:
 for zone in (p['startZone'],p['landingZone']):
  assert len(zone)==6 and all(-3000<=v<=3000 for v in zone)
  assert all(zone[i]<=zone[i+3] for i in range(3))
 assert all(abs((p['startZone'][i]+p['startZone'][i+3])/2-v)<.001 for i,v in enumerate((p['worldX'],p['worldY'],p['worldZ'])))
 assert abs(p['x']-p['worldX']-3000)<.001 and abs(p['y']+p['worldY']-3000)<.001
assert 'TeamJuraSAJumps' in sa and 'TeamJuraSAJumps' in saplan
print('PASS 320 SA source records across five sets; 70 bounded jump zones')

vc=json.loads(read('data/atlas-vc-51-source-points.json'))
assert vc['world']=='vc' and vc['license']=='Apache-2.0' and vc['sourceRevision']=='b06265e1bf37e2b1ed389c58c80679addfbc8f20'
assert vc['counts']=={'Stunt jumps':36,'Store robberies':15} and len(vc['records'])==51
assert vc['mapAlignment']=='source-transform-matched' and vc['gameplayVerified'] is False
import hashlib
image_bytes=(ROOT/'art/atlas128-vice-city-radar.png').read_bytes()
assert hashlib.sha1(f'blob {len(image_bytes)}\0'.encode()+image_bytes).hexdigest()==vc['projection']['gitBlobSha']=='7ae40595da5d5480c50f6a82c2b20557f1f7f6ae'
assert vc['projection']['sourceRevision']=='5756e398975ff2fa7dd9b818edda82b46ea4a6a0'
assert image_bytes[16:24]==bytes.fromhex('0000040000000400')
for point in vc['records']:
 assert 0<=point['imageX']<=100 and 0<=point['imageY']<=100
 assert abs(point['imageX']-(point['x']+2000)/40)<.000001 and abs(point['imageY']-(2000-point['y'])/40)<.000001
assert len({p['id'] for p in vc['records']})==len({(p['x'],p['y'],p['z']) for p in vc['records']})==51
for p in vc['records']:
 assert abs(p['sourceZ']+p['zAdjustment']-p['z'])<.00001 and p['sourceUrl']==vc['sourceUrl']
print('PASS Vice City 51 attributed world-coordinate records, no unsupported pixel calibration')

# Reviewed GTADB fallback source and offline recognition, same licensed publisher.
gtadb_audit=json.loads(read('data/atlas-gtadb-map-source-audit.json'))
assert gtadb_audit['sourceRevision']=='d406fea099e1df2bce42fd6b87eed04bce646629'
assert gtadb_audit['worlds']['4']['unchangedPathsAndBlobs']==936
assert gtadb_audit['worlds']['5']['unchangedPathsAndBlobs']==37640
assert 'yanis,18' in gtadb_audit['worlds']['6']['styles']
assert 'CC BY 4.0' in gtadb_audit['licenseText']
assert 'd406fea099e1df2bce42fd6b87eed04bce646629/maps/tiles/' in read('atlas.js')
assert 'd406fea099e1df2bce42fd6b87eed04bce646629' in read('atlas-sw.js')
assert './data/atlas-sa-70-jump-zones.json' in read('atlas-sw.js')
print('PASS reviewed GTADB source provenance and immutable fallback configuration')

vcde=json.loads(read('data/atlas-vc-de-171-source-points.json'))
assert vcde['world']=='vc' and vcde['edition']=='definitive' and vcde['license']=='ISC'
assert vcde['counts']=={'Hidden packages':100,'Rampages':35,'Jump approaches':36}
assert len(vcde['records'])==len({p['id'] for p in vcde['records']})==171
assert vcde['mapAlignment']=='edition-unverified' and vcde['gameplayVerified'] is False
assert all(-2000<=p['x']<=2000 and -2000<=p['y']<=2000 and 'imageX' not in p for p in vcde['records'])
print('PASS Vice City DE separate reference source, 171 rows')

iii=json.loads(read('data/atlas-iii-160-source-points.json'))
assert iii['world']=='iii' and iii['sourceRevision']=='aa120220618c4c1314d319bc6210071437d14662' and iii['gameplayVerified'] is False
assert iii['counts']=={'Hidden packages':100,'Rampages':40,'Unique stunt jumps':20}
assert len(iii['records'])==len({p['id'] for p in iii['records']})==160
assert len({p['slot'] for p in iii['records'] if p['category']=='Rampages'})==20
assert sum(p['z'] is None for p in iii['records'])==14
assert all(abs(p['imageX']-(p['x']+2000)/40)<.000001 and abs(p['imageY']-(2000-p['y'])/40)<.000001 for p in iii['records'])
print('PASS GTA III 160 numeric references, 140 objectives, unknown Z preserved')

for w,n in [('lcs',52),('vcs',51)]:
 p=json.loads(read('data/atlas-'+w+'-psp-reference.json'))
 assert p['world']==w and p['license']=='MIT' and p['sourceRevision']=='eb962c5bff9c1d94e6cb48077885fde0f5d28317'
 assert p['mapAlignment']=='unverified' and p['gameplayVerified'] is False
 assert len(p['records'])==len({r['id'] for r in p['records']})==n
 assert all(r['id'].startswith(w+'-ref-') and 'imageX' not in r for r in p['records'])
print('PASS Stories edition-specific reference sources; no invented calibration')
