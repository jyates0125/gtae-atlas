/* Atlas 17.2: ensure research map is full-size and navigable on phones. */
(()=>{'use strict';
function init(){
 const page=document.body.classList.contains('j119-research')?document.getElementById('maparea'):null;
 const canvas=page?.querySelector('#map');
 if(!canvas||page.querySelector('#j172-research-tools'))return;
 const controls=document.createElement('div');controls.className='j172-tools';controls.id='j172-research-tools';
 controls.setAttribute('role','group');controls.setAttribute('aria-label','Research map display options');
 const make=(label,id)=>{const b=document.createElement('button');b.type='button';b.id=id;b.textContent=label;b.setAttribute('aria-pressed','false');return b};
 const size=make('⛶ Expand map','j172-expand'),light=make('☀ Brighten map','j172-bright');
 const check=document.getElementById('showResearchPins');
 const pins=make('📍 Show pins','j172-pins');
 function syncPins(){
  const on=!!check?.checked;
  pins.textContent=on?'📍 Hide pins':'📍 Show pins';
  pins.setAttribute('aria-pressed',String(on));
 }
 const back=make('← Back','j172-back');
 back.setAttribute('aria-label','Close expanded research map, close filters, or return to Leonida');
 controls.append(back,size,light,pins);page.append(controls);
 back.addEventListener('click',()=>{
  if(page.classList.contains('j172-full-map')){size.click();return}
  const rail=document.getElementById('rail');
  if(rail?.classList.contains('open')){rail.classList.remove('open');return}
  window.location.assign('./atlas-vi.html');
 });
 syncPins();
 check?.addEventListener('change',syncPins);
 pins.addEventListener('click',()=>{
  if(!check)return;
  check.checked=!check.checked;
  check.dispatchEvent(new Event('change',{bubbles:true}));
  syncPins();
 });
 const onResize=()=>window.dispatchEvent(new Event('resize'));
 size.addEventListener('click',()=>{
  const active=page.classList.toggle('j172-full-map');
  document.body.classList.toggle('j172-map-expanded',active);
  size.textContent=active?'✕ Close map':'⛶ Expand map';size.setAttribute('aria-pressed',String(active));
  if(!active)document.getElementById('rail')?.classList.remove('open');
  onResize();requestAnimationFrame(onResize);
 });
 light.addEventListener('click',()=>{
  const active=page.classList.toggle('j172-bright-map');
  light.textContent=active?'◐ Normal map':'☀ Brighten map';light.setAttribute('aria-pressed',String(active));
 });
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&page.classList.contains('j172-full-map')){size.click();size.focus()}});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();