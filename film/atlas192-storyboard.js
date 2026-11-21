/* Atlas 19.2 · One Last Ride guided 9-chapter storyboard.
 * A user-triggered *still-card* playback, not a fake full animated movie.
 * Works with the original nine-chapter model. Audio is only in the existing
 * approved 36-second teaser, which plays in the browser video element.
 */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const story=$('story'),toggle=$('olrStoryboardPlay'),restart=$('olrStoryboardRestart'),progress=$('olrStoryboardProgress'),caption=$('olrStoryboardCaption');
const buttons=$('olrSceneList'),count=$('sceneCounter');
if(!story||!toggle||!restart||!progress||!caption||!buttons||!count)return;
const TOTAL=9,INTERVAL_MS=9000;
let playing=false,timeout=null;
function current(){const n=Number.parseInt(count.textContent,10);return Number.isFinite(n)?Math.max(1,Math.min(TOTAL,n)):1}
function stopTimer(){if(timeout!==null){clearTimeout(timeout);timeout=null}}
function status(){
 const n=current();progress.value=n;progress.max=TOTAL;
 caption.textContent='Chapter '+n+' of '+TOTAL+' · Scene treatment and original concept frame · NOT the full animated film';
 toggle.setAttribute('aria-pressed',String(playing));toggle.textContent=playing?'Pause storyboard':'▶ Play 9-chapter storyboard';
}
function pause(){playing=false;stopTimer();status()}
function schedule(){
 stopTimer();
 if(!playing)return;
 if(document.hidden){pause();return}
 timeout=setTimeout(()=>{
  if(!playing)return;
  if(current()>=TOTAL){pause();return}
  $('olrNext')?.click();
 },INTERVAL_MS);
}
toggle.addEventListener('click',()=>{playing=!playing;status();if(playing)schedule();else stopTimer()});
restart.addEventListener('click',()=>{pause();buttons.querySelector('.olr-scene-btn')?.click();status()});
const tracker=new MutationObserver(()=>{status();if(playing)schedule()});
tracker.observe(count,{characterData:true,childList:true,subtree:true});
story.addEventListener('keydown',e=>{
 if(e.altKey||e.ctrlKey||e.metaKey||/input|textarea|select/i.test(e.target.tagName))return;
 if(e.key==='ArrowRight'){e.preventDefault();$('olrNext')?.click()}
 if(e.key==='ArrowLeft'){e.preventDefault();$('olrPrevious')?.click()}
 if(e.key==='Escape'&&playing){pause()}
});
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause()});
window.addEventListener('pagehide',pause,{once:true});
status();
})();
