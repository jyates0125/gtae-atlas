/* Team Jura Atlas 12.4 · edition-aware, sourced single-player cheats and Rockstar newsroom. */
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
 let raw=item.ps.split(/\\s+/).filter(Boolean),mapped;
 if(platform==='ps3hd'&&item.game==='sa')mapped=raw.map(t=>PS3_HD[t]||t);
 else if(['ps2','ps3','ps4','ps5'].includes(platform))mapped=raw;
 else if(platform==='xbox'&&item.game==='sa')mapped=raw.map(t=>PS_TO_ORIGINAL_XBOX[t]||t);
 else if(['x360','xone360'].includes(platform)&&item.game==='sa')mapped=raw.map(t=>X360_SWAP[PS_TO_XBOX[t]]||PS_TO_XBOX[t]||t);
 else if(platform.startsWith('x'))mapped=raw.map(t=>PS_TO_XBOX[t]||t);
 else mapped=raw;
 return mapped.join(' · ');
}
function available(item,platform){
 if(item.game==='story'&&!V_VERSIONS.has(platform))return false;
 if(item.game==='sa'&&!SA_VERSIONS.has(platform))return false;
 if(item.versions==='gen8plus'&&['ps3','x360'].includes(platform))return false;
 if(item.versions==='original-only'&&['ps4','ps5','xone','xsx'].includes(platform))return false;
 if(!item.ps&&platform!=='pc'&&!MODERN_PHONE.has(platform))return false;
 return true;
}
function addCopy(actions,label,value){
 const b=node('button','',label);b.type='button';b.setAttribute('aria-label','Copy '+label+' '+value);
 b.addEventListener('click',()=>copyText(value));actions.append(b);
}
function cheatCard(item,platform){
 const card=node('article','h-card');
 card.append(node('p','h-mini',(item.game==='story'?'GTA V STORY':'SAN ANDREAS')+' / '+item.group),node('h3','',item.name));
 const code=platform==='pc'?item.code:tokens(item,platform);
 const phoneSupported=item.game==='story'&&MODERN_PHONE.has(platform)&&Boolean(item.phone);
 if(code){const label=platform==='pc'?'PC console code':'Controller sequence';
 card.append(node('span','h-code-label',label),node('code','h-controller-code',code))}
 if(!code&&phoneSupported){card.append(node('p','h-muted','Phone-only activation; no confirmed controller sequence for this edition.'))}
 if(phoneSupported){const p=node('p','h-phone','In-game phone: '+item.phone);card.append(p)}
 if(item.versions==='original-only')card.append(node('p','h-muted','Original San Andreas only; removed from the Definitive Edition.'));
 if(item.versions==='gen8plus')card.append(node('p','h-muted','Requires a newer GTA V edition and any applicable in-game vehicle unlock.'));
 const actions=node('div','h-card-actions');
 if(code)addCopy(actions,platform==='pc'?'Copy PC code':'Copy buttons',code);
 if(phoneSupported)addCopy(actions,'Copy phone',item.phone);
 card.append(actions);
 return card;
}
function newsCard(item){
 const card=node('article','h-card');
 card.append(node('p','h-mini',(item.game==='vi'?'GTA VI':'GTA ONLINE')+' · '+new Date(item.date+'T12:00:00Z').toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric',timeZone:'UTC'})),node('h3','',item.title),node('p','',item.summary));
 const actions=node('div','h-card-actions'),href=safeURL(item.url);if(href)actions.append(link('Read original Rockstar post ↗',href));card.append(actions);return card;
}
function help(game,platform){
 const h=$('cheatPlatformHelp');if(!h)return;
 if(game==='vi'){h.textContent='GTA VI: no cheat codes have been verified for publication here; do not treat leaked or invented lists as authentic.';return}
 if(game==='online'){h.textContent='GTA Online does not accept GTA V Story Mode cheat codes.';return}
 if(game==='story'){
  if(!V_VERSIONS.has(platform)){h.textContent='This console/edition does not have a GTA V release in our verified list. Choose PS3, PS4, PS5, Xbox 360/One/Series, or PC.';return}
  h.textContent=['ps3','x360'].includes(platform)?'GTA V original 2013 edition: use controller sequences during gameplay. In-game cheat phone numbers are NOT supported on PS3 or Xbox 360.':'GTA V Story: enter controller inputs during gameplay, PC codes with the ~ console, or phone numbers on supported newer editions. Cheats never work in GTA Online.';return;
 }
 if(game==='sa'){
  if(platform==='ps3hd')h.textContent='San Andreas PS3 HD (2015): L1↔L2 and R1↔R2 are swapped from the PS2 code. Converted inputs are displayed below.';
  else if(platform==='x360'||platform==='xone360')h.textContent='San Andreas Xbox 360 edition (including Xbox One backwards compatibility): bumpers and triggers are swapped compared with the Definitive Edition. Converted inputs are displayed below.';
  else if(['ps4','ps5','xone','xsx'].includes(platform))h.textContent='San Andreas Definitive Edition: original code inputs mostly carry over, but some older cheats were removed. Only entries not marked original-only are displayed.';
  else h.textContent='San Andreas: input the sequence during live gameplay, or type the listed code on PC. PS2 and original Xbox are supported; the original Xbox uses BLACK and WHITE buttons.';
 }
}
function render(){
 if(!db)return;
 const selected=$('hubGame').value,q=$('hubSearch').value.toLowerCase().trim(),cards=$('hubCards');
 const news=MODE==='news',platform=news?'pc':($('hubPlatform')?.value||'pc');
 const all=news?db.news:db.cheats;
 const filtered=all.filter(x=>(selected==='all'||x.game===selected)&&[x.name,x.code,x.phone,x.ps,x.group,x.title,x.summary].filter(Boolean).join(' ').toLowerCase().includes(q)&& (news||available(x,platform)));
 cards.replaceChildren();
 $('resultsTitle').textContent=news?(selected==='vi'?'GTA VI official posts':selected==='online'?'GTA Online official posts':'Official Rockstar updates'):(selected==='story'?'GTA V Story Mode cheats':selected==='sa'?'San Andreas cross-platform cheats':selected==='online'?'GTA Online: no Story cheats':'GTA VI: no verified cheat codes');
 help(selected,platform);
 status(filtered.length+' '+(news?'sourced articles':'available cheat entries')+' · source review '+db.checkedAt);
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
async function init(){
 const game=$('hubGame'),query=$('hubSearch'),platform=$('hubPlatform');const p=new URLSearchParams(location.search);
 if([...game.options].some(x=>x.value===p.get('game')))game.value=p.get('game');
 if(platform&&[...platform.options].some(x=>x.value===p.get('platform')))platform.value=p.get('platform');
 query.value=(p.get('q')||'').slice(0,120);
 game.addEventListener('change',render);query.addEventListener('input',render);
 if(platform)platform.addEventListener('change',render);
 $('resetHub').addEventListener('click',()=>{query.value='';render()});
 try{const r=await fetch('./data/atlas-news-cheats.json',{cache:'no-cache'});if(!r.ok)throw Error('HTTP '+r.status);
 const source=await r.json();if(source.schema!==1||!Array.isArray(source.news)||!Array.isArray(source.cheats))throw Error('unexpected schema');
 db=source;render()}catch(e){status('Data unavailable · '+e.message);$('hubCards').append(node('p','h-empty','Unable to load curated references. Use the site source registry.'))}
}
if(MODE==='news'||MODE==='cheats'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init()}
})();