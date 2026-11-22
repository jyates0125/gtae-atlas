// Garage sharing/privacy and Forge build accounting contract.
const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const root=path.resolve(__dirname,'..');const js=fs.readFileSync(path.join(root,'atlas93-garage.js'),'utf8');const css=fs.readFileSync(path.join(root,'atlas147-garage-mobile.css'),'utf8');
assert.match(js,/share\.href='\.\/atlas93-garage\.html\?addModel='\+encodeURIComponent\(r\.id\)/,'Share only model ID');
assert.match(js,/Your private build and ownership are not shared/,'Explicit privacy note');
assert.doesNotMatch(js,/share\.href[^;]*JSON\.stringify/,'Do not expose personal collection in links');
assert.match(js,/v\.studioDesign&&Object\.keys\(v\.studioDesign\)\.length/,'Forge design-only builds must count');
assert.match(css,/\.j293-share-actions/,'Model share controls need responsive styling');
assert.match(css,/min-height:44px/,'Model share actions need touch targets');
assert.match(js,/querySelector\('\.j226-garage-back'\)\?\.focus\(\{preventScroll:true\}\)/,'Mobile details selection should receive keyboard focus');
assert.match(js,/\(trigger\|\|\$\('garageSearch'\)\)\.focus\(\{preventScroll:true\}\)/,'Back should restore focus to model card or search');
console.log('Atlas 29.3 Garage sharing and Forge saved-build contracts passed');
