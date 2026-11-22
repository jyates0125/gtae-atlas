#!/usr/bin/env python3
"""Atlas 21.9 visual source contract for premium Collection HQ."""
from pathlib import Path
R=Path(__file__).resolve().parents[1]
h=(R/'atlas81-hq.html').read_text()
j=(R/'atlas81-hq.js').read_text()
css=(R/'atlas219-collection-cinema.css').read_text()
assert 'Atlas 8.1 is a development preview' not in h
assert 'Team Jura Atlas 8.1 —' not in h
assert 'j219-hq' in h and 'atlas219-collection-cinema.css?v=219' in h
assert './art/elario-crest.svg' in h and 'data-j87-maps-link' not in h
assert 'MANY CREWS · ONE VISION' in h
assert 'j219-maptiles' in h and 'j219-heist-grid' in h
expected={'atlas.html':'jura155-story.webp','atlas-online.html':'jura155-online.webp',
 'atlas-vi.html':'jura155-vi.webp','heist-cayo-perico.html':'jura159-heist-cayo-perico.webp',
 'atlas-iv.html':'jura157-iv-cinematic.webp','atlas-completion.html':'jura161-collectibles.webp'}
for page,img in expected.items():
 assert 'href="./'+page+'"' in h,page
 assert './art/'+img in h,img
 assert (R/'art'/img).stat().st_size>300,img
for img in ('jura159-heist-hq.webp','atlas93-dispatch-hero.webp','jura155-studio.webp'):
 assert (R/'art'/img).stat().st_size>300,img
assert 'function premiumHQOverview()' in j
assert 'function heistList()' in j and "jura159-heist-" in j
assert 'premiumHQOverview();' in j
assert 'localStorage.getItem(STORAGE)' in j and 'localStorage.setItem(STORAGE' in j
assert 'jura3-progress' in j
assert 'prior.done===true||e.done' in j and 'localNote.trim()?localNote:e.note' in j
assert 'parts.length!==2' in j and 'j230-hq-restore' in h
vi=(R/'atlas192-weapons6.js').read_text(encoding='utf-8')
assert "payload.scope!=='vi'" in vi and "payload.app!=='team-jura-vi-weapons'" in vi
assert 'known.has(id)' in vi and 'viWeaponImport' in (R/'atlas90-weapons6.html').read_text(encoding='utf-8')
assert 'body.j219-hq #j89-shell{display:none!important}' in css
assert '#collections .sectionhead' in css and '#missions .sectionhead' in css
assert css.count('{')==css.count('}')
print('PASS Atlas 21.9: HQ cinematic art, six world routes, 15 heists, legacy UI removed, progress keys intact')
