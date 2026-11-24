/* Team Jura Atlas 13.1 · multi-generation, edition-specific sourced codes and Rockstar newsroom. */
(()=>{'use strict';
const $=id=>document.getElementById(id),MODE=document.body.dataset.hub;
const node=(tag,cls,txt)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(txt!==undefined)el.textContent=String(txt);return el};
const PS_TO_XBOX={Cross:'A',Circle:'B',Square:'X',Triangle:'Y',L1:'LB',L2:'LT',R1:'RB',R2:'RT'};
const PS_TO_ORIGINAL_XBOX={...PS_TO_XBOX,L1:'LT',L2:'WHITE',R1:'RT',R2:'BLACK'};
const PS3_HD={L1:'L2',L2:'L1',R1:'R2',R2:'R1'};
const X360_SWAP={LB:'LT',LT:'LB',RB:'RT',RT:'RB'};
const MODERN_PHONE=new Set(['pc','ps4','ps5','xone','xsx']);
const V_VERSIONS=new Set(['pc','ps3','ps4','ps5','x360','xone','xsx']);
const SA_VERSIONS=new Set(['pc','ps2','ps3','ps3hd','ps4','ps5','xbox','x360','xone360','xone','xsx']);
let db=null;
function status(t){const el=$('hubCount');if(el)el.textContent=t}
function link(label,href){const a=node('a','',label);a.href=href;a.target='_blank';a.rel='noopener noreferrer';return a}
function safeURL(url){try{const x=new URL(url);return x.protocol==='https:'?x.href:null}catch{return null}}
async function copyText(s){try{if(!navigator.clipboard)throw Error('clipboard unavailable');await navigator.clipboard.writeText(s);status('Copied '+s+' · single-player only')}catch{status('Copy unavailable. Select the visible code and copy manually.')}}
function tokens(item,platform){
 if(!item.ps)return null;
 let raw=item.ps.split(/\s+/).filter(Boolean),mapped;
 if(platform==='psp'&&['lcs','vcs','ctw'].includes(item.game))mapped=raw.map(t=>({L1:'L',R1:'R'}[t]||t));
 else if(platform==='ps3hd'&&item.game==='sa')mapped=raw.map(t=>PS3_HD[t]||t);
 else if(['ps2','ps3','ps4','ps5'].includes(platform))mapped=raw;
 else if(platform==='xbox'&&item.game==='sa')mapped=raw.map(t=>PS_TO_ORIGINAL_XBOX[t]||t);
 else if(['x360','xone360'].includes(platform)&&item.game==='sa')mapped=raw.map(t=>X360_SWAP[PS_TO_XBOX[t]]||PS_TO_XBOX[t]||t);
 else if(platform.startsWith('x'))mapped=raw.map(t=>PS_TO_XBOX[t]||t);
 else mapped=raw;
 return mapped.join(' · ');
}
function available(item,platform){
 const game=item.game,iv=['iv','tlad','tbogt'].includes(game);
 if(iv)return ['pc','ps3','x360','xone360','xsx'].includes(platform);
 if(['lcs','vcs'].includes(game))return ['psp','ps2'].includes(platform)&&Boolean(item.ps);
 if(game==='ctw')return platform==='psp'?Boolean(item.ps):platform==='nds'?Boolean(item.ds):platform==='mobile'?Boolean(item.mobile):false;
 if(game==='story'&&!V_VERSIONS.has(platform))return false;
 if(game==='sa'&&!SA_VERSIONS.has(platform))return false;
 if(['iii','vc'].includes(game)&&!['pc','ps2','ps3','ps4','ps5','xbox','xone','xsx'].includes(platform))return false;
 if(item.versions==='gen8plus'&&['ps3','x360'].includes(platform))return false;
 if(item.versions==='definitive-only'&&!['ps4','ps5','xone','xsx'].includes(platform))return false;
 if(item.versions==='original-only'&&['ps4','ps5','xone','xsx'].includes(platform))return false;
 if(platform==='pc'&&!item.code&&!item.phone)return false;
 if(platform!=='pc'&&!item.ps&&!(game==='story'&&MODERN_PHONE.has(platform)&&item.phone))return false;
 return true;
}
function addCopy(actions,label,value){
 const b=node('button','',label);b.type='button';b.setAttribute('aria-label','Copy '+label+' '+value);
 b.addEventListener('click',()=>copyText(value));actions.append(b);
}
function cheatCard(item,platform){
 const card=node('article','h-card'),g=item.game;
 const labels={story:'GTA V STORY',sa:'SAN ANDREAS',iii:'GTA III',vc:'VICE CITY',iv:'GTA IV',lcs:'LIBERTY CITY STORIES',vcs:'VICE CITY STORIES',ctw:'CHINATOWN WARS',tlad:'THE LOST AND DAMNED',tbogt:'BALLAD OF GAY TONY'};
 card.append(node('p','h-mini',(labels[g]||'CLASSIC GTA')+' / '+item.group),node('h3','',item.name));
 const isIV=['iv','tlad','tbogt'].includes(g),code=platform==='pc'?item.code:platform==='nds'?item.ds?.split(/\s+/).join(' · '):platform==='mobile'?item.mobile:tokens(item,platform);
 const phoneSupported=Boolean(item.phone)&&(isIV||(g==='story'&&MODERN_PHONE.has(platform)));
 if(code){const label=platform==='mobile'?'Enter at safehouse whiteboard':platform==='pc'?(g==='story'?'PC console code':'Type during gameplay'):'Controller sequence';
  card.append(node('span','h-code-label',label),node('code','h-controller-code',code))}
 if(!code&&phoneSupported&&g==='story')card.append(node('p','h-muted','Phone-only activation; no controller sequence for this edition.'));
 if(phoneSupported){card.append(node('p','h-phone',isIV?'Dial on in-game cellphone: '+item.phone:'In-game phone: '+item.phone))}
 if(item.versions==='original-only')card.append(node('p','h-muted','Classic release only; not offered for this game in Definitive Edition.'));
 if(item.versions==='definitive-only')card.append(node('p','h-muted','Definitive Edition only.'));
 if(item.versions==='gen8plus')card.append(node('p','h-muted','Requires a newer GTA V edition and any applicable vehicle unlock.'));
 const actions=node('div','h-card-actions');
 if(code)addCopy(actions,platform==='mobile'?'Copy whiteboard code':platform==='pc'?'Copy PC code':'Copy buttons',code);
 if(phoneSupported)addCopy(actions,'Copy phone',item.phone);
 card.append(actions);return card;
}
function newsCard(item){
 const card=node('article','h-card');
 card.append(node('p','h-mini',(item.game==='vi'?'GTA VI':'GTA ONLINE')+' · '+new Date(item.date+'T12:00:00Z').toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric',timeZone:'UTC'})),node('h3','',item.title),node('p','',item.summary));
 const actions=node('div','h-card-actions'),href=safeURL(item.url);if(href)actions.append(link('Read original Rockstar post ↗',href));card.append(actions);return card;
}
function help(game,platform){
 const h=$('cheatPlatformHelp');if(!h)return;
 if(game==='vi'){h.textContent='GTA VI: no cheat codes have been independently verified for this guide; we will not display guesses.';return}
 if(game==='online'){h.textContent='GTA Online does not accept GTA V Story Mode cheat codes.';return}
 if(['lcs','vcs'].includes(game)){h.textContent=['psp','ps2'].includes(platform)?'Original PSP and PS2 releases: enter the sequence during gameplay. PSP L/R corresponds to PS2 L1/R1. Save before using cheats; some effects cannot be undone.':'For '+(game==='lcs'?'Liberty City Stories':'Vice City Stories')+' choose PSP or original PS2. This guide does not assume mobile or newer console controls are identical.';return}
 if(game==='ctw'){h.textContent=platform==='mobile'?'Chinatown Wars for iOS/Android: enter these letter codes at the safehouse whiteboard. Console button sequences do not apply.':platform==='nds'?'Nintendo DS: enter the exact DS A/B/X/Y and L/R sequence during gameplay. Save first; cheats can disable autosave.':platform==='psp'?'PSP: enter the L/R and Circle/Cross/Square/Triangle sequence during gameplay. Save before testing cheats.':'Choose Nintendo DS, PSP, or mobile for Chinatown Wars; other GTA consoles do not share these codes.';return}
 if(['iv','tlad','tbogt'].includes(game)){
  h.textContent=['pc','ps3','x360','xone360','xsx'].includes(platform)?'GTA IV / Episodes from Liberty City: press Up twice to access your in-game phone keypad and dial the number. On Xbox One or Series, use the Xbox 360 backwards-compatible game. The Episodes accept the GTA IV base codes plus their own extra cheats.':'GTA IV was released for PC, PS3, and Xbox 360; Xbox One and Series run the backwards-compatible Xbox 360 version. No official native PS4/PS5 release is included.';return;
 }
 if(['iii','vc'].includes(game)){
  h.textContent=platform==='pc'?'Classic GTA: type the PC words during active gameplay, not into a GTA V-style tilde console. Some controller-only cheats have no PC code.':platform==='xbox'?'Original Xbox: BLACK/WHITE button labels refer to the 2003 Trilogy controller; select Xbox One/Series for Definitive Edition labels.':'Classic GTA: enter the button sequence during gameplay. Definitive Edition has some edition-only features and omits some older codes. Save a separate game slot first.';return;
 }
 if(game==='story'){
  if(!V_VERSIONS.has(platform)){h.textContent='This console or edition does not have GTA V in our supported platform list. Choose PS3/4/5, Xbox 360/One/Series or PC.';return}
  h.textContent=['ps3','x360'].includes(platform)?'GTA V original 2013 edition: use controller buttons during gameplay; cheat phone numbers are unavailable on PS3 and Xbox 360.':'GTA V Story: use controller inputs in gameplay, PC codes in the ~ console, or dial phone numbers in supported newer editions. No Story cheats work in GTA Online.';return;
 }
 if(game==='sa'){
  if(platform==='ps3hd')h.textContent='San Andreas PS3 HD (2015): L1↔L2 and R1↔R2 are swapped from PS2. The list translates them for you.';
  else if(platform==='x360'||platform==='xone360')h.textContent='San Andreas Xbox 360 edition: bumper/trigger positions differ from the Definitive Edition. The list translates them.';
  else if(['ps4','ps5','xone','xsx'].includes(platform))h.textContent='San Andreas Definitive Edition: most original cheats carry over but several were removed. This list hides entries marked original-only.';
  else h.textContent='San Andreas: press the sequence during live gameplay or type the PC word. Original Xbox uses BLACK and WHITE buttons.';
 }
}
function render(){
 if(!db)return;
 const selected=$('hubGame').value,q=$('hubSearch').value.toLowerCase().trim(),cards=$('hubCards');
 const news=MODE==='news',platform=news?'pc':($('hubPlatform')?.value||'pc');
 const all=news?db.news:db.cheats;
 const filtered=all.filter(x=>(selected==='all'||x.game===selected||(['tlad','tbogt'].includes(selected)&&x.game==='iv'))&&[x.name,x.code,x.phone,x.ps,x.ds,x.mobile,x.group,x.title,x.summary].filter(Boolean).join(' ').toLowerCase().includes(q)&& (news||available(x,platform)));
 cards.replaceChildren();
 const cheatTitles={story:'GTA V Story Mode cheats',sa:'San Andreas cross-platform cheats',iii:'GTA III classic cheat codes',vc:'GTA Vice City cheats',iv:'GTA IV cellphone cheats',lcs:'Liberty City Stories · PSP/PS2 cheats',vcs:'Vice City Stories · PSP/PS2 cheats',ctw:'Chinatown Wars · DS/PSP/mobile cheats',tlad:'The Lost and Damned cheats',tbogt:'The Ballad of Gay Tony cheats',online:'GTA Online: no Story cheats',vi:'GTA VI: no verified cheat codes'}; $('resultsTitle').textContent=news?(selected==='vi'?'GTA VI official posts':selected==='online'?'GTA Online official posts':'Official Rockstar updates'):(cheatTitles[selected]||'Single-player cheats');
 help(selected,platform);
 status(filtered.length+' '+(news?'sourced articles':'available cheat entries')+' · snapshot '+db.checkedAt);
 if(!filtered.length){
  const empty=node('div','h-empty');
  empty.append(node('h3','',!news&&selected==='vi'?'No verified GTA VI cheat codes':!news&&selected==='online'?'GTA Online has no built-in Story cheats':'No entries for this selection'),node('p','',!news&&selected==='vi'?'This page does not invent or publish unverified cheats.':!news&&selected==='online'?'Use legitimate GTA Online activities and game updates.':'Try a supported console, choose another game, or clear the search.'));
  cards.append(empty);
 }else for(const item of filtered)cards.append(news?newsCard(item):cheatCard(item,platform));
 const sources=$('hubSources');sources.replaceChildren();sources.append(node('strong','',news?'Original sources: ':'Checked against: '));
 const urls=news?['https://www.rockstargames.com/newswire/','https://www.rockstargames.com/VI']:db.credits[selected]||[];
 for(const url of urls){const href=safeURL(url);if(href)sources.append(link(new URL(href).hostname+' ↗',href))}
 const uri=new URL(location.href);
 if(selected!==(news?'vi':'story'))uri.searchParams.set('game',selected);else uri.searchParams.delete('game');
 if(q)uri.searchParams.set('q',q);else uri.searchParams.delete('q');
 if(!news&&platform!=='pc')uri.searchParams.set('platform',platform);else uri.searchParams.delete('platform');
 history.replaceState(null,'',uri);
}
function reviewedArticle(item){
 if(!item||!['vi','online'].includes(item.game)||!['title','summary','url'].every(k=>typeof item[k]==='string'&&item[k].trim()))return false;
 if(!/^\d{4}-\d{2}-\d{2}$/.test(item.date)||!Number.isFinite(Date.parse(item.date)))return false;
 const url=safeURL(item.url);
 if(!url)return false;
 const parsed=new URL(url);
 if(parsed.username||parsed.password)return false;
 return (parsed.origin==='https://www.rockstargames.com' && /^\/newswire\/article\/[a-z0-9]+\/[^/]+\/?$/i.test(parsed.pathname)) ||
  (parsed.origin==='https://support.rockstargames.com' && /^\/articles\/[a-z0-9]+\/[^/]+\/?$/i.test(parsed.pathname));
}
async function init(){
 const game=$('hubGame'),query=$('hubSearch'),platform=$('hubPlatform');const p=new URLSearchParams(location.search);
 if([...game.options].some(x=>x.value===p.get('game')))game.value=p.get('game');
 if(platform&&[...platform.options].some(x=>x.value===p.get('platform')))platform.value=p.get('platform');
 query.value=(p.get('q')||'').slice(0,120);
 const syncPlatform=()=>{if(!platform)return;const g=game.value,p=platform.value,valid={story:[...V_VERSIONS],sa:[...SA_VERSIONS],iii:['pc','ps2','ps3','ps4','ps5','xbox','xone','xsx'],vc:['pc','ps2','ps3','ps4','ps5','xbox','xone','xsx'],iv:['pc','ps3','x360','xone360','xsx'],tlad:['pc','ps3','x360','xone360','xsx'],tbogt:['pc','ps3','x360','xone360','xsx'],lcs:['psp','ps2'],vcs:['psp','ps2'],ctw:['nds','psp','mobile']};if(valid[g]&&!valid[g].includes(p))platform.value=g==='ctw'?'nds':['lcs','vcs'].includes(g)?'psp':'pc'};
 syncPlatform();game.addEventListener('change',()=>{syncPlatform();render()});query.addEventListener('input',render);
 if(platform)platform.addEventListener('change',render);
 $('resetHub').addEventListener('click',()=>{query.value='';render()});
 let loading=false;
 async function refresh(){
  if(loading)return;
  loading=true;
  try{
   const response=await fetch('./data/atlas-news-cheats.json',{cache:'no-cache',signal:AbortSignal.timeout(15000)});
   if(!response.ok)throw Error('HTTP '+response.status);
   const source=await response.json();
   if(source.schema!==1||!Array.isArray(source.news)||!Array.isArray(source.cheats))throw Error('unexpected schema');
   if(MODE==='news'){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(source.checkedAt)||!source.news.length||!source.news.every(reviewedArticle))throw Error('invalid reviewed feed');
    if(db && (source.checkedAt<db.checkedAt || (db.checkedAt===source.checkedAt && JSON.stringify(db.news)===JSON.stringify(source.news))))return;
    const time=document.querySelector('.h-notice time');
    time.dateTime=source.checkedAt;
    time.textContent=new Date(source.checkedAt+'T12:00:00Z').toLocaleDateString('en-US',{dateStyle:'long',timeZone:'UTC'});
   }
   db=source;
   render();
  }catch(e){
   if(!db)status('Curated references unavailable. '+e.message);
  }finally{loading=false}
 }
 if(MODE==='news'){
  const refreshVisible=()=>{if(!document.hidden)refresh()};
  document.addEventListener('visibilitychange',refreshVisible);
  window.addEventListener('online',refreshVisible);
  window.setInterval(refreshVisible,300000);
 }
 await refresh();
}
if(MODE==='news'||MODE==='cheats'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init()}
})();