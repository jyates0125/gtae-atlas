#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const js=read('atlas364-map-credit.js'),css=read('atlas364-map-credit.css');
const expected=['atlas.html','atlas-online.html','atlas-vi.html'];
for(const file of expected){
 const html=read(file);
 assert.equal((html.match(/class="credits-line"/g)||[]).length,1,file+' must have ONE credit strip');
 assert.equal((html.match(/id="j364MapViewCredit"/g)||[]).length,1,file+' must have ONE source view label');
 assert.equal((html.match(/data-j87-maps-link/g)||[]).length,1,file+' must have ONE map-directory shortcut');
 assert.match(html,/<nav aria-label="Atlas pages"><a data-j87-maps-link href="\.\/maps\.html" class="navmap">/,file+' shortcut must be in navigation');
 assert.doesNotMatch(html,/data-j87-maps-link[^>]*style=/,file+' must not float on map');
 assert.match(html,/href="https:\/\/map\.gtadb\.org\/"/,file+' visible GTADB credit');
 assert.match(html,/href="https:\/\/creativecommons\.org\/licenses\/by\/4\.0\/"/,file+' exact attribution license');
 assert.match(html,/href="\.\/atlas-credits\.html#licensed"/,file+' must link full modifications and rights');
 assert.match(html,/atlas364-map-credit\.js\?v=364/);
 assert.match(html,/atlas364-map-credit\.css\?v=364/);
}
assert.match(read('atlas-vi.html'),/id="mapTitle">GTA VI · Leonida/);
assert.match(read('atlas-online.html'),/id="mapTitle">GTA Online · Los Santos/);
assert.match(css,/\.j364-map-source-view\{display:none!important\}/,'long view names hidden on phones');
assert.match(css,/\.map-actions\{bottom:46px!important\}/,'map buttons clear credit band');
assert.doesNotMatch(js,/\bfetch\s*\(|localStorage|sessionStorage|XMLHttpRequest/,'credits must do no network/storage');
let change,observer;
const select={value:'scaly,view',addEventListener(event,fn){if(event==='change')change=fn;}};
const note={textContent:''};
const document={
 readyState:'complete',
 getElementById(id){return id==='layer'?select:id==='j364MapViewCredit'?note:null;}
};
const window={addEventListener(){}};
const MutationObserver=class{
 constructor(fn){observer=fn;}
 observe(node,opts){assert.equal(node,select);assert.equal(opts.childList,true);}
};
vm.runInNewContext(js,{window,document,MutationObserver});
assert.equal(note.textContent,' · YANIS V18 · Scaly view');
select.value='dupzor,51';change();
assert.equal(note.textContent,' · DUPZOR V51 · Loki view');
select.value='day';observer();
assert.equal(note.textContent,' · GTA VI in-game Day · Rockstar artwork');
select.value='radar';change();
assert.equal(note.textContent,' · GTA V radar');
select.value='unknown';change();
assert.equal(note.textContent,' · GTADB community tiles');
assert.equal(window.JuraMapCredit.sourceForStyle('research,view'),'YANIS V18 research');
console.log('Atlas 36.4: 3 modern maps, one visible credit, nav no overlay, correct world labels, dynamic view attribution and responsive layout PASS');
