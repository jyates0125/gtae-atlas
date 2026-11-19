/* Team Jura Atlas 13.2 · universal game-first navigation
 * Rendered on all published HTML routes by the static build, with a full
 * searchable page index. No game engines or stored player data altered. */
(()=>{'use strict';
const CATEGORIES=[
 {title:'START & COMMUNITY',prefix:'start',items:[['Welcome','index.html'],['Enter Atlas dashboard','atlas-dashboard.html'],['Choose a world','atlas97-journey.html'],['All 13 maps','maps.html'],['Optional account & backup','atlas-account.html'],['Share the Atlas','atlas-share.html'],['One Last Ride','one-last-ride.html'],['Team Jura','team-jura.html'],['Elario Studios','elario.html']]},
 {title:'GAME MAPS & EXPLORERS',prefix:'maps',items:[['GTA V Story','atlas.html'],['GTA Online','atlas-online.html'],['GTA VI Research','atlas-vi.html'],['Cayo Perico','atlas-cayo.html'],['GTA IV','atlas-iv.html'],['San Andreas','atlas-sa.html'],['Classic GTA worlds','map-hub.html'],['Map directory','maps.html']]},
 {title:'COLLECTIONS & PLAYER TOOLS',prefix:'tools',items:[['Universe database','atlas-database.html'],['GTA V vehicles','atlas90-vehicles5.html'],['GTA VI vehicle research','atlas90-vehicles6.html'],['Weapons','atlas90-weapons.html'],['Characters','atlas-characters.html'],['Animals','atlas-animals.html'],['Collectibles','atlas-collectibles.html'],['My Garage','atlas93-garage.html'],['Vehicle 3D concept','atlas-vehicle-configurator.html'],['Atlas Passport','atlas-passport.html'],['Tracker & HQ','atlas81-hq.html'],['Cheat sheets','atlas-cheats.html'],['Guides','guides.html'],['Activities','atlas-activities.html'],['Your toolkit','atlas-toolkit.html']]},
 {title:'HEISTS & MISSIONS',prefix:'heists',items:[['Heists HQ','heists.html'],['Cayo Perico heist','heist-cayo-perico.html'],['Diamond Casino','heist-diamond-casino.html'],['Doomsday Act I','heist-doomsday-act-1.html'],['Doomsday Act II','heist-doomsday-act-2.html'],['Doomsday Act III','heist-doomsday-act-3.html'],['Pacific Standard','heist-pacific-standard.html'],['Fleeca Job','heist-fleeca.html'],['Prison Break','heist-prison-break.html'],['Humane Labs','heist-humane-labs.html'],['Auto Shop','heist-auto-shop.html'],['Cluckin Bell','heist-cluckin-bell.html']]},
 {title:'RESEARCH & STUDIO',prefix:'research',items:[['GTA VI Research','atlas-research.html'],['Landmark Library','atlas98-landmarks.html'],['Newsroom','atlas-news.html'],['Daily Intel','atlas87-daily.html'],['Atlas Dispatch','atlas93-dispatch.html'],['Source Registry','atlas-source-registry.html'],['Evidence & Verification','atlas-verification.html'],['Credits & Rights','atlas-credits.html'],['Style Lab','atlas98-style-lab.html'],['Data Lab','atlas98-data-lab.html']]}
];
const ALL=new Set(CATEGORIES.flatMap(x=>x.items.map(y=>y[1])));
const safeHref=x=>/^[a-z0-9-]+\.html$/i.test(x);
function pageLink(a){const l=document.createElement('a');l.href='./'+a[1];l.textContent=a[0];if(location.pathname.endsWith('/'+a[1])||(a[1]==='index.html'&&(location.pathname==='/'||location.pathname.endsWith('/index.html')))){l.setAttribute('aria-current','page')}return l}
function build(){
 if(document.querySelector('#j132-nav-toggle'))return;
 const wrap=document.createElement('div');wrap.className='j132-nav';
 if(/^atlas(?:-online|-vi)?\.html$/i.test(location.pathname.split('/').pop()||''))wrap.classList.add('j132-map-nav');
 wrap.innerHTML='<button id="j132-nav-toggle" type="button" aria-controls="j132-nav-drawer" aria-expanded="false" aria-label="Open all Team Jura pages">☰ <span>ALL PAGES</span></button><aside id="j132-nav-drawer" aria-label="All Team Jura navigation" hidden><div class="j132-nav-head"><img src="./art/elario-crest.svg" width="35" height="35" alt=""><div><strong>ELARIO STUDIOS · TEAM JURA</strong><small>EXPLORE EVERY ATLAS EXPERIENCE</small></div><button type="button" class="j132-close" aria-label="Close site navigation">✕</button></div><label class="j132-search">Search every page<input type="search" id="j132-search" placeholder="Maps, garages, collectibles, heists..." autocomplete="off"></label><div class="j132-groups" id="j132-groups"></div><p class="j132-nav-tail">Many Crews. One Vision. · Independent GTA fan companion</p></aside>';
 const button=wrap.querySelector('#j132-nav-toggle'),drawer=wrap.querySelector('#j132-nav-drawer'),input=wrap.querySelector('#j132-search'),list=wrap.querySelector('#j132-groups');
 let allCategories=CATEGORIES.slice();
 function render(query=''){
  const q=query.trim().toLocaleLowerCase();list.replaceChildren();
  let shown=0;
  for(const group of allCategories){
    const matches=group.items.filter(([label,url])=>(label+' '+url).toLocaleLowerCase().includes(q));
    if(!matches.length)continue;
    const section=document.createElement('section');section.className='j132-group';
    const title=document.createElement('h3');title.textContent=group.title;section.append(title);
    for(const data of matches){section.append(pageLink(data));shown++}list.append(section);
  }
  if(!shown){const msg=document.createElement('p');msg.textContent='No pages matched. Try a game or feature name.';list.append(msg)}
 }
 const open=()=>{
   drawer.hidden=false;button.setAttribute('aria-expanded','true');wrap.classList.add('is-open');render(input.value);input.focus();
 };
 const close=(restoreFocus=true)=>{
   drawer.hidden=true;button.setAttribute('aria-expanded','false');wrap.classList.remove('is-open');if(restoreFocus)button.focus();
 };
 button.addEventListener('click',()=>drawer.hidden?open():close());drawer.querySelector('.j132-close').addEventListener('click',close);
 input.addEventListener('input',()=>render(input.value));
 document.addEventListener('keydown',e=>{
   if(drawer.hidden)return;
   if(e.key==='Escape'){e.preventDefault();close();return;}
   if(e.key!=='Tab')return;
   const focusables=[...drawer.querySelectorAll('a[href],button:not([disabled]),input:not([disabled])')].filter(el=>el.getClientRects().length);
   if(!focusables.length)return;
   const first=focusables[0],last=focusables[focusables.length-1];
   if(e.shiftKey&&(document.activeElement===first||!drawer.contains(document.activeElement))){e.preventDefault();last.focus();}
   else if(!e.shiftKey&&(document.activeElement===last||!drawer.contains(document.activeElement))){e.preventDefault();first.focus();}
 });
 document.addEventListener('pointerdown',e=>{if(!drawer.hidden&&!wrap.contains(e.target))close(false)});
 document.body.append(wrap);render();
 // Production builder records all public HTML pages; expose the ones not in
 // the prominent categories under an honest "Other public pages" section.
 fetch('./atlas132-page-directory.json',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(data=>{
   if(!data||!Array.isArray(data.pages))return;
   const remainder=data.pages.filter(x=>x&&safeHref(x.path)&&!ALL.has(x.path)).map(x=>[String(x.title||x.path).replace(/\s*[|·].*$/,'').slice(0,80),x.path]);
   remainder.sort((a,b)=>a[0].localeCompare(b[0]));
   if(remainder.length)allCategories=[...CATEGORIES,{title:'OTHER PUBLIC WORKSPACES & ARCHIVE',prefix:'other',items:remainder}];
   render(input.value);
 }).catch(()=>{});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',build,{once:true});else build();
})();
