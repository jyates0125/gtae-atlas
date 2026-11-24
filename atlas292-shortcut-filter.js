/* Atlas 29.2: client-only quick-tool filtering. Never touches guest progress. */
(function () {
  'use strict';
  function init() {
    const field = document.getElementById('juraShortcutFilter');
    const nav = document.getElementById('juraShortcutLinks');
    const status = document.getElementById('juraShortcutCount');
    if (!field || !nav || !status) return;
    const links = Array.from(nav.querySelectorAll('a[href]'));
    function filter() {
      const query = field.value.trim().toLocaleLowerCase();
      let count = 0;
      links.forEach(function (link) {
        const matches = link.textContent.toLocaleLowerCase().includes(query);
        link.hidden = !matches;
        if (matches) count++;
      });
      status.textContent = query ? count + ' of ' + links.length + ' tools found' : links.length + ' tools available';
    }
    field.addEventListener('input', filter);
    field.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && field.value) {
        field.value = '';
        filter();
        event.stopPropagation();
      }
      if (event.key === 'Enter') {
        const visible = links.filter(function (link) { return !link.hidden; });
        if (visible.length === 1) {
          event.preventDefault();
          visible[0].focus();
        }
      }
    });
    filter();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
}());
