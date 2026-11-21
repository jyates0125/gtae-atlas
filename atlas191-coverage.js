/* Atlas 19.1 — actual bundled map-data inventory, never category-count fiction.
 * Manifests report sourced *landmarks*, not invented spawn/item completeness.
 * Packaged versions only; no live third-party requests or player tracking.
 */
(()=>{'use strict';
const root=document.getElementById('j191-coverage-ledger');if(!root)return;
const specs=[
 {id:'gtadb-5',name:'GTA V · Los Santos',type:'LANDMARK RESEARCH',file:'./data/gtadb-5-manifest.json',world:'./atlas.html',expected:'5',source:'GTADB.ORG · CC BY 4.0',kind:'manifest'},
 {id:'gtadb-4',name:'GTA IV · Liberty City',type:'LANDMARK RESEARCH',file:'./data/gtadb-4-manifest.json',world:'./atlas-iv.html',expected:'4',source:'GTADB.ORG · CC BY 4.0',kind:'manifest'},
 {id:'gtadb-6',name:'GTA VI · Leonida',type:'PROVISIONAL RESEARCH',file:'./data/gtadb-6-manifest.json',world:'./atlas-vi.html',expected:'6',source:'GTADB.ORG · CC BY 4.0',kind:'manifest'},
 {id:'iv-birds',name:'GTA IV / TLAD / TBOGT',type:'SOURCED COLLECTIBLES',file:'./data/atlas-iv-300-source-birds.json',world:'./atlas-iv.html?scope=iv',expected:'4',source:'Wes Hampson · MIT',kind:'birds'},
 {id:'sa-pins',name:'GTA San Andreas',type:'APPROXIMATE COLLECTIBLES',file:'./data/atlas-sa-150-sourced-pins.json',world:'./atlas-sa.html',expected:'san-andreas',source:'Flentric MIT / Toliak Apache-2.0',kind:'sa'}
];
const E=(tag,cls,value)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(value!==undefined)el.textContent=String(value);return el};
async function load(spec){
 const resp=await fetch(spec.file,{cache:'force-cache'});if(!resp.ok)throw Error('HTTP '+resp.status);
 const data=await resp.json();
 if(data.game!==spec.expected)throw Error('Mismatched game identity');
 if(spec.kind==='manifest'){
  if(!Number.isInteger(data.count)||!Number.isInteger(data.mappedCount)||data.count<data.mappedCount||data.count<1)
   throw Error('Unrecognized source manifest');
  const unplaced=data.count-data.mappedCount,description=data.count.toLocaleString()+' total landmarks · '+data.mappedCount.toLocaleString()+' positioned'+(unplaced?' · '+unplaced+' search-only':'');
  return{description,note:spec.expected==='6'?'Community coordinates remain provisional after GTA VI launch; this snapshot was not independently checked against gameplay.':'A landmark is a place, not evidence of a complete game collectible set.',date:data.sourceUpdated||'Unknown snapshot date'};
 }
 if(spec.kind==='birds'){
  if(data.count!==300||data.license!=='MIT'||data.sets?.iv?.length!==200||data.sets?.tlad?.length!==50||data.sets?.tbogt?.length!==50)
   throw Error('Invalid distinct episode collectible counts');
  return{description:'200 GTA IV Flying Rats · 50 TLAD Seagulls · 50 TBOGT Seagulls',note:'Game-world XYZ sourced from MIT code; game scopes and personal found states are separate. Numbering follows source order.',date:'Source commit '+String(data.sourceCommit||'').slice(0,8)};
 }
 if(spec.kind==='sa'){
  if(data.records?.length!==150||data.counts?.snapshots!==50||data.counts?.horseshoes!==50||data.counts?.oysters!==50)
   throw Error('Incomplete licensed San Andreas coordinate pack');
  return{description:'50 Snapshots · 50 Horseshoes · 50 Oysters',note:'150 sourced XYZ positions approximately placed on vector artwork. 100 Tags and 70 Jumps still lack bundled, checked positions.',date:data.checkedAt||'Snapshot date unknown'};
 }
 throw Error('Unrecognized data source');
}
function card(spec){
 const art=E('article','j191-source-card');art.dataset.source=spec.id;
 const head=E('div','j191-source-heading');head.append(E('strong','',spec.name),E('small','',spec.type));art.append(head);
 const summary=E('p','j191-source-count','Reviewing locally bundled data…'),foot=E('p','j191-source-note'),date=E('small','j191-source-date','');
 const link=E('a','j191-source-link','Open Atlas workspace ›');link.href=spec.world;
 art.append(summary,foot,date,link);
 return{art,summary,foot,date};
}
const grid=E('div','j191-source-grid'),summary=E('p','j191-status');
summary.setAttribute('role','status');summary.setAttribute('aria-live','polite');
root.append(grid,summary);
let ok=0;
Promise.all(specs.map(async spec=>{
 const ui=card(spec);grid.append(ui.art);
 try{const data=await load(spec);ui.summary.textContent=data.description;ui.foot.textContent=data.note;
  ui.date.textContent=spec.source+' · '+data.date;ui.art.dataset.status='loaded';ok++;}
 catch(err){ui.summary.textContent='Bundled source unavailable';ui.foot.textContent='No count or coverage is assumed; check the local files and retry.';
  ui.date.textContent=spec.source+' · '+String(err.message||err);ui.art.dataset.status='missing';}
})).then(()=>{
 summary.textContent=ok+' of '+specs.length+' source packs validated in this browser. These are inventory counts, not a claim of full collectible parity, active daily spawns or exact route precision.';
});
})();