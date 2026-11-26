/* Team Jura 10.0 — showroom lighting and connected navigation; no image recolor or gameplay fabrication. */
(()=>{'use strict';
if(!document.body.dataset.gallery)return;
const make=(tag,cls,text)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el};
function init(){
 const tools=document.querySelector('.j90-tools'),main=document.querySelector('main');if(!tools||!main||document.querySelector('.j100-showroom'))return;
 const panel=make('section','j100-showroom');panel.setAttribute('aria-label','Showroom presentation and connected catalog');
 const about=make('div');about.append(make('h2','','Choose your showroom atmosphere'),make('p','','Distinctive original Team Jura lighting behind the community reference images. Lighting is presentation only: it does not change, recolor or prove the real in-game vehicle or weapon.'));
 const spot=make('div','j100-spotlights');const lamps=[['Violet',272],['Sunset',28],['Neon',187],['Crimson',342]];let current='Violet';
 try{const x=localStorage.getItem('team-jura-showroom-light-v1');if(lamps.some(l=>l[0]===x))current=x}catch{}
 function choose(name){const lamp=lamps.find(l=>l[0]===name)||lamps[0];current=lamp[0];document.body.style.setProperty('--showroom-hue',String(lamp[1]));for(const button of spot.querySelectorAll('button'))button.setAttribute('aria-pressed',String(button.dataset.lamp===current));try{localStorage.setItem('team-jura-showroom-light-v1',current)}catch{}}
 for(const [name]of lamps){const button=make('button','',name);button.type='button';button.dataset.lamp=name;button.onclick=()=>choose(name);spot.append(button)}
 const links=make('nav','j100-showroom-links');links.setAttribute('aria-label','Related Atlas database pages');
 const requestedWorld=new URLSearchParams(location.search).get('world');
 const edition=document.body.dataset.gallery==='vehicles6'?'vi':requestedWorld==='story'?'story':'online';
 // The shared GTA V archive carries the visitor's world into its related pages.
 for(const link of document.querySelectorAll('.j90-nav a')){
  const url=new URL(link.href);
  if(document.body.dataset.gallery==='vehicles5'&&url.pathname.endsWith('/atlas90-weapons.html'))url.searchParams.set('world',edition);
  if(['atlas-database.html','atlas-characters.html','atlas-animals.html','atlas-collectibles.html'].includes(url.pathname.split('/').pop())){
   url.searchParams.set('game',edition);
   link.href=url.href;
  }
 }
 const related=[
 ['◎ Universe database','atlas-database.html?game='+edition],
 ['◆ '+(edition==='story'?'Compare GTA V archive vehicles':'Vehicle comparison'),edition==='story'?'atlas90-vehicles5.html?world=story#j90Cards':'atlas-database.html?kind=vehicle&game='+edition],
 ['⚔ '+(edition==='vi'?'GTA VI Weapon Research':'World-specific weapon details'),edition==='vi'?'atlas90-weapons6.html':'atlas-database.html?kind=weapon&game='+edition],
 ['♟ Characters','atlas-characters.html?game='+edition],
 ['✿ Animals','atlas-animals.html?game='+edition],
 ['◈ Collectibles','atlas-collectibles.html?game='+edition],
 ['▣ My Garage','atlas-forge-collections.html'],
 ['◈ Original 3D configurator',edition==='vi'?'atlas-vehicle-configurator.html?world=vi':'atlas-vehicle-configurator.html']
 ];
 for(const [label,href]of related){const a=make('a','',label);a.href='./'+href;links.append(a)}
 panel.append(about,spot,links);tools.insertAdjacentElement('afterend',panel);
 choose(current);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();