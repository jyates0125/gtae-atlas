/* Atlas 24.4: distinct source references for Vice City Definitive Edition. */
(()=>{'use strict';
const params=new URLSearchParams(location.search),world=(params.get('game')||params.get('world')||'iii').toLowerCase();
if(!['vc','vice-city'].includes(world))return;
const host=document.getElementById('classicFlatReference');if(!host)return;
const E=(tag,txt)=>{const n=document.createElement(tag);if(txt!==undefined)n.textContent=txt;return n};
const root=E('section');root.id='j244-de';root.className='j240-source-index';
const details=E('details'),summary=E('summary','Definitive Edition · separate coordinate references');
details.append(summary,E('p','Definitive Edition only. These are sourced teleport references, including approaches to jumps, not verified classic map pins or shared guide numbering. No classic radar overlay. Source-specific progress remains separate from classic saves.'));
const controls=E('div');controls.className='j240-controls';
const cat=E('select');cat.id='j244-category';cat.setAttribute('aria-label','Definitive Edition reference category');
const q=E('input');q.type='search';q.placeholder='Search source references';q.setAttribute('aria-label','Search Definitive Edition coordinates');
const start=E('select');start.id='j244-origin';start.setAttribute('aria-label','Choose Definitive Edition origin');
const plan=E('button','Preview reference route');plan.type='button';plan.disabled=true;
const download=E('button','Export DE route');download.type='button';download.disabled=true;
controls.append(cat,q,start,plan,download);
const status=E('p','Loading attributed references…');status.id='j244-status';status.setAttribute('role','status');
const list=E('ol');list.id='j244-results';
const link=E('a','Source and contributor ↗');link.href='https://github.com/mateusz-korbut/GTA-DE-Cheat-Menu/tree/577530924ad52473d48a57047e1d064840dc41af/cheat-menu/modules/vc/data/teleports/';link.target='_blank';link.rel='noopener noreferrer';
details.append(controls,status,list,link);root.append(details);host.after(root);
let records=[],route=[],progress=null;
const option=(v,l)=>{const o=E('option',l);o.value=v;return o};
function matched(){const s=q.value.trim().toLowerCase();return records.filter(r=>(!progress||progress.visible(r))&&r.category===cat.value&&(!s||(r.name+' '+r.id).toLowerCase().includes(s)))}
function show(rows){list.replaceChildren();for(const r of rows){const li=E('li');li.dataset.id=r.id;li.append(E('strong',r.name),E('small','X '+r.x+' · Y '+r.y+' · Z '+r.z+(Number.isFinite(r.heading)?' · heading '+r.heading+'°':'')));if(progress)li.append(progress.button(r));list.append(li)}}
function reset(){const v=start.value,items=matched();route=[];download.disabled=true;start.replaceChildren(option('','Choose origin…'),...items.map(r=>option(r.id,r.name)));if(items.some(r=>r.id===v))start.value=v;plan.disabled=!start.value;show(items);status.textContent=items.length+' references shown · 171 total · DE only.'}
cat.onchange=q.oninput=reset;start.onchange=()=>{route=[];download.disabled=true;plan.disabled=!start.value;show(matched())};
plan.onclick=()=>{const items=matched(),origin=items.find(r=>r.id===start.value);if(!origin)return;
 const pending=items.filter(r=>r.id!==origin.id);route=[origin];while(pending.length){const from=route.at(-1);pending.sort((a,b)=>Math.hypot(a.x-from.x,a.y-from.y)-Math.hypot(b.x-from.x,b.y-from.y)||a.slot-b.slot);route.push(pending.shift())}
 show(route);download.disabled=false;status.textContent=route.length+' reference stops · geometric XY order, not road directions.'};
download.onclick=()=>{if(!route.length)return;const a=E('a'),blob=new Blob([JSON.stringify({schema:1,world:'vc',edition:'definitive',kind:'coordinate-preview',sourceUrl:link.href,route:route.map(({id,x,y,z,heading})=>({id,x,y,z,...(Number.isFinite(heading)?{heading}:{})}))},null,2)],{type:'application/json'});a.href=URL.createObjectURL(blob);a.download='team-jura-vc-definitive-route.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000)};
fetch('./data/atlas-vc-de-171-source-points.json').then(r=>{if(!r.ok)throw Error('Source unavailable');return r.json()}).then(d=>{
 if(d.schema!==1||d.world!=='vc'||d.edition!=='definitive'||d.sourceRevision!=='577530924ad52473d48a57047e1d064840dc41af'||d.mapAlignment!=='edition-unverified'||d.records?.length!==171)throw Error('Source identity mismatch');
 const seen=new Set();for(const r of d.records){if(!/^vc-de-(hidden-packages|rampages|stunt-jumps)-\d+$/.test(r.id)||seen.has(r.id)||typeof r.name!=='string'||![r.x,r.y,r.z].every(Number.isFinite)||Math.abs(r.x)>2000||Math.abs(r.y)>2000)throw Error('Invalid coordinate');seen.add(r.id)}
 for(const [name,n] of [['Hidden packages',100],['Rampages',35],['Jump approaches',36]]){if(d.records.filter(r=>r.category===name).length!==n)throw Error('Category count mismatch');cat.append(option(name,name+' · '+n))}
 records=d.records;progress=window.JuraSourceProgress.create(window,{scope:'vc-definitive',revision:d.sourceRevision,rows:records,identity:r=>r.id,host:details,onChange:reset});reset()
}).catch(e=>{status.textContent='DE references unavailable: '+e.message;cat.disabled=q.disabled=start.disabled=true});
})();
