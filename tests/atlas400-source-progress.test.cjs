const assert=require('node:assert/strict');
const api=require('../atlas271-source-progress.js');
const scope='vc-classic',rev='test',known=new Set(['a','b']),raw=done=>({schema:api.schema,scope,revision:rev,done});
assert.deepEqual(api.clean(raw(['b','a','a']),scope,rev,known),['a','b']);
assert.deepEqual(api.merge(['a'],raw(['b']),scope,rev,known),['a','b']);
for(const value of [null,raw(['a','other']),raw([1]),{...raw(['a']),scope:'iii-classic'},{...raw(['a']),revision:'old'}])assert.throws(()=>api.clean(value,scope,rev,known));
assert.throws(()=>api.makeIndex([{id:'x'},{id:'x'}],r=>r.id));
console.log('PASS source identity, unknown objective refusal, duplicate record IDs and merge-only backup');
