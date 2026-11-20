/* Atlas 15.3 — quiet, guest-first content advisory for the GTA fan companion.
   No cookie, account state, storage, tracking, forced gate, or modal. */
(()=>{'use strict';
  function render(){
    if(document.getElementById('j153-advisory'))return;
    const file=(location.pathname.split('/').pop()||'index.html').toLowerCase();
    const welcome=file==='index.html';
    const sensitive=/^(heists\.html|heist-[a-z0-9-]+\.html|atlas90-weapons\.html|atlas-characters\.html|one-last-ride\.html)$/.test(file);
    const aside=document.createElement('aside');
    aside.className='j153-advisory'+(welcome?' j153-welcome':sensitive?' j153-section':' j153-footer');
    aside.id='j153-advisory';
    aside.setAttribute('aria-labelledby','j153-advisory-title');
    aside.innerHTML='<span class="j153-advisory-mark" aria-hidden="true">!</span><div class="j153-advisory-body"><strong id="j153-advisory-title">Mature-game content · A note for players and parents</strong><p>This independent GTA fan companion covers games with mature themes, including crime, violence, strong language and adult situations. Browse at your discretion; parents and guardians should review each game\'s official rating. No account is needed to explore the Atlas.</p><a href="https://www.esrb.org/ratings-guide/" target="_blank" rel="noopener noreferrer">Learn about game ratings</a></div>';
    const main=document.querySelector('main');
    const footer=document.querySelector('footer');
    if(welcome&&main){
      const poster=main.querySelector('.j132-poster-welcome,.j130-public-hero');
      if(poster)poster.insertAdjacentElement('afterend',aside);
      else main.prepend(aside);
    } else if(sensitive&&main){
      main.prepend(aside);
    } else if(footer){
      footer.insertAdjacentElement('beforebegin',aside);
    } else if(main)main.append(aside);
    else document.body.append(aside);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render,{once:true});
  else render();
})();
