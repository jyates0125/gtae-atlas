// Focused character deep-link regression. Run: node tests/atlas292-character-deeplinks.test.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const script=fs.readFileSync(path.join(root,'atlas222-characters.js'),'utf8');
const html=fs.readFileSync(path.join(root,'atlas-characters.html'),'utf8');
assert.ok(html.includes('id="j222-profile-dialog"'),'Character profile dialog missing');
assert.ok(script.includes('const hit=requested && data.find(r=>r.id===requested);'),'Shared profile must resolve by unique identity, not current filters');
assert.ok(script.includes("scope!==hit.scope"),'World filter must reconcile to requested character');
assert.ok(script.includes('editionSelect.value=edition'),'Classic edition must reconcile to requested character');
assert.ok(script.includes('draw();persist();showProfile(dialog,hit);return'),'Profile must render and retain canonical filter state');
assert.ok(script.includes("window.addEventListener('popstate',restoreProfile)"),'Browser back must restore profile state');
assert.ok(script.includes('history.back();return'),'Dialog close must support returning to results');
console.log('Atlas 29.2 character profile deep-link source contract passed');
