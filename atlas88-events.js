/* Team Jura Atlas 8.8 - event intelligence sidebar.
 * Reuses existing Team Jura rules/state. Does not invent active spawns.
 */
(()=>{'use strict';
const path=(location.pathname.split('/').pop()||'').toLowerCase();
if(path!=='atlas-online.html'&&path!=='atlas87-daily.html')return;
const C=window.JuraConditions;if(!C)return;
const $=id=>document.getElementById(id),mapPage=path==='atlas-online.html';
const icons=[[/ghost/i,'👻'],[/gun van/i,'🚐'],[/shipwreck/i,'⚓'],[/street dealer/i,'💊'],[/smoke on the water/i,'📦'],[/ls tag/i,'🎨'],[/hidden cache/i,'🫧'],[/skydive/i,'🪂'],[/treasure chest/i,'🗝️'],[/buried stash/i,'🪙'],[/stunt jump/i,'🏍️'],[/trial/i,'⏱️'],[/peyote/i,'🌵'],[/halloween|pumpkin|lantern/i,'🎃'],[/snowman|holiday/i,'☃️'],[/exotic export/i,'🚘'],[/stash house/i,'🏠'],[/ufo/i,'🛸'],[/animal/i,'🐾'],[/weekly/i,'📅']];
const icon=(r)=>icons.find(([re])=>re.test(r.name||''))?.[1]||'✦';
window.TeamJuraEventIcon88=Object.freeze({forName:n=>icon({name:n}),forRecord:r=>r?.activityId?icon(C.BY_ID[r.activityId]||r):null});
const read=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||'null')||d}catch{return d}};
let reviewedFeed={schema:1,rotations:{}},lastAttempt=0,pending=false;
const rotationFeed=()=>{let personal;try{personal=C.safeSnapshot(read('jura68-rotation-feed',{schema:1,rotations:{}}))}catch{}return C.selectRotationSnapshot(personal,reviewedFeed)};
const statusFor=r=>{const state=C.safeState(read('jura68-conditions-online',{}));if(/^ghost-/i.test(r.id)&&state.events.halloween!==true)return{status:'closed',reason:'Halloween mode is not enabled in this tracker. This is not a claim about Rockstar event availability.'};const raw=rotationFeed();let feed;try{feed=C.safeSnapshot(raw)}catch{feed={schema:1,rotations:{}}};const hour=read('jura68-online-hour',null);return C.evaluate(r.id,{mode:'online',state,snapshot:feed,hour:hour===null?NaN:Number(hour),now:Date.now()})};
const human=s=>({active:'ELIGIBLE · NOT LIVE VERIFIED',possible:'POSSIBLE · WHITE PIN',unknown:'NOT CONFIRMED',closed:'NOT ACTIVE',locked:'LOCKED',complete:'COMPLETED',research:'RESEARCH',excluded:'NOT IN THIS GAME', 'available-feed':'DATED SELECTION'})[s]||s.toUpperCase();
const mk=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e};
function groups(){const rs=C.rulesForMode('online');const listed=rs.filter(r=>['rotation','clock','clock-parent','seasonal','session','weekly','research'].includes(r.kind)||/ghost|halloween|ufo|peyote|snowmen|holiday/i.test(r.name));
 return listed.sort((a,b)=>{const rank=r=>/ghost/i.test(r.name)?0:r.kind==='rotation'?1:r.kind==='weekly'?2:r.kind==='seasonal'?3:4;return rank(a)-rank(b)||a.name.localeCompare(b.name)});
}
function install(){const home=$('sidebar')||document.querySelector('.j87-daily-main');if(!home)return;
 const panel=mk('section','j88-panel');panel.id='j88-events';panel.setAttribute('aria-label','Game events and daily marker status');
 const title=mk('h2','j88-heading','✦ EVENTS · WEEKLIES · GHOSTS');const intro=mk('p','j88-intro','All event types remain searchable. Yellow marks a player-selected or clock-eligible position, NOT proof that it is currently spawning. Expired events remain inactive.');
 const row=mk('div','j88-bar');const search=mk('input');search.type='search';search.placeholder='Search ghosts, daily, weekly…';search.setAttribute('aria-label','Search GTA Online event rules');const refresh=mk('button','','↻ Refresh status');refresh.type='button';row.append(search,refresh);
 const guide=mk('div','j88-status-guide');for(const [symbol,label,cls] of [['●','Eligible (not verified live)','active'],['●','Possible / off','possible'],['●','Unknown','unknown']]){const span=mk('span','j88-key '+cls,symbol+' '+label);guide.append(span)}
 const time=mk('label','j88-time','In-game hour (ghosts)');const hour=mk('select');hour.setAttribute('aria-label','GTA Online in-game hour');hour.add(new Option('Select in-game time',''));for(let h=0;h<24;h++)hour.add(new Option(String(h).padStart(2,'0')+':00',String(h)));let local=read('jura68-online-hour',null);hour.value=local===null?'':String(local);time.append(hour);
 const filter=mk('label','j88-event-toggle');const checkbox=mk('input');checkbox.type='checkbox';checkbox.checked=!!C.safeState(read('jura68-conditions-online',{})).events.halloween;filter.append(checkbox,mk('span','','Halloween event active in my session'));
 const note=mk('p','j88-note','This is a manual session setting, not automatic Rockstar detection. With this toggle off, ghost markers are treated as inactive in this tracker; official event availability is separate.');
 const seasonExpired=Date.now()>=Date.parse('2026-11-05T00:00:00Z')&&Date.now()<Date.parse('2027-01-01T00:00:00Z');
 if(seasonExpired){checkbox.checked=false;checkbox.disabled=true;filter.querySelector('span').textContent='Halloween 2026 · Not active (event ended Nov 4)';note.textContent='Halloween 2026 is archived. Search and map its previous locations; the old session toggle cannot reactivate expired events.';}

 const utc=mk('p','j88-note','');utc.setAttribute('role','status');utc.setAttribute('aria-label','Automatic real-world UTC reset clock');
 function updateUtc(){
  const now=new Date();const display=new Intl.DateTimeFormat('en-GB',{timeZone:'UTC',hour:'2-digit',minute:'2-digit',hour12:false}).format(now);
  const until=hour=>{const next=new Date(now);next.setUTCHours(hour,0,0,0);if(next<=now)next.setUTCDate(next.getUTCDate()+1);const minutes=Math.ceil((next-now)/60000);return Math.floor(minutes/60)+'h '+String(minutes%60).padStart(2,'0')+'m'};
  utc.textContent='UTC '+display+' · Most daily reset 06:00 UTC ('+until(6)+') · Street Dealers 07:00 UTC ('+until(7)+'). Source confirmation required for active locations.';
 }
 const results=mk('div','j88-results');panel.append(title,intro,utc,row,guide,time,filter,note,results);updateUtc();setInterval(updateUtc,60000);
 if(mapPage){const anchor=$('j87-daily-panel')||$('jura83-panel');if(anchor)anchor.insertAdjacentElement('afterend',panel);else home.prepend(panel)}else home.append(panel);
 let category='all';const tabs=mk('div','j88-tabs');for(const [id,label] of [['all','All'],['ghost','👻 Ghosts'],['daily','◷ Daily'],['other','★ Other']]){const b=mk('button','',''+label);b.type='button';b.dataset.type=id;b.setAttribute('aria-pressed',String(id===category));b.onclick=()=>{category=id;for(const x of tabs.children)x.setAttribute('aria-pressed',String(x===b));render()};tabs.append(b)}panel.insertBefore(tabs,guide);
 const focused=mk('p','j88-note','');focused.setAttribute('role','status');panel.insertBefore(focused,results);
 const clear=mk('button','','Clear event focus');clear.type='button';clear.hidden=true;clear.onclick=()=>{window.JuraAtlasEventLocations?.clear();focused.textContent='Event map filter cleared.';clear.hidden=true};panel.insertBefore(clear,results);
 function locate(r){
  if(r.id==='cayo-chests'){window.location.href='./heist-cayo-perico.html';return}
  if(!mapPage){window.location.href='./atlas-online.html?event='+encodeURIComponent(r.id);return}
  const bridge=window.JuraAtlasEventLocations;
  if(!bridge){focused.textContent='The map is still loading its sources. Use the map search or try again.';return}
  const result=bridge.focus(r);
  if(result.count){focused.textContent=`Showing ${result.count} sourced research marker${result.count===1?'':'s'} for ${r.name}. A mapped possibility does not prove it is active today. Your regular map filters are preserved.`;clear.hidden=false;const drawer=$('atlasFilterDrawer');if(drawer)drawer.open=true}
  else{focused.textContent=`No reusable mapped positions for ${r.name} are currently loaded. The event rule and source reference remain available, but we will not invent pins.`;clear.hidden=true}
 }

 function render(){results.replaceChildren();let num=0;for(const r of groups()){
  const matchType=category==='all'||category==='ghost'&&/ghost/i.test(r.name)||category==='daily'&&r.kind==='rotation'||category==='other'&&r.kind!=='rotation'&&!/ghost/i.test(r.name);if(!matchType)continue;
  if(search.value&&![r.name,r.group,r.detail].join(' ').toLowerCase().includes(search.value.toLowerCase()))continue;
  const st=statusFor(r),card=mk('article','j88-event-card'+(st.status==='closed'?' j393-closed':'')),top=mk('div','j88-event-top'),symbol=mk('span','j88-emoji',icon(r)),name=mk('strong','',r.name),badge=mk('span','j88-status j88-'+st.status,human(st.status));top.append(symbol,name,badge);card.append(top);
  const desc=mk('small','',st.reason||'Status currently unavailable');card.append(desc);const actions=mk('div','j88-actions'),map=mk('button','','Find on map'),source=mk('a','','Source ↗');map.type='button';map.textContent=r.id==='cayo-chests'?'Open Cayo map':st.status==='closed'?'Toggle / inspect archived layer':'Find on map';map.onclick=()=>locate(r);source.href=r.source||'./atlas-credits.html';if(/^https?:/.test(source.href)){source.target='_blank';source.rel='noopener noreferrer'}actions.append(map,source);card.append(actions);results.append(card);num++;
 }if(!num)results.append(mk('p','j88-note','No matching event rules.'));}
 const redrawMap=()=>{if(mapPage)window.JuraAtlasEventLocations?.refresh()};
 document.addEventListener('jura:event-focus-cleared',()=>{clear.hidden=true;focused.textContent='Returned to your usual map filters.'});
 search.oninput=render;refresh.onclick=()=>{render();redrawMap();void loadReviewed(true)};hour.onchange=()=>{try{localStorage.setItem('jura68-online-hour',JSON.stringify(hour.value))}catch{}render();redrawMap()};checkbox.onchange=()=>{if(checkbox.disabled)return;let state=C.safeState(read('jura68-conditions-online',{}));state.events.halloween=checkbox.checked;try{localStorage.setItem('jura68-conditions-online',JSON.stringify(state))}catch{}render();redrawMap()};
 window.addEventListener('storage',e=>{if(['jura68-conditions-online','jura68-online-hour','jura68-rotation-feed'].includes(e.key)){render();redrawMap()}});
 let lastEvidence='';function refreshEvidence(){
  if(document.hidden)return;
  void loadReviewed();
  const signature=groups().map(r=>{const s=statusFor(r);return r.id+':'+s.status+':'+s.reason}).join('|');
  if(signature!==lastEvidence){lastEvidence=signature;render();redrawMap()}
 }
 setInterval(refreshEvidence,60000);document.addEventListener('visibilitychange',refreshEvidence);
 // A dashboard deep link selects only the requested Online rule. Retry after async map sources arrive.
 const requested=new URLSearchParams(location.search).get('event');
 const requestedRule=mapPage&&groups().find(r=>r.id===requested);
 if(requestedRule){category='all';search.value=requestedRule.name;let attempts=0;const tryFocus=()=>{
  if(++attempts>12)return;
  const bridge=window.JuraAtlasEventLocations;
  if(bridge&&bridge.count(requestedRule)>0){locate(requestedRule);return}
  if(attempts===12){locate(requestedRule);return}
  setTimeout(tryFocus,500);
 };setTimeout(tryFocus,100);}
 render();
 // Shared published/bundled rotation selection. Expired data remains unknown.
 async function loadReviewed(force=false){
  if(pending||(!force&&Date.now()-lastAttempt<300000))return;
  pending=true;lastAttempt=Date.now();
  try{reviewedFeed=await C.loadPublishedRotations(fetch,'./data/online-rotation-current.json?update=1',reviewedFeed);render();redrawMap()}catch{}finally{pending=false}
 }
 void loadReviewed();

}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
