/* Atlas 20.8: public sign-in remains disabled. This is a reusable HTTPS-only
   transport gate for a future, separately reviewed Supabase integration.
   No tokens, passwords, account IDs, or remote calls are handled here. */
(()=>{'use strict';
  const isSecure=()=>{
    try {
      return window.location.protocol==='https:' &&
        window.isSecureContext === true &&
        window.top === window.self;
    } catch (_) { return false; }
  };
  const requireSecure=()=>{
    if(!isSecure()) throw new Error('Atlas accounts require a secure HTTPS, top-level page. Continue as guest or export a local backup.');
    return true;
  };
  // Defense-in-depth: block any future account forms wired to these attributes
  // when opened over HTTP or inside a frame. Guest tools remain untouched.
  const refuseInsecureAccountAction=(event)=>{
    const element=event.target;
    const form=element?.closest?.('form[data-atlas-auth-form]');
    const action=element?.closest?.('[data-atlas-auth-submit]');
    if(!form&&!action || isSecure())return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const status=document.getElementById('accountNotice');
    if(status)status.textContent='Account sign-in is blocked on HTTP or embedded pages. Open the HTTPS Atlas site. Guest progress and manual backups still work.';
  };
  document.addEventListener('submit',refuseInsecureAccountAction,true);
  document.addEventListener('click',refuseInsecureAccountAction,true);
  window.TeamJuraAuthTransport=Object.freeze({isSecure,requireSecure});
})();
