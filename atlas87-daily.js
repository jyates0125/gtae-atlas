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
async function autoFeed(){
 try{const res=await fetch('./data/online-rotation-current.json',{cache:'no-cache'});if(res.ok)reviewed=C.safeSnapshot(await res.json())}catch(_){}
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
const links=document.createElement('div');links.className='j87-daily-links';for(const [label,url] of [['Game activities','./atlas-activities.html?mode=online'],['Find possible locations', './atlas-online.html?event='+encodeURIComponent(r.id)],['Source ↗',r.source||'./atlas-credits.html']]){let x=document.createElement('a');x.href=url;x.textContent=label;if(/^https?:/.test(url)){x.target='_blank';x.rel='noopener noreferrer'}links.append(x)}a.append(links);return a;}
function dashboard(){const root=$('j87-daily-list');if(!root)return;root.replaceChildren();for(const r of selected)root.append(card(r));let total=$('j87-daily-summary');if(total)total.textContent=`${selected.length} daily categories monitored · bundled reviewed data loads automatically · personal imports optional · no Rockstar account link`;}
function panel(){if(path!=='atlas-online.html')return;const side=$('sidebar');if(!side||$('#j87-daily-panel'))return;const section=document.createElement('section');section.id='j87-daily-panel';section.innerHTML='<div class="j87-daily-top"><span>◷ DAILY INTELLIGENCE</span><a href="./atlas87-daily.html">Open full dashboard ↗</a></div><p>Today’s map positions require a dated source. Potential locations are never shown as confirmed.</p><div id="j87-daily-panel-grid"></div>';
const anchor=$('jura83-panel');if(anchor)anchor.insertAdjacentElement('afterend',section);else side.prepend(section);
const grid=$('j87-daily-panel-grid');for(const r of selected.slice(0,7)){let row=document.createElement('a');row.href='./atlas87-daily.html#'+r.id;const st=status(r);row.className='j87-daily-mini';row.append(document.createTextNode(r.name));const badge=document.createElement('span');badge.textContent=st.type==='dated'?'DATED':'UNCONFIRMED';row.append(badge);grid.append(row)} }
function refreshStatus(){dashboard();if($('#j87-daily-panel')){$('#j87-daily-panel').remove();panel()}}
function init(){
 if(path==='atlas87-daily.html')dashboard();panel();autoFeed();
 if(path==='atlas87-daily.html'){const id=location.hash.slice(1);if(selected.some(r=>r.id===id))requestAnimationFrame(()=>document.getElementById(id)?.scrollIntoView({block:'start'}))}
 window.addEventListener('storage',e=>{if(e.key==='jura68-rotation-feed')refreshStatus()});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshStatus()});
 // Refresh evidence at most once a minute even if a player leaves the tab open through reset.
 setInterval(()=>{if(!document.hidden)refreshStatus()},60000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
