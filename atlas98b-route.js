/* Route your OWN classic map note markers. These points are normalized image percentages.
 * This is an annotated straight-line preview, NEVER street/drive navigation. */
(()=>{'use strict';
const E=(t,c,s)=>{const el=document.createElement(t);if(c)el.className=c;if(s!==undefined)el.textContent=s;return el},$=s=>document.querySelector(s);
const alias={'vice-city':'vc','gta-iii':'iii','vice-city-stories':'vcs','liberty-city-stories':'lcs','chinatown-wars':'ctw','lost-and-damned':'tlad','ballad-of-gay-tony':'tbogt'},params=new URLSearchParams(location.search),raw=(params.get('game')||params.get('world')||'iii').toLowerCase(),game=alias[raw]||raw;
const allowed=['iii','vc','vcs','lcs','ctw','tlad','tbogt'];if(!allowed.includes(game))return;
const markerKey='team-jura-atlas98-classic-'+game+'-v1',routeKey='team-jura-atlas98b-route-'+game+'-v1';let state={schema:1,world:game,stops:[]};try{const old=JSON.parse(localStorage.getItem(routeKey)||'null');if(old?.schema===1&&old.world===game&&Array.isArray(old.stops))state.stops=old.stops.filter(v=>typeof v==='string').slice(0,100)}catch{}
const markers=()=>{try{const o=JSON.parse(localStorage.getItem(markerKey)||'null');return Array.isArray(o?.markers)?o.markers.filter(x=>typeof x?.id==='string'&&Number.isFinite(x.x)&&Number.isFinite(x.y)&&x.x>=0&&x.y>=0&&x.x<=100&&x.y<=100):[]}catch{return []}};
const persist=()=>{try{localStorage.setItem(routeKey,JSON.stringify(state))}catch{$('#j98bRouteStatus').textContent='Could not save route; export your personal markers.'}};
function init(){const target=$('.classic-rail'),map=$('#classicMapSurface');if(!target||!map)return;
 const panel=E('section','j98b-route');panel.id='j98b-route';panel.innerHTML=`<p class="eyebrow">PERSONAL MAP ROUTE</p><h3>Arrange your stops</h3><p>Add your pins, then select a route stop to start from. Nearest next orders the other stops by distance on the map image. Lines are illustrative, not street directions.</p><label>Saved personal pin<select id="j98bRoutePick"></select></label><div class="j98b-actions"><button type="button" id="j98bRouteAdd">+ Add stop</button><button type="button" id="j98bRouteOrder">Nearest next from selected stop</button><button type="button" id="j98bRouteClear">Clear route</button></div><ol id="j98bRouteStops"></ol><div class="j98b-actions"><button type="button" id="j98bRouteCopy">Copy route list</button></div><p id="j98bRouteStatus" role="status" aria-live="polite">Add two or more existing markers.</p>`;
 (target.querySelector('#j98b-progress')||target).insertAdjacentElement('afterend',panel);
 const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 100 100');svg.setAttribute('preserveAspectRatio','none');svg.setAttribute('aria-hidden','true');svg.classList.add('j98b-line');svg.id='j98b-route-lines';map.insertBefore(svg,map.querySelector('#classicMarkerLayer'));
 $('#j98bRouteAdd').addEventListener('click',()=>{const id=$('#j98bRoutePick').value,m=markers();if(!m.some(x=>x.id===id)){$('#j98bRouteStatus').textContent='Choose an existing marker first.';return}if(state.stops.includes(id)){$('#j98bRouteStatus').textContent='That marker is already on your route.';return}if(state.stops.length>=100){$('#j98bRouteStatus').textContent='A route can hold up to 100 stops.';return}state.stops.push(id);persist();render()});
 const orderButton=$('#j98bRouteOrder');
 const pick=$('#j98bRoutePick');
 pick.addEventListener('change',()=>{orderButton.disabled=state.stops.length<2||!state.stops.includes(pick.value)});
 orderButton.addEventListener('click',()=>{
  const byId=new Map(markers().map(pin=>[pin.id,pin]));
  const start=pick.value;
  if(!state.stops.includes(start)||!byId.has(start))return;
  const remaining=new Set(state.stops.filter(id=>id!==start&&byId.has(id)));
  const ordered=[start];
  const bounds=map.getBoundingClientRect();
  while(remaining.size){
   const from=byId.get(ordered[ordered.length-1]);
   let closest, shortest=Infinity;
   for(const id of remaining){
    const pin=byId.get(id);
    const distance=Math.hypot((pin.x-from.x)*bounds.width,(pin.y-from.y)*bounds.height);
    if(distance<shortest){closest=id;shortest=distance}
   }
   ordered.push(closest);remaining.delete(closest);
  }
  state.stops=ordered;persist();render();
 });
 $('#j98bRouteClear').addEventListener('click',()=>{state.stops=[];persist();render()});
 $('#j98bRouteCopy').addEventListener('click',()=>{const m=markers(),text=state.stops.map((id,i)=>`${i+1}. ${(m.find(x=>x.id===id)||{}).name||'Missing pin'}`).join('\n');if(!text){$('#j98bRouteStatus').textContent='Add a stop first.';return}if(navigator.clipboard?.writeText){navigator.clipboard.writeText(text).then(()=>$('#j98bRouteStatus').textContent='Route list copied.').catch(()=>$('#j98bRouteStatus').textContent='Copy is unavailable in this browser.')}else $('#j98bRouteStatus').textContent='Copy is unavailable in this browser.'});
 window.addEventListener('team-jura:classic-change',render);window.addEventListener('focus',render);render();
}
function render(){const m=markers(),existing=new Map(m.map(x=>[x.id,x])),old=state.stops.length;state.stops=state.stops.filter(id=>existing.has(id)).slice(0,100);if(state.stops.length!==old)persist();
 const pick=$('#j98bRoutePick'),stops=$('#j98bRouteStops'),svg=$('#j98b-route-lines');if(!pick||!stops||!svg)return;
 const selected=pick.value;pick.replaceChildren();const placeholder=E('option','','Select a marker');placeholder.value='';pick.append(placeholder);for(const x of m){const op=E('option','',x.name);op.value=x.id;pick.append(op)}if(existing.has(selected))pick.value=selected;
 $('#j98bRouteOrder').disabled=state.stops.length<2||!state.stops.includes(pick.value);
 stops.replaceChildren();for(let index=0;index<state.stops.length;index++){const item=existing.get(state.stops[index]),li=E('li');li.append(E('span','',(index+1)+'. '+item.name));for(const [label,delta] of [['↑',-1],['↓',1]]){const button=E('button','',label);button.type='button';button.disabled=index+delta<0||index+delta>=state.stops.length;button.setAttribute('aria-label',(delta===-1?'Move earlier ':'Move later ')+item.name);button.addEventListener('click',()=>{const swap=state.stops[index+delta];state.stops[index+delta]=state.stops[index];state.stops[index]=swap;persist();render()});li.append(button)}const remove=E('button','','×');remove.type='button';remove.setAttribute('aria-label','Remove stop '+item.name);remove.addEventListener('click',()=>{state.stops.splice(index,1);persist();render()});li.append(remove);stops.append(li)}
 if(!stops.children.length)stops.append(E('li','','No stops selected. Add pins in Your mapped notes first.'));
 while(svg.firstChild)svg.firstChild.remove();const ns='http://www.w3.org/2000/svg',pts=state.stops.map(id=>existing.get(id));if(pts.length>=2){const line=document.createElementNS(ns,'polyline');line.setAttribute('points',pts.map(x=>x.x+','+x.y).join(' '));svg.append(line)}for(const x of pts){const dot=document.createElementNS(ns,'circle');dot.setAttribute('cx',x.x);dot.setAttribute('cy',x.y);dot.setAttribute('r','0.9');svg.append(dot)}
 $('#j98bRouteStatus').textContent=pts.length<2?'Add two or more personal marker stops to draw a line.':pts.length+' stops · illustrative straight-line route only (no road network).';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
