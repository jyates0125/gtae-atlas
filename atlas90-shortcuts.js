/* Catalog links for the currently selected world in the three main map explorers. */
(() => {
  'use strict';

  const catalogs = {
    game5: {
      cast: 'Story characters', scope: 'story',
      weapons: 'Story weapons', armory: 'atlas90-weapons.html?world=story',
      vehicles: 'GTA V vehicle archive', garage: 'atlas90-vehicles5.html'
    },
    gameOnline: {
      cast: 'Online characters', scope: 'online',
      weapons: 'Online weapons', armory: 'atlas90-weapons.html?world=online',
      vehicles: 'GTA V vehicle archive', garage: 'atlas90-vehicles5.html'
    },
    game6: {
      cast: 'VI characters', scope: 'vi',
      weapons: 'VI weapon research', armory: 'atlas90-weapons6.html',
      vehicles: 'VI vehicle research', garage: 'atlas90-vehicles6.html'
    }
  };

  function init() {
    const worlds = document.querySelector('#sidebar .worlds');
    if (!worlds || document.getElementById('atlas90-catalog-shortcuts')) return;
    const anchor = document.querySelector('.j83-worldnav') || document.querySelector('.atlas85-head') || worlds;
    const row = document.createElement('nav');
    row.id = 'atlas90-catalog-shortcuts';
    row.setAttribute('aria-label', 'Current world catalogs');
    row.style.cssText = 'display:flex;gap:7px;flex-wrap:wrap;padding:8px;border:1px solid #8153a2;border-radius:10px;margin:8px;background:#22132d';
    const links = Array.from({length: 3}, () => {
      const link = document.createElement('a');
      link.style.cssText = 'font:700 11px system-ui;color:#ffcd8e;background:#381e43;padding:8px;border:1px solid #805c92;border-radius:7px;text-decoration:none';
      row.append(link);
      return link;
    });

    function sync() {
      const selected = worlds.querySelector('button[aria-pressed="true"]');
      const catalog = catalogs[selected?.id];
      if (!catalog) return;
      const destinations = [
        [catalog.cast, 'atlas-characters.html?game=' + catalog.scope + '#mainCharacterEra'],
        [catalog.weapons, catalog.armory],
        [catalog.vehicles, catalog.garage]
      ];
      destinations.forEach(([label, path], index) => {
        links[index].textContent = label;
        links[index].href = './' + path;
      });
    }
    sync();
    anchor.insertAdjacentElement('afterend', row);
    new MutationObserver(sync).observe(worlds, {
      subtree: true, attributes: true, attributeFilter: ['aria-pressed']
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once: true});
  else init();
})();
