/* Atlas 9.7 · A useful home for humans, not a second map engine.
 * Read-only inspection of existing progress keys; no achievements or live data fabricated. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const safe=(key,base)=>{try{const o=JSON.parse(localStorage.getItem(key)||'null');return o&&typeof o==='object'&&!Array.isArray(o)?o:base}catch{return base}};
function values(o){return o&&typeof o==='object'&&!Array.isArray(o)?Object.values(o):[]}
const PATHS={
 'atlas.html':'GTA V Story map','atlas-online.html':'GTA Online map',
 'atlas-vi.html':'GTA VI Explorer','atlas-research.html':'Leonida Research desk',
 'atlas-cayo.html':'Cayo Perico planner','atlas93-garage.html':'My Garage',
 'atlas81-hq.html':'Collection HQ','heists.html':'Heist HQ',
 'atlas90-vehicles5.html':'GTA V vehicle gallery','atlas90-vehicles6.html':'GTA VI vehicle gallery',
 'atlas87-daily.html':'Daily Intelligence','atlas93-dispatch.html':'Atlas Dispatch'
};
function draw(){
 const hq=safe('team-jura-atlas81-hq-v1',{items:{}});
 const hqDone=values(hq.items).filter(r=>r&&typeof r==='object'&&r.done===true).length;
 const checklist=safe('team-jura-checklist-v54',{checked:{}});
 const checks=values(checklist.checked).filter(Boolean).length;
 const progress=safe('jura3-progress',{});
 const mapped=values(progress).filter(x=>x===true).length;
 // These trackers can overlap. Do NOT add them as if they were distinct achievements.
 $('j97-collections').textContent=Math.max(hqDone,checks,mapped).toLocaleString();
 const gallery=safe('team-jura-atlas90-collection-v1',{owned:{}});
 $('j97-models').textContent=Object.entries(gallery.owned||{}).filter(([k,v])=>k.startsWith('vehicles5:')&&v===true).length.toLocaleString();
 const parking=safe('team-jura-atlas96-parking-v1',{slots:[]});
 $('j97-parking').textContent=(Array.isArray(parking.slots)?parking.slots.length:0).toLocaleString();
 const research=safe('jura-research-66-visited',{});
 $('j97-research').textContent=values(research).filter(x=>x===true).length.toLocaleString();
 const last=safe('team-jura-atlas97-last-workspace-v1',{}),label=PATHS[last.page];
 if(label){$('j97-resume-name').textContent='Continue · '+label;$('j97-resume-note').textContent='Opens your last Atlas workspace. Your existing on-device progress remains available there.';$('j97-resume-link').href='./'+last.page;$('j97-resume-link').textContent='Continue '+label;}
}
function init(){draw();window.addEventListener('focus',draw);window.addEventListener('storage',draw);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
