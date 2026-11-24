#!/usr/bin/env python3
"""Build a LOW-RESOLUTION, explicitly approximate Leonida relief from
GTADB's creator's published triangulated numerical observations and GTADB's
licensed YANIS v18 map tile palette. Not the upstream dense DEM, nor game truth.

The runtime receives only the derived compact raster; all network reads are
pinned GitHub repository files, never live GTADB services. Source bytes are
verified against Git object hashes. No photos/cameras/images are redistributed.
"""
from __future__ import annotations
import argparse, ast, base64, hashlib, json, re, urllib.request
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor
from io import BytesIO
from pathlib import Path
import numpy as np
from PIL import Image
from scipy.ndimage import label, uniform_filter, distance_transform_edt
from scipy.spatial import cKDTree

GTADB='d406fea099e1df2bce42fd6b87eed04bce646629'
TOOLKIT='73b847330b6741b0214515178829d0335249df07'
POINT_BLOB='bd3f7f50e8548a74ff8394011693d425fedf8b45'
TILE_SHA=[
 ['f36efc99ff9bbb76a70ce20966e66d5385cbe798','9bb773d9b2aa68c190695f7d5f2da44e05244ec3','e4848ca4e28cfe2571fd24e43080641b0def0a23','d3901cfcd8fcf6a16cce36ad12a64404ff5e844a'],
 ['16e35d91768a07fa0c2ebbbd46c8a33fe6a17de7','3ae3ee734ab5064fd1ec2bf0de76f6d5a7ef1234','8ac7f7cfe7b083c5c82629cc3b62087c819db45f','2923a504f318e784c4644de28e0b843a419a362a'],
 ['24e53464cb7bec68be1a7dfd55b45300b046c2c9','36cee4d6183f98c29e65e5d0d0ebee29bba0032b','7a98cca6c3f3bb75b580d1548fddfef29f83e152','418ddbcdcb376107f759d30afd17aa90687fa930'],
 ['a49ce9699802e8de97b81a92d90bb179cc886d21','13ea5a40918b5a10626d6a92747599c32e104c43','21b506b3cec288cb559e65f4a8393ee21c875533','4d2c780fb8d417869cb4bac060eb20b4bff0170e']]
SCALE=.083188297074
ZERO=(1108.532445611,938.090772693)
W,H=96,110
BOUNDS=(-ZERO[0]/SCALE,(ZERO[1]-1747)/SCALE,(1535-ZERO[0])/SCALE,ZERO[1]/SCALE)
# Explicitly identifiable ground or terrain features ONLY. No building tops.
GROUND=re.compile(r"^(?:Ambrosia (?:Airfield|Main St|Road)|Blimp Road|Dirt Road|Hill Road|Road(?:\s|\()|Grass \(MIA\)|BB Hill$|Easy Hill$|Mount Mountain$|Mount Waffles$|Uncle Jack's Valley$|Waffles Ridge \(C\)$)",re.I)
WATER=re.compile(r"^(?:Bay \(|Beach \(|East Coast \(|Blimp Bay$|Blimp Key \(|(?:Anchor|Biscayne|Di Lido|Fisher|Flagler Memorial|Rivo Alto|Vake) Island \(|Island [A-Z] \(|(?:East Key|Key Lento|PGH Barrier Island|PGH Island [AB]|Picnic Island [A-Z]) \(|(?:Catalan Key|Hamlet|Virginia Key) Coastline \(|Grassrivers River Mouth \(|Vice River \()",re.I)
LAKE=re.compile(r"^Lake (?:Leonida|near VCIA) \(",re.I)
# First tuple of the source camera record is player coordinates, not the camera.
# Retain only explicit ground-context observations; still a proxy, not survey data.
PLAYER=re.compile(r"\] (?:Sidewalk|Intersection|Tarmac|Parking Lot|Highway|Gas Station|Car Wash|Street|Auto Shop|Loading Zone|Police Chase)\b",re.I)

def fetch(repo,rev,path,expected):
    url=f'https://raw.githubusercontent.com/{repo}/{rev}/{path}'
    with urllib.request.urlopen(url,timeout=45) as r: raw=r.read(2_000_000)
    sha=hashlib.sha1(b'blob '+str(len(raw)).encode()+b'\0'+raw).hexdigest()
    if sha!=expected: raise ValueError(f'pinned source mismatch: {path}')
    return raw

def literals(tree,name):
    for stmt in tree.body:
        if isinstance(stmt,ast.Assign) and isinstance(stmt.value,ast.Dict):
            if any(isinstance(t,ast.Name) and t.id==name for t in stmt.targets):
                return ast.literal_eval(stmt.value)
    raise ValueError(f'missing source table: {name}')

def points(raw):
    tree=ast.parse(raw.decode('utf-8'))
    landmarks=literals(tree,'landmarks')
    cameras=literals(tree,'cameras')
    anchors=[]
    x0,y0,x1,y1=BOUNDS
    def add(name,value,kind):
        if not isinstance(value,(tuple,list)) or len(value)!=3: return
        if not all(isinstance(v,(float,int)) and np.isfinite(v) for v in value): return
        x,y,z=map(float,value)
        if x0<=x<=x1 and y0<=y<=y1 and -.5<=z<=405:
            anchors.append({'name':name,'x':x,'y':y,'z':z,'kind':kind})
    for name,value in landmarks.items():
        if not isinstance(value,(tuple,list)) or len(value)!=3: continue
        if GROUND.search(name): add(name,value,'ground-landmark')
        elif WATER.search(name) and value[2]==0: add(name,value,'coastline-waterline')
        elif LAKE.search(name) and 0<=value[2]<=30: add(name,value,'inland-water-edge')
    for name,row in cameras.items():
        if row and PLAYER.search(name) and row[0] is not None and 0<=row[0][2]<=100:
            add(name,row[0],'player-ground-proxy')
    return anchors,len(landmarks)

def coastal_mask():
    # Source's actual z=0 matrix: four 256px tiles per side, 32768 world units.
    # The published YANIS v18 texture uses RGB 44,103,164 as its ocean background.
    mosaic=np.zeros((1024,1024,3),np.uint8)
    def tile(pair):
        y,x=pair
        name=f'maps/tiles/6/yanis,18/0/0,{y},{x}.jpg'
        raw=fetch('rolux/gtadb.org',GTADB,name,TILE_SHA[y][x])
        im=Image.open(BytesIO(raw)).convert('RGB')
        if im.size!=(256,256): raise ValueError('unexpected source tile dimensions')
        return y,x,np.asarray(im)
    with ThreadPoolExecutor(max_workers=4) as pool:
        for y,x,arr in pool.map(tile,[(y,x) for y in range(4) for x in range(4)]):
            mosaic[y*256:(y+1)*256,x*256:(x+1)*256]=arr
    rgb=mosaic.astype(np.float32)
    d=np.sqrt(np.sum((rgb-np.array([44,103,164]))**2,axis=2))
    blue=(rgb[:,:,2]>rgb[:,:,1]+31)&(rgb[:,:,1]>rgb[:,:,0]+24)&(rgb[:,:,2]>rgb[:,:,0]+65)
    water=uniform_filter(((d<=30)|blue).astype(np.float32),size=3)>.60
    # Only the connected ocean is assigned sea-level. An interior blue lake
    # is not automatically assumed to be at sea level.
    groups,_=label(water)
    exterior=np.unique(np.concatenate([groups[0],groups[-1],groups[:,0],groups[:,-1]]))
    exterior=exterior[exterior!=0]
    return np.isin(groups,exterior)

def interp(coords,z,query,k=8):
    d,ix=cKDTree(coords).query(query,k=min(k,len(coords)))
    if d.ndim==1: d=d[:,None];ix=ix[:,None]
    weights=1/(d*d+85**2)
    predicted=(weights*z[ix]).sum(axis=1)/weights.sum(axis=1)
    return predicted,d[:,0]

def build(raw,sea):
    anchors,nlandmarks=points(raw)
    assert len(anchors)>=100,'insufficient source observations'
    # Declutter dense road/coast clusters. Equalize spatial samples per 125m
    # cell, but retain distinct water and ground types for coverage metrics.
    buckets=defaultdict(list)
    for p in anchors:
        t='water' if p['kind']=='coastline-waterline' else 'ground'
        buckets[(int(np.floor(p['x']/125)),int(np.floor(p['y']/125)),t)].append((p['x'],p['y'],p['z']))
    coarse=np.array([np.median(buckets[k],axis=0) for k in sorted(buckets)],dtype=np.float64)
    ground=np.array([np.median(buckets[k],axis=0) for k in sorted(buckets) if k[2]=='ground'],dtype=np.float64)
    assert len(ground)>=35 and coarse[:,2].max()>100
    x0,y0,x1,y1=BOUNDS
    X,Y=np.meshgrid(np.linspace(x0,x1,W),np.linspace(y1,y0,H))
    query=np.column_stack((X.ravel(),Y.ravel()))
    px=np.clip(np.rint((X+16384)/32-.5).astype(int),0,1023)
    py=np.clip(np.rint((16384-Y)/32-.5).astype(int),0,1023)
    ocean=sea[py,px].ravel()
    prediction,_=interp(coarse[:,:2],coarse[:,2],query)
    near=cKDTree(ground[:,:2]).query(query)[0]
    # Distant, weakly evidenced cells smoothly flatten instead of creating
    # speculative mountains. Coast mask prevents interpolating hills offshore.
    weight=np.clip((3500-near)/1700,0,1)
    weight=weight*weight*(3-2*weight)
    prediction=np.maximum(0,prediction)*weight
    # Taper the coastal edge so a 200m raster cell does not form a cliff.
    land=(~ocean).reshape(H,W)
    coastdist=distance_transform_edt(land).ravel()
    prediction*=np.clip(coastdist/1.65,0,1)
    prediction[ocean]=0
    support=np.where(ocean,0,np.where(near<=650,3,np.where(near<=1800,2,1))).astype(np.uint8)
    heights=np.rint(prediction*10).clip(0,4050).astype('<u2')
    assert np.max(heights)>500 and np.count_nonzero(ocean)>W*H*.10
    # Leave-one-spatial-bin-out interpolation residual: same source, NOT
    # independent game validation. Report, don't hide sparse high-relief error.
    loo=[]
    for i,row in enumerate(ground):
        mask=np.arange(len(ground))!=i
        fit,_=interp(ground[mask,:2],ground[mask,2],row[None,:2])
        loo.append(float(abs(fit[0]-row[2])))
    kinds={k:sum(p['kind']==k for p in anchors) for k in sorted(set(p['kind'] for p in anchors))}
    stats={'sourceLandmarks':nlandmarks,'anchors':len(anchors),'kinds':kinds,
           'spatialBins':len(coarse),'groundBins':len(ground),
           'coverageCells':{str(i):int(np.sum(support==i)) for i in range(4)},
           'renderedMaxApproxM':float(heights.max()/10),
           'sameSourceHoldoutMedianM':round(float(np.median(loo)),2),
           'sameSourceHoldoutP90M':round(float(np.percentile(loo,90)),2),
           'sameSourceHoldoutMaxM':round(float(np.max(loo)),2)}
    source={'map':'GTADB.org and contributors; YANIS v18 CC BY 4.0',
        'mapRevision':GTADB,'mapLicense':'https://github.com/rolux/gtadb.org/blob/'+GTADB+'/LICENSE-DATA',
        'pointSource':'rolux / gtamaplib numerical mapping observations',
        'pointRevision':TOOLKIT,'pointBlob':POINT_BLOB,
        'pointLicense':'https://github.com/rolux/gtamaplib/blob/'+TOOLKIT+'/LICENSE',
        'tileBlobs':TILE_SHA}
    return {'schema':'team-jura-approximate-relief-v1','game':6,
        'coordinateSystem':'gtadb-game-xy','bounds':[float(x) for x in BOUNDS],
        'grid':{'width':W,'height':H,'heightDmLE':base64.b64encode(heights.tobytes()).decode(),
          'supportU8':base64.b64encode(support.tobytes()).decode()},
        'source':source,'stats':stats,'status':'approximate-community-reconstruction-unverified',
        'method':'125m spatial median; inverse-distance 8-neighbor interpolation; GTADB YANIS palette-derived connected ocean mask; confidence fade; no invented structures, no exact DEM.'}

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--out',default='qa-evidence/atlas368/approx-terrain.json')
    parser.add_argument('--emit',action='store_true',help='emit compact JSON chunks for durable review')
    args=parser.parse_args()
    raw=fetch('rolux/gtamaplib',TOOLKIT,'gtamapdata.py',POINT_BLOB)
    result=build(raw,coastal_mask())
    out=Path(args.out);out.parent.mkdir(parents=True,exist_ok=True)
    payload=json.dumps(result,separators=(',',':'),ensure_ascii=True)
    out.write_text(payload+'\n',encoding='utf-8')
    print('ATLAS368_APPROX_STATS '+json.dumps(result['stats'],separators=(',',':')))
    print('ATLAS368_APPROX_SHA256 '+hashlib.sha256(payload.encode()).hexdigest())
    if args.emit:
        for i in range(0,len(payload),3000):
            print('ATLAS368_APPROX_CHUNK %04d %s'%(i//3000,payload[i:i+3000]))
    print('ATLAS368_APPROX_COMPLETE - community interpolation, not measured game elevation')
if __name__=='__main__': main()
