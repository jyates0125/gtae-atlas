/* Team Jura Atlas 8.7 — game-scoped daily intelligence, no fabricated live spawns.
 * RULES and safeSnapshot are read from the existing Team Jura conditions engine.
 * Daily feed is user-imported and trusted only for its declared validity window.
 */
(()=>{'use strict';const C=window.JuraConditions;if(!C)return;
const $=id=>document.getElementById(id),path=(location.pathname.split('/').pop()||'').toLowerCase();
const selected=C.rulesForMode('online').filter(r=>r.kind==='rotation');
const read=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||'null')||d}catch{return d}};
let reviewed={schema:1,rotations:{}};
const getFeed=()=>{let personal;try{personal=C.safeSnapshot(read('jura68-rotation-feed',{schema:1,rotations:{}}))}catch{}return C.selectRotationSnapshot(personal,reviewed)};
let lastAttempt=0,pending=false;
async function autoFeed(){
 if(pending||Date.now()-lastAttempt<300000)return;pending=true;lastAttempt=Date.now();
 try{reviewed=await C.loadPublishedRotations(fetch,'./data/online-rotation-current.json?update=1',reviewed)}catch(_){}finally{pending=false}
 dashboard();
 if($('#j87-daily-panel')){$('#j87-daily-panel').remove();panel()}
}
function status(r){
 const raw=getFeed().rotations[r.id];
 if(!raw)return{type:'missing',msg:'Unconfirmed today',detail:'All possible sites ≠ verified active locations'};
 // Use the SAME validity rules as the map/activity evaluator: check timestamp,
 // <=48 hour freshness, reset expiry and per-activity maximum selection count.
 const valid=C.rotationFeed(getFeed(),r.id,Date.now());
 if(!valid)return{type:'stale',msg:'Not currently verified',detail:'Saved selection is stale, future-dated or invalid; do not use its markers as current'};
 return{type:'dated',msg:`${valid.active.size} dated selection(s) · not verified live`,detail:`Selection expires ${new Date(valid.validUntilUtc).toLocaleString()} · A timestamp alone does not confirm game availability`};
}
function card(r){const a=document.createElement('article');a.className='j87-daily-card';a.id=r.id;a.dataset.status=status(r).type;a.style.scrollMarginTop='90px';let h=document.createElement('div');h.className='j87-daily-title';const title=document.createElement('strong');title.textContent=r.name;const reset=document.createElement('span');reset.textContent=`Daily reset ${String(r.reset??6).padStart(2,'0')}:00 UTC`;h.append(title,reset);a.append(h);
let p=document.createElement('p');p.textContent=status(r).msg;a.append(p);let note=document.createElement('small');note.textContent=status(r).detail;a.append(note);
const links=document.createElement('div');links.className='j87-daily-links';for(const [label,url] of [['Game activities','./atlas-activities.html?mode=online'],['Find possible locations', r.id==='cayo-chests'?'./heist-cayo-perico.html':'./atlas-online.html?event='+encodeURIComponent(r.id)],['GTADB source ↗',r.source||'./atlas-credits.html'],['Compare daily tracker ↗','https://gtamap.io/gta-online/daily/']]){let x=document.createElement('a');x.href=url;x.textContent=label;if(/^https?:/.test(url)){x.target='_blank';x.rel='noopener noreferrer'}links.append(x)}a.append(links);return a;}
function dashboard(){const root=$('j87-daily-list');if(!root)return;root.replaceChildren();for(const r of selected)root.append(card(r));let total=$('j87-daily-summary');if(total)total.textContent=`${selected.length} daily categories monitored · independent data channel + bundled fallback · personal imports optional · no Rockstar account link`;}
function panel(){if(path!=='atlas-online.html')return;const side=$('sidebar');if(!side||$('#j87-daily-panel'))return;const section=document.createElement('section');section.id='j87-daily-panel';section.innerHTML='<div class="j87-daily-top"><span>◷ DAILY INTELLIGENCE</span><a href="./atlas87-daily.html">Open full dashboard ↗</a></div><p>Today’s map positions require a dated source. Potential locations are never shown as confirmed.</p><div id="j87-daily-panel-grid"></div>';
const anchor=$('jura83-panel');if(anchor)anchor.insertAdjacentElement('afterend',section);else side.prepend(section);
const grid=$('j87-daily-panel-grid');const simeonLink=document.createElement('a');simeonLink.className='j87-daily-mini';simeonLink.href='./atlas87-daily.html#j87-simeon';simeonLink.textContent='Simeon requested vehicles · personal SMS lists ↗';grid.append(simeonLink);const offers=document.createElement('a');offers.className='j87-daily-mini';offers.href='./atlas87-daily.html#vehicle-offers';offers.textContent='Vehicle offers / GTA+ ↗';grid.append(offers);for(const r of selected.slice(0,7)){let row=document.createElement('a');row.href='./atlas87-daily.html#'+r.id;const st=status(r);row.className='j87-daily-mini';row.append(document.createTextNode(r.name));const badge=document.createElement('span');badge.textContent=st.type==='dated'?'DATED':'UNCONFIRMED';row.append(badge);grid.append(row)} }
function refreshStatus(){dashboard();if($('#j87-daily-panel')){$('#j87-daily-panel').remove();panel()}}
const simeonLists=[["Schafter","Bullet","F620","Carbonizzare","Comet"],["Banshee","Coquette","Sentinel","Dubsta","Infernus"],["Feltzer","Jackal","F620","Super Diamond","Rocoto"],["Infernus","Coquette","Banshee","Dubsta","Sentinel"],["Felon GT","Serrano","Bullet","Infernus","Coquette"],["Zion","Banshee","Comet","Surano","Exemplar"],["Sentinel","Schwartzer","Super Diamond","Jackal","Feltzer"],["Rocoto","Felon GT","Schafter","Carbonizzare","Exemplar"]];
function matchSimeon(names){if(!Array.isArray(names)||!names.length||names.length>5||new Set(names).size!==names.length)return [];return simeonLists.map((cars,i)=>({number:i+1,cars})).filter(x=>names.every(n=>x.cars.includes(n)))}
function mountSimeon(root){if(!root||root.dataset.simeonReady)return;root.dataset.simeonReady='true';const E=(tag,label)=>{const el=document.createElement(tag);if(label!==undefined)el.textContent=label;return el};const details=E('details');details.className='j87-simeon';details.append(E('summary','Simeon requested vehicles · match SMS'));const note=E('p','Select names from your phone. Only one vehicle is delivered; these are possible lists, not guaranteed spawns.');details.append(note);const chosen=new Set();const fields=E('div');fields.className='j87-simeon-choices';const result=E('p');result.setAttribute('role','status');const output=E('div');function render(){output.replaceChildren();const matches=chosen.size?matchSimeon([...chosen]):simeonLists.map((cars,i)=>({number:i+1,cars}));result.textContent=chosen.size?(matches.length?matches.length+' matching list(s)':'No matching list. Check your phone.'):'Eight possible lists. None assumed active.';for(const x of matches){const row=E('details');row.open=chosen.size>0&&matches.length<=2;row.append(E('summary','List '+x.number),E('p',x.cars.join(' · ')));output.append(row)}for(const box of fields.querySelectorAll('input'))box.disabled=!box.checked&&chosen.size>=5;}for(const car of [...new Set(simeonLists.flat())].sort()){const label=E('label'),box=E('input');box.type='checkbox';box.value=car;box.addEventListener('change',()=>{if(box.checked&&chosen.size<5)chosen.add(car);else{chosen.delete(car);box.checked=false}render()});label.append(box,document.createTextNode(' '+car));fields.append(label)}const reset=E('button','Clear selection');reset.type='button';reset.addEventListener('click',()=>{chosen.clear();for(const box of fields.querySelectorAll('input'))box.checked=false;render()});const source=E('a','Sources & guidance');source.href='./atlas-credits.html#forge-rotating-vehicles';details.append(fields,reset,result,output,source);root.append(details);render();}

function init(){
 mountSimeon($('j87-simeon'));
 if(path==='atlas87-daily.html')dashboard();panel();autoFeed();
 if(path==='atlas87-daily.html'){const id=location.hash.slice(1);if(selected.some(r=>r.id===id))requestAnimationFrame(()=>document.getElementById(id)?.scrollIntoView({block:'start'}))}
 window.addEventListener('storage',e=>{if(e.key==='jura68-rotation-feed')refreshStatus()});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden){refreshStatus();void autoFeed()}});
 // Refresh evidence at most once a minute even if a player leaves the tab open through reset.
 setInterval(()=>{if(!document.hidden){refreshStatus();void autoFeed()}},60000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
