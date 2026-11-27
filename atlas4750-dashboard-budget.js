/* Dashboard-only, non-persistent rendering budget. Never touches guest saves. */
(()=>{'use strict';
 const root=document.documentElement,lite=new URLSearchParams(location.search).get('lite')==='1';
 root.dataset.j4750Mode=lite?'lite':matchMedia('(max-width:820px)').matches?'mobile':'desktop';
 const mobile=root.dataset.j4750Mode==='mobile';
 const pending=[],queued=new WeakSet();let active=0;
 function pump(){while(active<2&&pending.length){const img=pending.shift();if(!img.isConnected||img.hasAttribute('src'))continue;const src=img.dataset.j4750Src;if(!src)continue;active++;let done=false;const end=()=>{if(done)return;done=true;img.removeEventListener('load',end);img.removeEventListener('error',end);active--;pump()};img.addEventListener('load',end,{once:true});img.addEventListener('error',end,{once:true});img.loading='eager';img.src=src;if(img.complete)queueMicrotask(end)}}
 const observer=mobile&&'IntersectionObserver'in window?new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;observer.unobserve(entry.target);pending.push(entry.target)}pump()},{rootMargin:'80px'}):null;
 function register(img,src){if(typeof src!=='string'||!/^\.\/art\/[a-z0-9-]+\.(?:webp|png|jpe?g)$/i.test(src))return;img.dataset.j4750Src=src;img.decoding='async';if(lite||queued.has(img))return;queued.add(img);if(observer)observer.observe(img);else{img.loading='lazy';img.src=src}}
 window.JuraDashboardArt={lite,register};
 document.addEventListener('DOMContentLoaded',()=>{for(const img of document.querySelectorAll('img[data-j4750-src]'))register(img,img.dataset.j4750Src);const link=document.getElementById('j4750-mode-link');if(link&&lite){link.href='./atlas-dashboard.html';link.textContent='Restore full artwork'}},{once:true});
})();
