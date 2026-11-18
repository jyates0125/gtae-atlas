/* Team Jura Atlas 8.9 — site-wide access, without replacing existing page navigation. */
(()=>{'use strict';
const path=(location.pathname.split('/').pop()||'index.html').toLowerCase();
if(document.querySelector('#j89-shell'))return;
const destinations=[['⌂ Atlas HQ','atlas81-hq.html'],['▦ All Maps','maps.html'],['◷ Online Dailies','atlas87-daily.html'],['🛸 Collectible Hunt','atlas81-hq.html#collections'],['⚔ Weapons Gallery','atlas90-weapons.html'],['◆ GTA V Vehicles','atlas90-vehicles5.html'],['◇ GTA VI Vehicles','atlas90-vehicles6.html'],['♜ Heists','heists.html'],['✦ Elario Studios','elario.html']];
function create(tag,cls,txt){const el=document.createElement(tag);if(cls)el.className=cls;if(txt!==undefined)el.textContent=txt;return el}
function init(){if(document.querySelector('#j89-shell'))return;
const dock=create('nav','j89-dock');dock.id='j89-shell';dock.setAttribute('aria-label','Team Jura universal navigation');
const home=create('a','j89-home','⌂ Atlas HQ');home.href='./atlas81-hq.html';if(path==='atlas81-hq.html')home.setAttribute('aria-current','page');
const btn=create('button','j89-open','☰ Menu');btn.type='button';btn.setAttribute('aria-expanded','false');btn.setAttribute('aria-controls','j89-menu');
const panel=create('div','j89-panel');panel.id='j89-menu';panel.hidden=true;
const head=create('div','j89-panel-head');head.append(create('small','', 'ELARIO STUDIOS · TEAM JURA'),create('strong','','YOUR ATLAS · EVERY WORLD'));panel.append(head);
for(const [name,dest] of destinations){const a=create('a','',name);a.href='./'+dest;if(dest.split('#')[0]===path)a.setAttribute('aria-current','page');panel.append(a)}
const close=()=>{panel.hidden=true;btn.setAttribute('aria-expanded','false')};const toggle=()=>{panel.hidden=!panel.hidden;btn.setAttribute('aria-expanded',String(!panel.hidden))};
btn.onclick=toggle;document.addEventListener('keydown',event=>{if(event.key==='Escape')close()});document.addEventListener('click',event=>{if(!dock.contains(event.target))close()});
dock.append(home,btn,panel);document.body.append(dock);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
