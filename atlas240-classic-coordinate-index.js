/* Atlas 24.0 — source-grounded classic XYZ index, distinct from personal image pins. */
(()=>{'use strict';
const p=new URLSearchParams(location.search),raw=(p.get('game')||p.get('world')||'iii').toLowerCase();
if(!['vc','vice-city'].includes(raw))return;
const target=document.getElementById('classicFlatReference');if(!target)return;
const E=(t,s)=>{const n=document.createElement(t);if(s!==undefined)n.textContent=s;return n};
const root=E('section');root.id='j240-source-index';root.className='j240-source-index';root.setAttribute('aria-label','Vice City sourced coordinates');
const heading=E('h3','Vice City · sourced location coordinates');
const note=E('p','Game-script reference positions, not calibrated on this image. Source numbering differs from guide checklists. Route order is straight-line XYZ reference planning (XY distance), not street navigation.');
const status=E('p','Loading locally bundled source…');status.setAttribute('role','status');status.id='j240-status';
const controls=E('div');controls.className='j240-controls';
const cat=E('select');cat.id='j240-category';cat.setAttribute('aria-label','Source category');
const q=E('input');q.type='search';q.placeholder='Search source ID or name';q.setAttribute('aria-label','Search source positions');
const start=E('select');start.id='j240-start';start.setAttribute('aria-label','Route starting reference');
const order=E('button','Build geometric preview');order.type='button';order.disabled=true;
const exportButton=E('button','Export source preview');exportButton.type='button';exportButton.disabled=true;
controls.append(cat,q,start,order,exportButton);
const list=E('ol');list.id='j240-rows';
const source=E('a','Original source and author ↗');source.href='https://github.com/kong78/collectibles-on-radar-gta-vc/blob/b06265e1bf37e2b1ed389c58c80679addfbc8f20/src/Util.cpp';source.target='_blank';source.rel='noopener noreferrer';
root.append(heading,note,status,controls,list,source);target.after(root);
let rows=[],planned=[];
const option=(value,label)=>{const o=E('option',label);o.value=value;return o};
function visible(){const s=q.value.trim().toLowerCase();return rows.filter(r=>r.category===cat.value&&(!s||(r.id+' '+r.name).toLowerCase().includes(s)))}
function display(items){list.replaceChildren();for(const r of items){const li=E('li'),label=E('strong',r.name),detail=E('small','X '+r.x.toFixed(3)+' · Y '+r.y.toFixed(3)+' · Z '+r.z.toFixed(3));li.dataset.id=r.id;li.append(label,detail);list.append(li)}}
function reset(){planned=[];exportButton.disabled=true;const selected=start.value,items=visible();start.replaceChildren(option('','Choose origin…'),...items.map(r=>option(r.id,r.name)));if(items.some(r=>r.id===selected))start.value=selected;order.disabled=!start.value;display(items);status.textContent=items.length+' references shown · 51 total · not map-calibrated.'}
q.oninput=reset;cat.onchange=reset;start.onchange=()=>{order.disabled=!start.value;planned=[];exportButton.disabled=true;display(visible())};
order.onclick=()=>{const points=visible(),origin=points.find(r=>r.id===start.value);if(!origin)return;const pending=points.filter(r=>r.id!==origin.id);planned=[origin];while(pending.length){const from=planned.at(-1);pending.sort((a,b)=>((a.x-from.x)**2+(a.y-from.y)**2)-((b.x-from.x)**2+(b.y-from.y)**2)||a.slot-b.slot);planned.push(pending.shift())}display(planned);exportButton.disabled=false;status.textContent=planned.length+' reference stops · straight-line nearest-next order; not road directions.'};
exportButton.onclick=()=>{if(!planned.length)return;const blob=new Blob([JSON.stringify({schema:1,world:'vc',kind:'sourced-coordinate-preview',sourceUrl:source.href,route:planned.map(({id,x,y,z})=>({id,x,y,z}))},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=E('a');a.href=url;a.download='team-jura-vc-reference-route.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000)};
fetch('./data/atlas-vc-51-source-points.json').then(r=>{if(!r.ok)throw Error('source unavailable');return r.json()}).then(d=>{const seen=new Set();if(d.schema!==1||d.world!=='vc'||d.sourceRevision!=='b06265e1bf37e2b1ed389c58c80679addfbc8f20'||d.mapAlignment!=='unverified'||d.records?.length!==51)throw Error('source identity mismatch');for(const r of d.records){if(!/^vc-(jump|robbery)-\d{2}$/.test(r.id)||seen.has(r.id)||!['Stunt jumps','Store robberies'].includes(r.category)||![r.x,r.y,r.z].every(Number.isFinite)||typeof r.name!=='string')throw Error('invalid source row');seen.add(r.id)}if(d.records.filter(r=>r.category==='Stunt jumps').length!==36)throw Error('category count mismatch');rows=d.records;cat.append(option('Stunt jumps','Stunt jumps · 36'),option('Store robberies','Store robberies · 15'));reset()}).catch(e=>{status.textContent='Reference index unavailable: '+e.message;cat.disabled=q.disabled=start.disabled=true});
})();
