#!/usr/bin/env python3
"""Atlas 13.4 regression: automatic data loading without fake active event claims."""
from pathlib import Path
import json,subprocess
R=Path(__file__).resolve().parents[1]
def src(name): return (R/name).read_text(encoding="utf8")
pack=json.loads(src("data/online-rotation-current.json"))
assert pack["schema"]==1
assert pack["rotations"]=={}, "Do not ship fabricated current spawn IDs"
conditions=src("atlas-conditions.js")
assert "halloween2026" in conditions
assert "Halloween 2026 ended November 4" in conditions
assert "closed:'Not active'" in conditions
activities=src("atlas-activities.html")
assert "Loading the site's reviewed rotation information automatically" in activities
assert "Advanced · Import a personal rotation file (optional)" in activities
assert "<h2>Activity directory · active and inactive</h2>" in activities
js=src("atlas-activities.js")
daily=src("atlas87-daily.js")
for value in (js,daily):
 assert "fetch('./data/online-rotation-current.json'" in value
assert "loadReviewedRotations();" in js
assert "seasonExpired" in src("atlas88-events.js")
assert "checkbox.disabled=true" in src("atlas88-events.js")
assert "Import dated position JSON" not in src("atlas87-daily.html")
mapjs=src("atlas.js")
assert "if(eventFocusIds)return records().filter" in mapjs
assert "Temporary event focus:" in mapjs and "jura:event-focus-cleared" in mapjs
focus=mapjs.split("window.JuraAtlasEventLocations=Object.freeze({",1)[1].split("window.JuraDualLegendAPI",1)[0]
assert "active[filterScope()]=" not in focus and "hiddenNamed[namedScope()]=" not in focus
assert "JuraAtlasEventLocations?.refresh()" in src("atlas88-events.js")
assert "function cleanPersonalPin" in mapjs and "const nextProgress={...progress}" in mapjs
assert "Existing progress, pins, route order and route starts are preserved" in mapjs
assert "category:['user','collectible','vehicle'].includes(pin.category)" in mapjs
for page in ('atlas.html','atlas-online.html','atlas-vi.html'):
 assert 'Merge backup</button>' in src(page)
node=r"""
const assert=require('node:assert/strict');
const C=require('./atlas-conditions.js');
const now=Date.parse('2026-11-18T20:00:00Z');
let state=C.safeState({events:{halloween:true},completed:{},seen:{},flags:{}});
for(const id of ['pumpkins','ufo','ghosts-exposed','ghost-1']){
 let st=C.evaluate(id,{mode:'online',state,now,hour:20});
 assert.equal(st.status,'closed',id+' must be inactive after the season');
 assert.match(st.reason,/ended November 4/);
}
assert.equal(C.statusText('closed'),'Not active');
assert.equal(C.evaluate('gun-van',{mode:'online',state,now,snapshot:{schema:1,rotations:{}}}).status,'unknown');
const at=Date.parse('2026-11-21T05:30:00Z');
const snapshot=(id,checked,end,activeIds=['1'])=>({schema:1,rotations:{[id]:{checkedAtUtc:checked,validUntilUtc:end,activeIds}}});
const overReset=snapshot('gun-van','2026-11-21T05:00:00Z','2026-11-21T08:00:00Z');
assert.equal(C.rotationFeed(overReset,'gun-van',at),null);
const valid=snapshot('gun-van','2026-11-21T05:00:00Z','2026-11-21T06:00:00Z');
assert.ok(C.rotationFeed(valid,'gun-van',at));
assert.equal(C.rotationFeed(valid,'gun-van',Date.parse('2026-11-21T06:00:00Z')),null);
const dealer=snapshot('street-dealers','2026-11-21T05:00:00Z','2026-11-21T07:00:00Z',['1','2','3']);
assert.ok(C.rotationFeed(dealer,'street-dealers',Date.parse('2026-11-21T06:30:00Z')));
assert.equal(C.rotationFeed(snapshot('street-dealers','2026-11-21T05:00:00Z','2026-11-21T07:00:00Z',['1','1']),'street-dealers',at),null);
const merged=C.selectRotationSnapshot(overReset,{schema:1,rotations:{...valid.rotations,...dealer.rotations}},at);
assert.equal(merged.rotations['gun-van'].validUntilUtc,'2026-11-21T06:00:00Z');
assert.ok(merged.rotations['street-dealers']);
assert.equal(C.rotationFeed(snapshot('gun-van','2026-11-21T05:00:00Z','2026-11-21T06:00:00Z',[]),'gun-van',at),null);
console.log('PASS event status, reset boundary, distinct rotation IDs, per-activity fallback and absent rotation feed');
"""
subprocess.run(["node","-e",node],cwd=R,check=True)
print("PASS Atlas 13.4 automatic rotation file, optional JSON and ended Halloween event")
