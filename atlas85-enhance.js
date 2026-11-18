/* Atlas 8.5 Designed Brand — original collection symbols / map usability */
(()=>{'use strict';
const symbols=[['spaceship','🛸'],['letter scrap','✉️'],['nuclear waste','☢️'],['submarine','⚓'],['monkey mosaic','🐒'],['peyote','🌵'],['epsilon','📜'],['hidden package','🎁'],['stunt jump','🏍️'],['under the bridge','🌉'],['knife flight','✈️'],['playing card','🃏'],['action figure','🤖'],['signal jammer','📡'],['ld organics','🍃'],['movie prop','🎬'],['media stick','💿'],['snowm','☃️'],['jack o','🎃'],['lantern','🎃'],['ls tag','🎨'],['graffiti','🎨'],['snapshot','📷'],['horseshoe','🧲'],['oyster','🦪']];
const icon=name=>symbols.find(([key])=>String(name).toLowerCase().includes(key))?.[1]||'◆';
const $=id=>document.getElementById(id);
function enhance(){
 if(document.querySelector('.atlas85-head'))return;
 const bar=document.createElement('nav');bar.className='atlas85-head';bar.setAttribute('aria-label','Atlas map navigation');
 const links=[['⌂ Atlas HQ','atlas81-hq.html'],['GTA V Story','atlas.html'],['GTA Online','atlas-online.html'],['GTA VI Research','atlas-vi.html'],['San Andreas','atlas-sa.html']];
 for(const [label,path] of links){const a=document.createElement('a');a.textContent=label;a.href='./'+path;if(location.pathname.endsWith('/'+path))a.setAttribute('aria-current','page');bar.append(a)}
 const header=document.querySelector('body > header');if(header)header.insertAdjacentElement('afterend',bar);else document.body.prepend(bar);
 const panel=$('jura83-panel');if(panel){
   const note=document.createElement('p');note.className='atlas85-note';note.textContent='🛸 Collection icons identify mapped records. Complete a pin to update the unfinished hunt and route. Routes are straight-line previews unless a validated road graph is imported.';
   const heading=panel.querySelector('.j83-heading');if(heading)heading.insertAdjacentElement('afterend',note);
   const select=$('j83-set');if(select){for(const opt of select.options){if(opt.value)opt.textContent=icon(opt.textContent)+' '+opt.textContent}}
   const list=$('j83-items');if(list){const observer=new MutationObserver(()=>{
     observer.disconnect();
     for(const row of list.querySelectorAll('.j83-item')){
       const text=row.querySelector('.j83-item-label');if(!text||text.dataset.atlas85Icon)continue;
       const s=select?.selectedOptions?.[0]?.textContent||text.textContent;
       text.prepend(document.createTextNode(icon(s)+' '));text.dataset.atlas85Icon='1';
     }
     observer.observe(list,{childList:true});
   });observer.observe(list,{childList:true});}
 }
 const message=document.createElement('span');message.className='atlas85-live';message.setAttribute('role','status');message.setAttribute('aria-live','polite');bar.append(message);
 document.addEventListener('jura:progress-updated',event=>{const d=event.detail||{};message.textContent=d.done?'✓ Collected. '+d.remaining+' stops left · updated route':'Collection reopened';
  const panel=$('jura83-panel');if(panel){const select=$('j83-set');select?.dispatchEvent(new Event('change',{bubbles:true}))}
 });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',enhance);else enhance();
})();
