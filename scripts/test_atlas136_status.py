#!/usr/bin/env python3
"""Atlas 13.6: one activity-data validity rule and unambiguous labels."""
from pathlib import Path
import subprocess
R=Path(__file__).resolve().parents[1]
daily=(R/'atlas87-daily.js').read_text(encoding='utf8')
events=(R/'atlas88-events.js').read_text(encoding='utf8')
engine=(R/'atlas-conditions.js').read_text(encoding='utf8')
assert "C.rotationFeed(getFeed(),r.id,Date.now())" in daily
assert "dated selection(s) · not verified live" in daily
assert "ELIGIBLE · NOT LIVE VERIFIED" in events
assert "NOT proof that it is currently spawning" in events
assert "Eligible / selected (not verified live)" in engine
script=r"""
const assert=require('node:assert/strict');
const C=require('./atlas-conditions.js');
const now=Date.parse('2026-11-18T20:00:00Z');
const snap=(start,until,ids)=>({schema:1,rotations:{'gun-van':{
 checkedAtUtc:start,validUntilUtc:until,activeIds:ids,source:'Personal note'
}}});
const fresh=snap('2026-11-18T18:00:00Z','2026-11-19T06:00:00Z',['sample-1']);
const stale=snap('2026-11-15T12:00:00Z','2026-11-19T06:00:00Z',['sample-1']);
const expired=snap('2026-11-18T08:00:00Z','2026-11-18T18:00:00Z',['sample-1']);
const overCount=snap('2026-11-18T18:00:00Z','2026-11-19T06:00:00Z',['a','b']);
assert.equal(C.rotationFeed(fresh,'gun-van',now).active.size,1);
for(const data of [stale,expired,overCount]){
 assert.equal(C.rotationFeed(data,'gun-van',now),null);
 assert.equal(C.evaluate('gun-van',{mode:'online',snapshot:data,now}).status,'unknown');
}
assert.equal(C.evaluate('gun-van',{mode:'online',snapshot:fresh,now}).status,'available-feed');
assert.match(C.evaluate('gun-van',{mode:'online',snapshot:fresh,now}).reason,/not independently verified live/);
assert.match(C.statusText('active'),/not verified live/);
console.log('PASS shared valid dates, stale/over-count rejection and clear labels');
"""
subprocess.run(['node','-e',script],cwd=R,check=True)
print('PASS Atlas 13.6 status integrity')
