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
let reviewedFeed={schema:1,rotations:{}},pending=false;
const rotationFeed=()=>{let personal;try{personal=C.safeSnapshot(read('jura68-rotation-feed',{schema:1,rotations:{}}))}catch{}return C.selectRotationSnapshot(personal,reviewedFeed)};
const statusFor=r=>{const state=C.safeState(read('jura68-conditions-online',{}));const raw=rotationFeed();let feed;try{feed=C.safeSnapshot(raw)}catch{feed={schema:1,rotations:{}}};const hour=read('jura68-online-hour',null);return C.evaluate(r.id,{mode:'online',state,snapshot:feed,hour:hour===null||hour===''?NaN:Number(hour),slasherSession:window.JuraSlasherSession,now:Date.now()})};
const human=s=>({active:'ELIGIBLE · NOT LIVE VERIFIED',possible:'REFERENCE / NOT ACTIVE',unknown:'NOT CONFIRMED',closed:'NOT ACTIVE',locked:'REQUIREMENTS',complete:'COMPLETED',research:'RESEARCH',excluded:'NOT IN THIS GAME', 'available-feed':'DATED SELECTION'})[s]||s.toUpperCase();
const mk=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e};
function groups(){const rs=C.rulesForMode('online');const listed=rs.filter(r=>['rotation','clock','clock-parent','seasonal','session','weekly','research'].includes(r.kind)||/ghost|halloween|ufo|peyote|snowmen|holiday/i.test(r.name));
 return listed.sort((a,b)=>{const rank=r=>r.kind==='rotation'?0:/ghost/i.test(r.name)?2:r.kind==='weekly'?2:r.kind==='seasonal'?3:4;return rank(a)-rank(b)||a.name.localeCompare(b.name)});
}
function install(){const home=$('sidebar')||document.querySelector('.j87-daily-main');if(!home)return;
 const panel=mk('section','j88-panel');panel.id='j88-events';panel.setAttribute('aria-label','Game events and daily marker status');
 const title=mk('h2','j88-heading','EVENTS & DAILY ACTIVITIES');const intro=mk('p','j88-intro','Activity colors identify marker types; a small gold dot indicates an eligible/current marker. Inactive and unconfirmed locations remain in the list, not as live pins. Dated selections only. Not gameplay-verified.');
 const row=mk('div','j88-bar');const search=mk('input');search.type='search';search.placeholder='Search ghosts, daily, weekly…';search.setAttribute('aria-label','Search GTA Online event rules');const refresh=mk('button','','↻ Refresh status');refresh.type='button';row.append(search,refresh);
 const guide=mk('div','j88-status-guide');for(const [symbol,label,cls] of [['●','Eligible (not verified live)','active'],['—','Inactive / reference','possible'],['●','Unknown','unknown']]){const span=mk('span','j88-key '+cls,symbol+' '+label);guide.append(span)}
 const time=mk('label','j88-time','In-game hour (timed events)');const hour=mk('select');hour.setAttribute('aria-label','GTA Online in-game hour');hour.add(new Option('Select in-game time',''));for(let h=0;h<24;h++)hour.add(new Option(String(h).padStart(2,'0')+':00',String(h)));let local=read('jura68-online-hour',null);hour.value=local===null?'':String(local);time.append(hour);
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
 const slasher=mk('details','j393-slasher');slasher.append(mk('summary','','Slasher search areas · 01:00–06:00 game time'));
 slasher.append(mk('p','j88-note','When the Halloween event is enabled, confirm the session conditions below. The red circles are approximate search guides, not exact spawn boundaries. A Clone Slasher may replace the regional encounter.'));
 const session=window.JuraSlasherSession={freeroam:false,elapsed:false,vehicle:false,cooldown:false};
 for(const [key,label] of [['freeroam','Outside in freemode'],['elapsed','In this session at least 16 minutes'],['vehicle','On foot or ordinary vehicle'],['cooldown','15-minute encounter cooldown clear']]){const line=mk('label','j88-event-toggle'),check=mk('input');check.type='checkbox';line.append(check,mk('span','',label));check.onchange=()=>{session[key]=check.checked;render();redrawMap()};slasher.append(line)}
 const reset=mk('button','','Reset session conditions');reset.type='button';reset.onclick=()=>{for(const key of Object.keys(session))session[key]=false;for(const check of slasher.querySelectorAll('input'))check.checked=false;render();redrawMap()};slasher.append(reset);
 const evidence=mk('p','j88-note','');const credit=mk('a','','Activity sources & credits');credit.href='./atlas-credits.html#activity-evidence';evidence.append(credit);
 const results=mk('div','j88-results');panel.append(title,intro,utc,row,guide,time,filter,note,slasher,results,evidence);updateUtc();setInterval(updateUtc,60000);
 if(mapPage){const slot=$('j393-online-activity-slot');if(slot){slot.append(panel);const reveal=()=>{if(location.hash!=='#j393-online-activity-slot')return;const drawer=$('atlasFilterDrawer');if(drawer)drawer.open=true;const extra=slot.closest('details.j4730-advanced-events');if(extra)extra.open=true;$('sidebar')?.classList.remove('mobile-collapsed');requestAnimationFrame(()=>slot.scrollIntoView({block:'start'}))};window.addEventListener('hashchange',reveal);if(!new URLSearchParams(location.search).has('event'))reveal()}else home.prepend(panel);document.querySelector('.j4723-legend-jump')?.addEventListener('click',()=>{const drawer=$('atlasFilterDrawer');if(drawer)drawer.open=true;});}else home.append(panel);
 let category='all';const tabs=mk('div','j88-tabs');for(const [id,label] of [['all','All'],['ghost','👻 Ghosts'],['daily','◷ Daily'],['other','★ Other']]){const b=mk('button','',''+label);b.type='button';b.dataset.type=id;b.setAttribute('aria-pressed',String(id===category));b.onclick=()=>{category=id;for(const x of tabs.children)x.setAttribute('aria-pressed',String(x===b));render()};tabs.append(b)}panel.insertBefore(tabs,guide);
 const focused=mk('p','j88-note','');focused.setAttribute('role','status');panel.insertBefore(focused,results);
 const clear=mk('button','','Clear event focus');clear.type='button';clear.hidden=true;clear.onclick=()=>{window.JuraAtlasEventLocations?.clear();focused.textContent='Event map filter cleared.';clear.hidden=true};panel.insertBefore(clear,results);
 let openGuideId=null;
 function locate(r){
  if(r.id==='slashers'&&mapPage){slasher.open=true;const zones=window.JuraAtlasEventLocations?.zones()||[];focused.textContent=zones.length?zones.length+' approximate red search areas visible; encounter is random.':'No eligible search areas now. Check event, time and session conditions.';return}
  if(r.id==='cayo-chests'){window.location.href='./heist-cayo-perico.html#j4740-chests';return}
  if(r.id==='cayo-stashes'){window.location.href='./heist-cayo-perico.html#j4740-stashes';return}
  if(r.kind==='weekly'){focused.textContent='Weekly inventory and discounts are separate from the daily Gun Van location. No weekly map pin is implied.';return}
  if(!mapPage){window.location.href='./atlas-online.html?event='+encodeURIComponent(r.id);return}
  const bridge=window.JuraAtlasEventLocations;
  if(!bridge){focused.textContent='The map is still loading its sources. Use the map search or try again.';return}
  const result=bridge.focus(r,{center:true});
  if(result.count){focused.textContent=`${result.count} source references for ${r.name}; ${result.available??0} eligible map pins. Inactive locations remain in the list. Your regular map filters are preserved.`;clear.hidden=false;const drawer=$('atlasFilterDrawer');if(drawer)drawer.open=true}
  else{focused.textContent=`No reusable mapped positions for ${r.name} are currently loaded. The event rule and source reference remain available, but we will not invent pins.`;clear.hidden=true}
 }

 function render(){results.replaceChildren();let num=0;for(const r of groups()){
  const matchType=category==='all'||category==='ghost'&&/ghost/i.test(r.name)||category==='daily'&&r.kind==='rotation'||category==='other'&&r.kind!=='rotation'&&!/ghost/i.test(r.name);if(!matchType)continue;
  if(search.value&&![r.name,r.group,r.detail].join(' ').toLowerCase().includes(search.value.toLowerCase()))continue;
  const st=statusFor(r),card=mk('article','j88-event-card'+(st.status==='closed'?' j393-closed':'')),top=mk('div','j88-event-top'),symbol=mk('span','j88-emoji',icon(r)),name=mk('strong','',r.name),badge=mk('span','j88-status j88-'+st.status,human(st.status));top.append(symbol,name,badge);card.append(top);
  card.dataset.eventId=r.id;
  const desc=mk('small','',st.status==='available-feed'?'Current dated selection · not gameplay verified':st.reason||'Status currently unavailable');card.append(desc);
  if(r.kind==='rotation'&&st.status==='available-feed'){const feed=C.rotationFeed(rotationFeed(),r.id);const names=C.mainlandRotationReferences('online',reviewedFeed).filter(x=>feed?.active.has(x.rotationMarkerId)).map(x=>x.name.replace(/^[^·]+·\s*/,''));if(names.length)card.append(mk('p','j4723-current-locations',names.join(' · ')));}
  const details=mk('details','j395-guide');details.open=openGuideId===r.id;details.append(mk('summary','','How to play / requirements'),mk('p','',r.detail));
  const h=read('jura68-online-hour',null),steps=C.activityGuidance?.(r.id,{state:C.safeState(read('jura68-conditions-online',{})),hour:h===null||h===''?NaN:Number(h),slasherSession:window.JuraSlasherSession})||[];
  if(steps.length){const list=mk('ul','');for(const step of steps)list.append(mk('li','',(step.met?'✓ ':'○ ')+step.label));details.append(list)}
  details.addEventListener('toggle',()=>{if(details.open)openGuideId=r.id;else if(openGuideId===r.id)openGuideId=null});card.append(details);const actions=mk('div','j88-actions'),map=mk('button','','Find on map'),source=mk('a','','Source ↗');map.type='button';map.textContent=['cayo-chests','cayo-stashes'].includes(r.id)?'Open Cayo island map':r.kind==='weekly'?'View requirements & status':st.status==='closed'?'View reference info':'Find on map';map.onclick=()=>{details.open=true;openGuideId=r.id;locate(r)};source.href=r.source||'./atlas-credits.html';if(/^https?:/.test(source.href)){source.target='_blank';source.rel='noopener noreferrer'}if(mapPage&&!['cayo-chests','cayo-stashes','gun-van-stock'].includes(r.id)){const toggle=mk('button','j393-event-switch');toggle.type='button';const sync=()=>{const on=window.JuraAtlasEventLocations?.enabled(r.id)!==false;toggle.setAttribute('aria-pressed',String(on));toggle.textContent=on?'Pins on':'Pins off';toggle.setAttribute('aria-label',(on?'Hide ':'Show ')+r.name+' pins')};sync();toggle.onclick=()=>{const bridge=window.JuraAtlasEventLocations;bridge?.setEnabled(r.id,!bridge.enabled(r.id));sync()};actions.append(toggle)}actions.append(map);card.append(actions);results.append(card);num++;
 }if(!num)results.append(mk('p','j88-note','No matching event rules.'));}
 const redrawMap=()=>{if(mapPage)window.JuraAtlasEventLocations?.refresh()};
 const syncWorld=()=>{if(mapPage){const scope=window.JuraDualLegendAPI?.state();panel.hidden=!!scope&&(scope.game!=='5'||scope.mode!=='online')}};document.addEventListener('jura:legend-updated',syncWorld);syncWorld();
 document.addEventListener('jura:event-focus-cleared',()=>{clear.hidden=true;focused.textContent='Returned to your usual map filters.'});
 search.oninput=render;refresh.onclick=()=>{render();redrawMap();void loadReviewed(true)};hour.onchange=()=>{try{localStorage.setItem('jura68-online-hour',JSON.stringify(hour.value))}catch{}render();redrawMap()};checkbox.onchange=()=>{if(checkbox.disabled)return;let state=C.safeState(read('jura68-conditions-online',{}));state.events.halloween=checkbox.checked;try{localStorage.setItem('jura68-conditions-online',JSON.stringify(state))}catch{}render();redrawMap()};
 window.addEventListener('storage',e=>{if(['jura68-conditions-online','jura68-online-hour','jura68-rotation-feed'].includes(e.key)){render();redrawMap()}});
 let lastEvidence='';function refreshEvidence(){
  if(document.hidden)return;
  void loadReviewed();
  const signature=groups().map(r=>{const s=statusFor(r);return r.id+':'+s.status+':'+s.reason}).join('|');
  if(signature!==lastEvidence){lastEvidence=signature;render();redrawMap()}
 }
 setInterval(refreshEvidence,C.ROTATION_STATUS_MS);document.addEventListener('visibilitychange',refreshEvidence);
 // A dashboard deep link selects only the requested Online rule. Retry after async map sources arrive.
 const requested=new URLSearchParams(location.search).get('event');
 if(mapPage&&['cayo-chests','cayo-stashes'].includes(requested)){location.replace(requested==='cayo-chests'?'./heist-cayo-perico.html#j4740-chests':'./heist-cayo-perico.html#j4740-stashes');return}
 const requestedRule=mapPage&&groups().find(r=>r.id===requested);
 let reviewedReady=false;
 if(requestedRule){const drawer=$('atlasFilterDrawer');if(drawer)drawer.open=true;const extra=$('j393-online-activity-slot')?.closest('details.j4730-advanced-events');if(extra)extra.open=true;category='all';search.value=requestedRule.name;openGuideId=requestedRule.id;let attempts=0;
  const guideOnly=requestedRule.kind==='weekly'||['cayo-stashes','cayo-chests','slashers'].includes(requestedRule.id);
  const tryFocus=()=>{
   if(search.value!==requestedRule.name||category!=='all'||document.hidden)return;
   const bridge=window.JuraAtlasEventLocations;
   const dated=statusFor(requestedRule).status==='available-feed';
   const ready=bridge&&bridge.count(requestedRule)>0&&(!dated||bridge.availableCount(requestedRule)>0);
   if(guideOnly||(++attempts>=40)||(reviewedReady&&ready)){locate(requestedRule);if(extra){extra.open=true;$('sidebar')?.classList.remove('mobile-collapsed')}return}
   setTimeout(tryFocus,500);
  };setTimeout(tryFocus,100);
 }
 render();
 // Shared published/bundled rotation selection. Expired data remains unknown.
 async function loadReviewed(force=false){
  if(pending)return;
  pending=true;
  try{reviewedFeed=await C.refreshPublishedRotations(fetch,reviewedFeed,{force});render();redrawMap()}catch{}finally{pending=false;reviewedReady=true}
 }
 void loadReviewed();

}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
