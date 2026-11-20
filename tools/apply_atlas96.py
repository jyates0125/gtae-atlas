#!/usr/bin/env python3
"""Cumulative Atlas 9.4 + 9.5 + 9.6 integration for the development branch.

One safe workflow: existing core code is patched only at validated exact anchors.
No map asset, route data, vehicle save state, or brand reference is overwritten.
"""
from __future__ import annotations
from pathlib import Path
import argparse
import sys
from apply_atlas95 import apply as apply_95, inject

ROOT = Path(__file__).resolve().parents[1]
REQUIRED = ('atlas96-cluster-core.js', 'atlas96-garage.js', 'atlas96-garage.css',
            'atlas93-garage.html', 'atlas90-vehicles5.html', 'atlas90-gallery.js', 'atlas96-catalog.css',
            'atlas-feature-audit.html', 'atlas-research.html', 'atlas-research.js')
SCRIPT_TAG = '<script defer src="./atlas96-cluster-core.js?v=96"></script>'
VEHICLE_LINK = """if(r.kind==='vehicles5'&&/^[a-z0-9_]{1,65}$/.test(r.archive||'')){
 const park=el('a','j96-park-link','▣ Park in My Garage');
 park.href='./atlas93-garage.html?addModel='+encodeURIComponent(r.archive);
 actions.append(park);
} """
DRAW_REPLACEMENT = """const markers=totalVisible.filter(r=>r.positioned);
 const clust=window.TeamJuraClusters96?.group(markers,r=>screen(r.x,r.y),{
   width:w,height:h,cell:camera.z<1.5?52:camera.z<3?44:36,active:camera.z<4.3
 })||markers.map(r=>({count:1,records:[r],pixel:screen(r.x,r.y),world:{x:r.x,y:r.y}}));
 for(const bucket of clust){const p=bucket.pixel;if(p.x<-20||p.x>w+20||p.y<-20||p.y>h+20)continue;
  if(bucket.count>1){
   const radius=Math.max(12,Math.min(25,11+Math.log2(bucket.count)*2.3));
   ctx.beginPath();ctx.arc(p.x,p.y,radius,0,Math.PI*2);
   ctx.fillStyle='#4f246a';ctx.fill();ctx.strokeStyle='#ffc475';ctx.lineWidth=2.3;ctx.stroke();
   ctx.fillStyle='#fff3cd';ctx.font='bold '+(bucket.count>99?'11':'12')+'px system-ui';
   ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(bucket.count),p.x,p.y);
   hits.push({x:p.x,y:p.y,cluster:bucket.records,world:bucket.world});continue;
  }
  const r=bucket.records[0],c=COLORS[r.family]||COLORS.other;
  ctx.beginPath();ctx.arc(p.x,p.y,r===selected?8:5,0,Math.PI*2);
  ctx.fillStyle=c;ctx.fill();ctx.strokeStyle=r===selected?'#fff':'#142536';ctx.lineWidth=r===selected?3:1.5;ctx.stroke();
  if(camera.z>=2.5){ctx.fillStyle='#122333';ctx.font='bold 9px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(ICONS[r.group]||'✦',p.x,p.y+.5)}
  hits.push({x:p.x,y:p.y,r});
 }
 """
CLICK_SOURCE='if(d<dist){dist=d;nearest=hit.r}}if(nearest)select(nearest)'
CLICK_UPDATE="if(d<dist){dist=d;nearest=hit}}if(nearest?.cluster){camera.x=nearest.world.x;camera.y=nearest.world.y;camera.z=Math.min(5.2,camera.z+1.15);draw()}else if(nearest?.r)select(nearest.r)"
KEYS="""
// Accessible map keyboard handling: Arrow keys pan; +/- zoom; the accessible list selects individual locations.
canvas.addEventListener('keydown',e=>{const scaleStep=64/scale();let changed=true;
 switch(e.key){case'ArrowLeft':camera.x-=scaleStep;break;case'ArrowRight':camera.x+=scaleStep;break;
 case'ArrowUp':camera.y+=scaleStep;break;case'ArrowDown':camera.y-=scaleStep;break;
 case'+':case'=':camera.z=Math.min(5.2,camera.z+.4);break;
 case'-':case'_':camera.z=Math.max(0,camera.z-.4);break;default:changed=false;}
 if(changed){e.preventDefault();draw()}
});
"""


def patch_cluster_engine(js):
    if 'TeamJuraClusters96?.group(' not in js:
        head='const markers=totalVisible.filter(r=>r.positioned);for(const r of markers){'
        tail='hits.push({x:p.x,y:p.y,r})}'
        if js.count(head)!=1 or js.count(tail)!=1:
            raise ValueError('Research draw function changed; refuse unreviewed clustering patch')
        start=js.index(head);end=js.index(tail,start)+len(tail)
        js=js[:start]+DRAW_REPLACEMENT+js[end:]
    if CLICK_UPDATE not in js:
        if js.count(CLICK_SOURCE)!=1:
            raise ValueError('Research hit testing changed; refuse unreviewed cluster-click patch')
        js=js.replace(CLICK_SOURCE,CLICK_UPDATE,1)
    if 'Accessible map keyboard handling: Arrow keys pan' not in js:
        target="window.addEventListener('resize',size);size();load();})();"
        if js.count(target)!=1:raise ValueError('Research keyboard event anchor changed')
        js=js.replace(target,KEYS+'\n'+target,1)
    return js


def patch_gallery(js):
    if 'j96-park-link' in js:return js
    expected='actions.append(own,wish,cmp);body.append(actions);'
    if js.count(expected)!=1:raise ValueError('Gallery card actions changed; manual review required')
    return js.replace(expected,'actions.append(own,wish,cmp);'+VEHICLE_LINK+'body.append(actions);',1)


def patch_audit(html):
    marker='data-team-jura-atlas96-audit'
    if marker in html:return html
    block='''<section data-team-jura-atlas96-audit="true" aria-label="Atlas 9.6 release gate" style="margin:16px auto;max-width:1100px;padding:18px;border-radius:15px;border:1px solid #b16aca;background:linear-gradient(110deg,#381747,#22152f);color:#f9e8ff">
 <p style="color:#ffd183;font-weight:900;letter-spacing:.12em;font-size:11px">ELARIO STUDIOS · TEAM JURA ATLAS · RELEASE GATE</p>
 <h2 style="margin:7px 0;color:#ffd08b">Atlas 9.6 · Community Research & Garage Audit</h2>
 <p>GTA VI pins are UNVERIFIED community research. Scaly and Loki approved artwork, original map layers, route tools and browser-local progress remain in use. A static audit is not proof of visual or gameplay parity.</p>
 <p><a href="./atlas-research.html" style="color:#ffd285">Leonida Research ↗</a> · <a href="./atlas93-garage.html" style="color:#ffd285">My Garage ↗</a> · <a href="./atlas-test-center.html" style="color:#ffd285">Map Test Center ↗</a> · <a href="./atlas-credits.html" style="color:#ffd285">Source credits ↗</a></p>
 <p style="font-size:12px">Review docs/ATLAS96-RELEASE-AUDIT.md and the generated site audit before publishing to main. This is an independent, unofficial fan project.</p>
</section>'''
    idx=html.lower().rfind('</main>')
    if idx<0:idx=html.lower().rfind('</body>')
    if idx<0:raise ValueError('Feature audit has no closing main or body')
    return html[:idx]+block+'\n'+html[idx:]


def apply(check=False):
    apply_95(check)
    for path in REQUIRED:
        if not (ROOT/path).is_file():raise FileNotFoundError(path)
    edits={}
    html=ROOT/'atlas-research.html';before=html.read_text('utf-8')
    if SCRIPT_TAG not in before:
        anchor='<script defer src="./atlas-research.js?v=70"></script>'
        if before.count(anchor)!=1:raise ValueError('Cannot safely insert clustering before research engine')
        after=before.replace(anchor,SCRIPT_TAG+'\n'+anchor,1)
    else:after=before
    if after!=before:edits[html]=after
    for name,func in [('atlas-research.js',patch_cluster_engine),('atlas90-gallery.js',patch_gallery),('atlas-feature-audit.html',patch_audit)]:
        f=ROOT/name;old=f.read_text('utf-8');new=func(old)
        if new!=old:edits[f]=new
    f=ROOT/'atlas93-garage.html';old=f.read_text('utf-8')
    new=inject(old,[
        '<link rel="stylesheet" href="./atlas96-garage.css?v=96">',
        '<script defer src="./atlas96-garage.js?v=96"></script>'
    ])
    if new!=old:edits[f]=new
    f=ROOT/'atlas90-vehicles5.html';old=f.read_text('utf-8')
    new=inject(old,['<link rel="stylesheet" href="./atlas96-catalog.css?v=96">'])
    if new!=old:edits[f]=new
    if not check:
        for name,current in edits.items():name.write_text(current,encoding='utf-8')
    print(('Would update' if check else 'Updated'),len(edits),'Atlas 9.6 files:',', '.join(p.name for p in edits) or '(already installed)')
    return edits

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--check',action='store_true');args=parser.parse_args()
    apply(args.check)
