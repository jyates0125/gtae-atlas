#!/usr/bin/env python3
"""One-shot cumulative Team Jura 9.4 + 9.5 integration; repeat-safe.
Run ONLY on 'development' checkout (Actions validates branch). Does not change main.
Patches the existing research engine with an additive, read-only interface and
CORS-safe map tile selection for native shared WebGL. Preserves save keys.
"""
from pathlib import Path
import argparse

ROOT = Path(__file__).resolve().parents[1]
REQUIRED = ('atlas94-ui.js','atlas94-ui.css','atlas95-ui.js','atlas95-ui.css',
            'atlas-research.js','atlas-research.html','atlas-vi.html','atlas-3d.js')
VIEW_TAGS = ('<link rel="stylesheet" href="./atlas94-ui.css?v=94">',
             '<script defer src="./atlas94-ui.js?v=94"></script>',
             '<link rel="stylesheet" href="./atlas95-ui.css?v=95">',
             '<script defer src="./atlas95-ui.js?v=95"></script>')
RESEARCH_3D = '<script defer src="./atlas-3d.js?v=95"></script>'

# This is an intentionally narrow code insertion, not a wholesale research renderer rewrite.
# Names/ids are from Atlas development branch, 2026-11-15.
API_ANCHOR = "window.addEventListener('resize',size);size();load();})();"
API_SNIPPET = """
// Team Jura 9.5: internal research-model bridge. Other modules never mutate the source records.
window.TeamJuraResearch95=Object.freeze({
 positionMode:()=>positionMode,
 setPositionMode:(mode)=>{positionMode=['all','mapped','unmapped'].includes(mode)?mode:'all';shown=60;refresh()},
 reloadProgress:()=>{visited=read(key+'-visited',{});favorites=read(key+'-fav',{});refresh()},
 records:()=>records.slice(),visible:()=>totalVisible.slice(),
 camera:()=>({...camera}),route:()=>route.filter(r=>r.positioned).slice(),
 selected:()=>selected,
 selectId:(id)=>{const found=records.find(r=>r.id===id);if(!found)return false;select(found);return true},
 nextUnvisited:()=>{const next=totalVisible.find(r=>!visited[stateId(r)]);if(!next)return null;select(next);return next},
 stats:()=>({all:records.length,mapped:records.filter(r=>r.positioned).length,searchOnly:records.filter(r=>!r.positioned).length,filtered:totalVisible.length}),
 refresh:()=>refresh(),
 textureDraw:(out,b)=>{
  const g=out.getContext('2d');if(!g)return false;
  g.fillStyle='#21445b';g.fillRect(0,0,out.width,out.height);
  const extent=Math.max(1,b.x1-b.x0),height=Math.max(1,b.y1-b.y0);
  const level=Math.max(0,Math.min(4,Math.round(Math.log2(24576/extent))));
  const span=8192/Math.pow(2,level),boundsRow=bounds[level];
  let loaded=0;
  const a=Math.max(boundsRow[0],Math.floor((b.x0+16384)/span));
  const c=Math.min(boundsRow[2],Math.ceil((b.x1+16384)/span)-1);
  const top=Math.max(boundsRow[1],Math.floor((16384-b.y1)/span));
  const bottom=Math.min(boundsRow[3],Math.ceil((16384-b.y0)/span)-1);
  if((c-a+1)*(bottom-top+1)>64)return false;
  for(let ty=top;ty<=bottom;ty++)for(let tx=a;tx<=c;tx++){
    const t=tile(level,tx,ty);
    if(!t||t.state!=='ok')continue;
    const x=-16384+tx*span,y=16384-ty*span;
    const dx=(x-b.x0)/extent*out.width,dy=(b.y1-y)/height*out.height;
    const dw=span/extent*out.width,dh=span/height*out.height;
    g.drawImage(t.img,dx,dy,dw+.7,dh+.7);loaded++;
  }
  return loaded>0;
 }
});
"""


def inject(html, tags):
    for tag in tags:
        if tag not in html:
            i = html.lower().rfind('</head>')
            if i < 0:
                raise ValueError('HTML missing </head>')
            html = html[:i] + tag + '\n' + html[i:]
    return html


def patch_research(js):
    if 'window.TeamJuraResearch95=Object.freeze' not in js:
        if js.count(API_ANCHOR) != 1:
            raise ValueError('Research API anchor changed. Stop before touching existing JS.')
        js = js.replace(API_ANCHOR, API_SNIPPET+'\n'+API_ANCHOR)
    # Every GTA VI research item is provisional, including records whose source
    # was a trailer or screenshot: evidence of an image is not position verification.
    if "let rawRecords=[],records=[]" in js:
        js=js.replace("let rawRecords=[],records=[]","let positionMode='all',rawRecords=[],records=[]",1)
    elif "let positionMode='all',rawRecords=[]" not in js:
        raise ValueError('Could not locate research model declaration')
    before_filter="return records.filter(r=>familyEnabled.has(r.family)"
    after_filter="return records.filter(r=>(positionMode==='all'||(positionMode==='mapped'?r.positioned:!r.positioned))&&familyEnabled.has(r.family)"
    if before_filter in js: js=js.replace(before_filter,after_filter,1)
    elif after_filter not in js:raise ValueError('Could not locate research filtering logic')
    js = js.replace("r.positioned?'Mapped (provisional)':'No coordinates'",
                    "r.positioned?'UNVERIFIED · map pin':'UNVERIFIED · search only'")
    if "'UNVERIFIED · '+r.family.toUpperCase()+' · '+r.group" not in js:
        js = js.replace("r.family.toUpperCase()+' · '+r.group",
                        "'UNVERIFIED · '+r.family.toUpperCase()+' · '+r.group",1)
    # Allow WebGL to sample tile images; the old 2D host can still use the raw
    # GitHub fallback if the primary origin does not allow CORS.
    prior="const o={state:'loading',img:new Image(),fallback:false};images.set(id,o);"
    after="const o={state:'loading',img:new Image(),fallback:false};o.img.crossOrigin='anonymous';images.set(id,o);"
    if prior in js:
        js=js.replace(prior,after,1)
    elif after not in js:
        raise ValueError('Research tile constructor changed; review CORS integration before applying.')
    original="o.img.onload=()=>{o.state='ok';draw()};"
    updated="o.img.onload=()=>{o.state='ok';draw();document.dispatchEvent(new Event('jura95:research-tile'))};"
    if original in js:
        js=js.replace(original,updated,1)
    elif updated not in js:
        raise ValueError('Research tile load handler changed; review 3D texture trigger.')
    refresh_before="function refresh(){totalVisible=filtered();drawList();draw()}"
    refresh_after="function refresh(){totalVisible=filtered();drawList();draw();document.dispatchEvent(new Event('jura95:research-refresh'))}"
    if refresh_before in js:js=js.replace(refresh_before,refresh_after,1)
    elif refresh_after not in js:raise ValueError('Research refresh anchor changed')
    return js


def apply(check=False):
    for name in REQUIRED:
        if not (ROOT/name).is_file():
            raise FileNotFoundError('Missing source file: '+name)
    edits={}
    for name in ('atlas-research.html','atlas-vi.html'):
        file=ROOT/name
        tags=VIEW_TAGS
        if name=='atlas-research.html':
            # 3D engine must load before cumulative 9.5 UI.
            tags=VIEW_TAGS[:-1]+(RESEARCH_3D, VIEW_TAGS[-1])
        original=file.read_text(encoding='utf-8')
        current=inject(original,tags)
        if current!=original:edits[name]=current
    file=ROOT/'atlas-research.js'
    original=file.read_text(encoding='utf-8')
    current=patch_research(original)
    if original!=current:edits['atlas-research.js']=current
    if not check:
        for name,current in edits.items():
            (ROOT/name).write_text(current,encoding='utf-8')
    print(('Would update' if check else 'Updated'),len(edits),'files:',', '.join(edits) or '(already installed)')
    return edits


if __name__=='__main__':
    p=argparse.ArgumentParser()
    p.add_argument('--check',action='store_true')
    opts=p.parse_args()
    apply(opts.check)
