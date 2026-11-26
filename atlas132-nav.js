/* Team Jura Atlas 13.2 · universal game-first navigation
 * Rendered on all published HTML routes by the static build, with a full
 * searchable page index. No game engines or stored player data altered. */
(()=>{'use strict';
const CATEGORIES=[
 {title:'START & COMMUNITY',prefix:'start',items:[['Home','atlas-dashboard.html'],['Choose a world','atlas97-journey.html'],['All 13 maps','maps.html'],['Guest progress & backup','atlas-account.html'],['Share the Atlas','atlas-share.html'],['One Last Ride','one-last-ride.html'],['Team Jura','team-jura.html'],['Elario Studios','elario.html']]},
 {title:'GAME MAPS & EXPLORERS',prefix:'maps',items:[['GTA V Story','atlas.html'],['GTA Online','atlas-online.html'],['GTA VI Story · Leonida','atlas-vi.html'],['GTA VI Story · Official map','atlas-vi.html?view=rockstar'],['Cayo Perico','heist-cayo-perico.html'],['GTA IV','atlas-iv.html'],['San Andreas','atlas-sa.html'],['Vice City','map-hub.html?game=vc'],['GTA III','map-hub.html?game=iii'],['Vice City Stories','map-hub.html?game=vcs'],['Liberty City Stories','map-hub.html?game=lcs'],['Chinatown Wars','map-hub.html?game=ctw'],['The Lost and Damned (TLAD)','atlas-iv.html?scope=tlad'],['The Ballad of Gay Tony (TBOGT)','atlas-iv.html?scope=tbogt'],['Map directory','maps.html']]},
 {title:'COLLECTIONS & PLAYER TOOLS',prefix:'tools',items:[['Universe database','atlas-database.html'],['GTA V vehicles','atlas90-vehicles5.html'],['GTA VI Vehicles','atlas90-vehicles6.html'],['GTA V Story Weapons','atlas90-weapons.html?world=story'],['GTA Online Weapons','atlas90-weapons.html'],['GTA VI Weapons','atlas90-weapons6.html'],['All searchable characters','atlas-characters.html'],['Animals','atlas-animals.html'],['Collectibles','atlas-collectibles.html'],['My Garage','atlas-forge-collections.html'],['My Crew','my-crew.html'],['Garage workshop','atlas-vehicle-configurator.html'],['Atlas Passport','atlas-passport.html'],['Tracker & HQ','atlas81-hq.html'],['Cheat sheets','atlas-cheats.html'],['Guides','guides.html'],['Activities','atlas-activities.html'],['Your toolkit','atlas-toolkit.html']]},
 {title:'HEISTS & MISSIONS',prefix:'heists',items:[['Heists HQ','heists.html'],['Cayo Perico heist','heist-cayo-perico.html'],['Diamond Casino','heist-diamond-casino.html'],['Doomsday Act I','heist-doomsday-act-1.html'],['Doomsday Act II','heist-doomsday-act-2.html'],['Doomsday Act III','heist-doomsday-act-3.html'],['Pacific Standard','heist-pacific-standard.html'],['Fleeca Job','heist-fleeca.html'],['Prison Break','heist-prison-break.html'],['Humane Labs','heist-humane-labs.html'],['Auto Shop','heist-auto-shop.html'],['Cluckin Bell','heist-cluckin-bell.html'],['Series A Funding','heist-series-a.html'],['Agency VIP Contract','heist-agency-vip.html'],['Salvage Yard','heist-salvage-yard.html'],['Kortz Center research','heist-kortz-center.html']]},
 {title:'RESEARCH & STUDIO',prefix:'research',items:[['GTA VI Research','atlas-research.html'],['Landmark Library','atlas98-landmarks.html'],['Newsroom','atlas-news.html'],['Online daily locations','atlas-online.html#j393-online-activity-slot'],['Atlas Dispatch','atlas93-dispatch.html'],['Source Registry','atlas-source-registry.html'],['Evidence & Verification','atlas-verification.html'],['Credits & Rights','atlas-credits.html'],['Style Lab','atlas98-style-lab.html'],['Data Lab','atlas98-data-lab.html']]}
];
// One small task-oriented menu. The full directory remains searchable.
const CORE=[
 {title:'CHOOSE YOUR GAME',prefix:'choose',items:[['GTA Online','atlas-online.html'],['GTA V Story','atlas.html'],['GTA VI Story','atlas-vi.html'],['Classic GTA & all 13 maps','maps.html']]},
 {title:'MY STUFF',prefix:'personal',items:[['My Garage','atlas-forge-collections.html'],['My Crew','my-crew.html'],['My Progress & backup','atlas-account.html']]},
 {title:'EXPLORE',prefix:'explore',items:[['Home','atlas-dashboard.html'],['Universe database','atlas-database.html'],['Heists & missions','heists.html'],['Guides','guides.html']]}
];
function currentWorld(){
 const page=location.pathname.split('/').pop(),args=new URLSearchParams(location.search);
 if(page==='atlas-online.html'||page?.startsWith('heist-')||['atlas87-daily.html','atlas93-dispatch.html'].includes(page))return 'online';
 if(page==='atlas.html')return 'story';
 if(['atlas-vi.html','atlas90-vehicles6.html','atlas90-weapons6.html','leonida-hq.html','atlas-research.html'].includes(page))return 'vi';
 if(['atlas90-vehicles5.html','atlas90-weapons.html'].includes(page))return args.get('world')==='story'?'story':'online';
 if(['atlas-activities.html','atlas-characters.html','atlas-database.html','atlas-collectibles.html','atlas-animals.html'].includes(page)){
  const scope=args.get(page==='atlas-activities.html'?'mode':'game');
  if(['story','online','vi'].includes(scope))return scope;
 }
 return null;
}
function worldTasks(){
 const scope=currentWorld();if(!scope)return null;
 const map={online:'atlas-online.html',story:'atlas.html',vi:'atlas-vi.html'}[scope];
 const gallery=scope==='vi'?'atlas90-vehicles6.html':'atlas90-vehicles5.html?world='+scope;
 const armory=scope==='vi'?'atlas90-weapons6.html':'atlas90-weapons.html?world='+scope;
 const items=[['Map & legend',map],['Collectibles','atlas-collectibles.html?game='+scope],['Vehicles',gallery],['Weapons',armory],['Characters','atlas-characters.html?game='+scope]];
 if(scope==='online')items.push(['Today’s activities','atlas-online.html#j393-online-activity-slot'],['Businesses','atlas-database.html?kind=business&game=online'],['Heists','heists.html']);
 else items.push(['Activities & missions','atlas-activities.html?mode='+scope]);
 if(scope==='vi')items.push(['Community research','atlas-research.html']);
 return {title:{online:'GTA ONLINE',story:'GTA V STORY',vi:'GTA VI STORY'}[scope]+' · YOUR GAME',prefix:'world',items};
}
// Retained URLs are intentionally excluded from ordinary navigation and search.
const LEGACY_ROUTES=new Set(['atlas97-journey.html','atlas93-dispatch.html','atlas-catalog.html','atlas8-preview.html','command-center.html','directory.html','discovery.html','explorer.html','legacy-explorer.html','leonida-hq.html','online-explorer.html']);
const isLegacy=url=>LEGACY_ROUTES.has(url.split(/[?#]/)[0]);
const CURRENT_ALIASES={title:'CURRENT PLAYER WORKSPACES',prefix:'current-alias',items:[['Home','atlas-dashboard.html','dashboard'],['All 13 maps','maps.html','start here choose a world discovery directory command center'],['Today’s activities','atlas-online.html#j393-online-activity-slot','dispatch daily intel online explorer'],['Gun Van location','atlas-online.html?event=gun-van#j393-online-activity-slot','gun van gunvan daily weapons vendor GTA Online'],["Shipwreck chest","atlas-online.html?event=shipwreck#j393-online-activity-slot","daily shipwrecks treasure"],["Street Dealers","atlas-online.html?event=street-dealers#j393-online-activity-slot","daily drug dealers"],["Smoke on the Water products","atlas-online.html?event=smoke-products#j393-online-activity-slot","daily smoke products"],["LS Tags posters","atlas-online.html?event=ls-tags#j393-online-activity-slot","daily graffiti spray posters"],["Hidden Caches","atlas-online.html?event=hidden-caches#j393-online-activity-slot","daily underwater caches"],["Junk Energy Skydives","atlas-online.html?event=junk-skydives#j393-online-activity-slot","daily parachute skydiving"],["Gun Van inventory","atlas-online.html?event=gun-van-stock#j393-online-activity-slot","weekly stock discounts weapons"],["Simeon requested vehicles","atlas-online.html?event=simeon-vehicles#j393-online-activity-slot","session requested cars export"],["Exotic Exports","atlas-online.html?event=exotic-exports#j393-online-activity-slot","session auto shop cars"],["Halloween Slashers","atlas-online.html?event=slashers#j393-online-activity-slot","seasonal free roam slasher"],["Cayo Treasure Chests","heist-cayo-perico.html","daily cayo chests buried stashes island"],['Universe database','atlas-database.html','vehicle location catalog'],['GTA VI Story','atlas-vi.html','leonida hq leonida explorer']]};
const ALL=new Set(CATEGORIES.flatMap(x=>x.items.map(y=>y[1].split(/[?#]/)[0])));
const safeHref=x=>/^[a-z0-9-]+\.html$/i.test(x);
const searchText=value=>String(value??'').normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().replace(/['’]/g,'').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const identityMatch=(value,s)=>{
 const n=searchText(value);
 if(!s||!n)return false;
 if(n.includes(s)||n.replace(/ /g,'')===s.replace(/ /g,''))return true;
 const words=s.split(' ');
 return words.length>1&&words.every(word=>n.split(' ').some(part=>part.startsWith(word)));
};
const recordKey=r=>String(r.id||'').split(':').pop();
function pageLink(a){const l=document.createElement('a');l.href='./'+a[1];l.textContent=a[0];
 const target=new URL(l.href),current=new URL(location.href);
 const pathnameMatch=current.pathname===target.pathname||(a[1]==='index.html'&&(current.pathname==='/'||current.pathname.endsWith('/index.html')));
 const scopedQuery=[...target.searchParams].every(([key,value])=>current.searchParams.get(key)===value);
 const armoryMatches=!target.pathname.endsWith('/atlas90-weapons.html')||
   (target.searchParams.get('world')==='story'?(current.searchParams.get('world')==='story'):(current.searchParams.get('world')!=='story'));
 if(pathnameMatch&&scopedQuery&&armoryMatches)l.setAttribute('aria-current','page');
 return l}
function build(){
 if(document.body.dataset.j4728Welcome==='true'||document.querySelector('#j132-nav-toggle'))return;
 // Normal Home links and brand shortcuts go to the gameplay homepage; explicit Welcome links remain valid.
 for(const link of document.querySelectorAll('a[href]')){
  let target;try{target=new URL(link.href,location.href)}catch{continue}
  if(target.origin!==location.origin||!target.pathname.endsWith('/index.html')||target.search||target.hash)continue;
  const label=(link.getAttribute('aria-label')||link.textContent||'').trim();
  if(/welcome|sign.in|guest/i.test(label))continue;
  if(link.classList.contains('brand')||/^(?:[⌂✦]\s*)?(?:home|back to home|back home)$/i.test(label))link.href='./atlas-dashboard.html';
 }
 const wrap=document.createElement('div');wrap.className='j132-nav';
 if(/^atlas(?:-online|-vi)?\.html$/i.test(location.pathname.split('/').pop()||''))wrap.classList.add('j132-map-nav');
 wrap.innerHTML='<button id="j132-nav-toggle" type="button" aria-controls="j132-nav-drawer" aria-expanded="false" aria-label="Open GTAE menu">☰ <span>MENU</span></button><aside id="j132-nav-drawer" aria-label="All GTAE navigation" hidden><div class="j132-nav-head"><img src="./art/elario-crest.svg" width="35" height="35" alt=""><div><strong>ELARIO STUDIOS · GTAE</strong><small>GTA EXPLORER · BY TEAM JURA</small></div><button type="button" class="j132-close" aria-label="Close site navigation">✕</button></div><label class="j132-search">Search GTAE<input type="search" id="j132-search" placeholder="Maps, garages, collectibles, heists..." autocomplete="off"></label><div class="j132-groups" id="j132-groups"></div><p class="j132-nav-tail">Many Crews. One Vision. · Independent GTA fan companion</p></aside>';
 const button=wrap.querySelector('#j132-nav-toggle'),drawer=wrap.querySelector('#j132-nav-drawer'),input=wrap.querySelector('#j132-search'),list=wrap.querySelector('#j132-groups');
 let allCategories=CATEGORIES.slice(),characterCategories=[],otherPages=[],directoryOpen=false;
 function rebuildCategories(){allCategories=[...CATEGORIES,...characterCategories,...otherPages];render(input.value)}
 function render(query=''){
  const q=query.trim().toLocaleLowerCase();list.replaceChildren();
  let shown=0;
  const contextual=worldTasks();
  if(!q){for(const group of [...(contextual?[contextual]:[]),...CORE]){const section=document.createElement('section');section.className='j132-group j4724-primary';const title=document.createElement('h3');title.textContent=group.title;section.append(title);for(const data of group.items){if(list.querySelectorAll('a').length&&[...list.querySelectorAll('a')].some(a=>a.getAttribute('href')==='./'+data[1]))continue;section.append(pageLink(data));}list.append(section);}const details=document.createElement('details');details.className='j4724-all-pages';details.open=directoryOpen;const summary=document.createElement('summary');summary.textContent='All pages & advanced tools';details.append(summary);details.addEventListener('toggle',()=>{directoryOpen=details.open});list.append(details);}
  const destination=q?list:list.querySelector('.j4724-all-pages');
  const groups=q?[...(contextual?[contextual]:[]),...CORE,CURRENT_ALIASES,...allCategories]:allCategories;
  const explicitArchive=q==='legacy archive';
  const seen=new Set(q?[]:[...list.querySelectorAll('.j4724-primary a')].map(a=>a.getAttribute('href').slice(2)));
  for(const group of groups){
    if(!q&&group.prefix==='characters')continue; // Search-only results, not an extra 36-item navigation dump.
    const matches=group.items.filter(([label,url,keywords,record])=>{
      if(isLegacy(url))return explicitArchive;
      if(group.prefix!=='characters')return (label+' '+url+' '+(keywords||'')).toLocaleLowerCase().includes(q);
      const s=searchText(q);
      if(!s||!record)return false;
      return [record.name,...(record.aliases||[])].some(x=>identityMatch(x,s))||
       searchText(recordKey(record)).replace(/ /g,'')===s.replace(/ /g,'')||
       searchText(keywords).includes(s);
    });
    const distinct=matches.filter(item=>{if(seen.has(item[1]))return false;seen.add(item[1]);return true});
    if(!distinct.length)continue;
    const section=document.createElement('section');section.className='j132-group';
    const title=document.createElement('h3');title.textContent=explicitArchive?'LEGACY ARCHIVE · RETAINED LINKS':group.title;section.append(title);
    for(const data of distinct){section.append(pageLink(data));shown++}destination.append(section);
  }
  if(q&&!shown){const msg=document.createElement('p');msg.textContent='No current pages matched. Try a game or feature name.';list.append(msg)}
 }
 const fullMenu=document.getElementById('j369-full-map-menu');
 let returnFocus=button;
 const open=(origin=button)=>{
   returnFocus=origin;
   if(origin===fullMenu){document.body.append(wrap);wrap.classList.add('j369-menu-portal');fullMenu.setAttribute('aria-expanded','true');}
   drawer.hidden=false;button.setAttribute('aria-expanded','true');wrap.classList.add('is-open');render(input.value);if(mapHost)drawer.querySelector('.j132-close').focus({preventScroll:true});else input.focus({preventScroll:true});
 };
 const close=(restoreFocus=true)=>{
   drawer.hidden=true;button.setAttribute('aria-expanded','false');wrap.classList.remove('is-open');if(fullMenu)fullMenu.setAttribute('aria-expanded','false');if(wrap.classList.contains('j369-menu-portal')){wrap.classList.remove('j369-menu-portal');mapHost?.append(wrap)}if(restoreFocus)returnFocus.focus({preventScroll:true});
 };
 button.addEventListener('click',()=>drawer.hidden?open():close());drawer.querySelector('.j132-close').addEventListener('click',()=>close());
 fullMenu?.addEventListener('click',()=>open(fullMenu));
 document.addEventListener('keydown',e=>{if(!drawer.hidden&&wrap.classList.contains('j369-menu-portal')&&e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();close()}},true);
 input.addEventListener('input',()=>render(input.value));
 document.addEventListener('keydown',e=>{
   if(drawer.hidden)return;
   if(e.key==='Escape'){e.preventDefault();close();return;}
   if(e.key!=='Tab')return;
   const focusables=[...drawer.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),summary')].filter(el=>el.getClientRects().length&&(!el.closest('details:not([open])')||el.tagName==='SUMMARY'));
   if(!focusables.length)return;
   const first=focusables[0],last=focusables[focusables.length-1];
   if(e.shiftKey&&(document.activeElement===first||!drawer.contains(document.activeElement))){e.preventDefault();last.focus();}
   else if(!e.shiftKey&&(document.activeElement===last||!drawer.contains(document.activeElement))){e.preventDefault();first.focus();}
 });
 document.addEventListener('pointerdown',e=>{if(!drawer.hidden&&!wrap.contains(e.target)&&!fullMenu?.contains(e.target))close(false)});
 // The Cayo heist keeps the searchable directory in its normal header flow.
 // Other pages retain their already-tested global navigation placement.
 const cayoHost=document.getElementById('j216-inline-mount');
 const mapHost=document.getElementById('j369-site-tools');
 if(cayoHost)cayoHost.append(wrap);
 else if(mapHost)mapHost.append(wrap);
 else {
   // A dedicated normal-flow menu row cannot cover another page action.
   // Prefer the page header when it is in flow, otherwise use the existing footer position.
   wrap.classList.add('j391-inline');
   // Rehome a legacy standalone All Maps link without changing its destination.
   const standaloneMaps=document.querySelector('body > a[data-j87-maps-link]');
   if(standaloneMaps)wrap.prepend(standaloneMaps);
   const header=document.querySelector('body > header');
   if(header&&!['fixed','absolute'].includes(getComputedStyle(header).position))header.after(wrap);
   else document.body.append(wrap);
 }
 render();
 // Production builder records all public HTML pages; expose the ones not in
 // the prominent categories under an honest "Other public pages" section.
 fetch('./atlas132-page-directory.json',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(data=>{
   if(!data||!Array.isArray(data.pages))return;
   const remainder=data.pages.filter(x=>x&&safeHref(x.path)&&!ALL.has(x.path)&&x.path!=='map-hub.html'&&x.path!=='index.html').map(x=>[String(x.title||x.path).replace(/\s*[|·].*$/,'').slice(0,80),x.path]);
   remainder.sort((a,b)=>a[0].localeCompare(b[0]));
   otherPages=remainder.length?[{title:'OTHER PUBLIC WORKSPACES & ARCHIVE',prefix:'other',items:remainder}]:[];
   rebuildCategories();
 }).catch(()=>{});
 // Include character records in the same global search field on every Atlas page.
 // The index is same-origin and labels/URLs are constructed with DOM textContent.
 fetch('./data/atlas-universe-profiles.json?v=222',{cache:'no-cache'}).then(r=>r.ok?r.json():null).then(data=>{
  if(!data||!Array.isArray(data.records))return;
  const worlds={classic:'Classic GTA',story:'GTA V Story',online:'GTA Online',vi:'GTA VI Story'};
  const items=data.records.filter(r=>r?.kind==='character'&&worlds[r.scope]).map(r=>[
   r.name+' · '+(r.scope==='classic'?r.game:worlds[r.scope]),
   'atlas-characters.html?game='+encodeURIComponent(r.scope)+(r.scope==='classic'?'&edition='+encodeURIComponent(r.game):'')+'&q='+encodeURIComponent(r.name)+'&profile='+encodeURIComponent(r.id)+'#mainCharacterEra',
   [r.game,worlds[r.scope],r.group,r.region,...(r.aliases||[])].filter(Boolean).join(' '),
   r
  ]).sort((a,b)=>a[0].localeCompare(b[0]));
  if(items.length)characterCategories=[{title:'CHARACTERS · SEARCH ALL WORLDS',prefix:'characters',items}];
  rebuildCategories();
 }).catch(()=>{});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',build,{once:true});else build();
})();
