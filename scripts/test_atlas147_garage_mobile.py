#!/usr/bin/env python3
"""Atlas 14.7 — mobile Garage nav is compact, accessible and non-destructive."""
from pathlib import Path
root=Path(__file__).resolve().parents[1]
h=(root/'atlas93-garage.html').read_text()
css=(root/'atlas147-garage-mobile.css').read_text()
assert '<body class="j147-garage">' in h
assert 'atlas147-garage-mobile.css?v=147' in h
for path in ('atlas81-hq.html','maps.html','heists.html','atlas90-vehicles5.html',
             'atlas-database.html?kind=vehicle','atlas-vehicle-configurator.html','atlas93-dispatch.html'):
 assert 'href="./'+path+'"' in h, path
assert 'scroll-snap-type:x proximity' in css
assert 'overflow-x:auto' in css and 'flex-wrap:nowrap!important' in css
assert '.mast nav a:focus-visible' in css
assert 'j147-garage' not in (root/'atlas.html').read_text()
assert 'j147-garage' not in (root/'atlas-online.html').read_text()
assert 'team-jura-atlas93-garage-v1' in (root/'atlas93-garage.js').read_text()
assert 'team-jura-atlas96-parking-v1' in (root/'atlas96-garage.js').read_text()
print('Atlas 14.7 original branded mobile Garage nav and save-key preservation PASS')

import subprocess
subprocess.run(['node','-e',"""const a=require('node:assert/strict'),{merge}=require('./atlas254-garage-merge.js');const allowed=new Set(['adder','sultan','dinghy']);const m={schema:1,garages:['Main Garage'],vehicles:{adder:{paint:'#123abc',note:'Newer',studioBody:'sports'}}};const g={owned:{'vehicles5:adder':true},wishlist:{},note:{keep:'yes'}};const p={schema:1,app:'team-jura-atlas93-garage',garage:{garages:['Dock'],vehicles:{adder:{paint:'Midnight',note:'Older'},sultan:{paint:'#e1a234',garage:'Dock',studioName:'Sunset',studioBody:'truck'},unknown:{paint:'Red'}}},collection:{owned:{'vehicles5:adder':false,'vehicles5:sultan':true,'vehicles5:dinghy':'true'},wishlist:{'vehicles5:dinghy':true}}};const r=merge(p,m,g,allowed);a.deepEqual(r.meta.vehicles.adder,m.vehicles.adder);a.equal(r.meta.vehicles.sultan.paint,'#e1a234');a.equal(r.meta.vehicles.sultan.studioBody,'truck');a.equal(r.meta.vehicles.sultan.studioName,'Sunset');a.equal(r.gallery.owned['vehicles5:adder'],true);a.equal(r.gallery.owned['vehicles5:dinghy'],undefined);a.equal(r.gallery.wishlist['vehicles5:dinghy'],true);a.deepEqual(r.gallery.note,g.note);a.equal(r.added,1);a.equal(r.kept,1);a.equal(r.skipped,1);a.deepEqual(Object.keys(m.vehicles),['adder']);a.throws(()=>merge({...p,garage:{garages:[],vehicles:[]}},m,g,allowed));console.log('PASS non-destructive Garage merge and exact concept RGB');"""],cwd=root,check=True)
