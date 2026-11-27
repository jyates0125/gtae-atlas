(()=>{'use strict';
  // Shared accessibility/navigation shell for older utility and guide pages.
  const path=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  const mapWorlds=new Set(['atlas.html','atlas-online.html','atlas-vi.html']);
  const classic=document.querySelector('.portal-app');
  for(const anchor of document.querySelectorAll('a[href]')){
    try{const dest=new URL(anchor.href,location.href);if(dest.origin===location.origin&&dest.pathname===location.pathname)anchor.setAttribute('aria-current','page')}
    catch{}
  }
  if(mapWorlds.has(path)){
    const nav=document.querySelector('header nav');
    if(nav && !nav.querySelector('.jura83-hq-nav')){const a=document.createElement('a');a.className='jura83-hq-nav';a.href='./atlas81-hq.html';a.textContent='⌂ Atlas HQ';nav.prepend(a)}
    const css=document.createElement('link');css.rel='stylesheet';css.href='./atlas83-map.css?v=83';document.head.append(css);
    const js=document.createElement('script');js.src='./atlas83-map.js?v=156';js.defer=true;document.head.append(js);
    // Map navigation is essential. If its deferred local script failed to
    // initialize, give it one same-origin retry after all DOM-ready listeners.
    // The original script's build guard prevents duplicates; legacy links stay
    // available if recovery also fails. No external or repeated retry.
    const navScript=[...document.scripts].find(s=>{try{const u=new URL(s.src,location.href);return u.origin===location.origin&&u.pathname.endsWith('/atlas132-nav.js')}catch{return false}});
    if(navScript){
      const recover=()=>setTimeout(()=>{
        if(document.getElementById('j132-nav-toggle')||document.body.dataset.j4728Welcome==='true')return;
        const retry=document.createElement('script'),url=new URL(navScript.src,location.href);
        url.searchParams.set('recovery','1');retry.src=url.href;retry.dataset.juraNavRecovery='true';
        document.head.append(retry);
      },0);
      if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',recover,{once:true});else recover();
    }
    return;
  }
  if(classic)return;
  if(!document.querySelector('header'))return;
  if(document.querySelector('.studio-quickbar'))return;
  const bar=document.createElement('nav');
  bar.className='studio-quickbar';bar.setAttribute('aria-label','Site-wide quick navigation');
  const pages=[['Atlas HQ','atlas81-hq.html'],['Map explorer','atlas.html'],['Leonida HQ','leonida-hq.html'],['One Last Ride','one-last-ride.html'],['Sources & credits','atlas-credits.html']];
  pages.forEach(([label,target])=>{const a=document.createElement('a');a.href='./'+target;a.textContent=label;if(path===target)a.setAttribute('aria-current','page');bar.append(a)});
  const header=document.querySelector('body > header');
  if(header)header.insertAdjacentElement('afterend',bar);
  // Helpful indicator and clear non-Rockstar affiliation, without crowding the explorer controls.
  if(!document.querySelector('.studio-site-note')){
    const note=document.createElement('div');note.className='studio-site-note';note.textContent='Team Jura × Elario Studios · Unofficial fan companion · Credited Community Research & Development';
    document.body.append(note);
  }
})();