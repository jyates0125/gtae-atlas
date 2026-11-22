#!/usr/bin/env python3
"""Atlas 15.2: artwork integration contract, staging only."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit
root=Path(__file__).resolve().parents[1]
char=(root/'atlas-characters.html').read_text()
css=(root/'atlas152-characters.css').read_text()
gallery=(root/'atlas222-characters.js').read_text()
gallery_css=(root/'atlas222-characters.css').read_text()
assert 'id="mainCharacterEra"' in char and 'id="j222-character-grid"' in char
assert 'id="j222-character-search"' in char
assert 'data-j222-scope="all"' in char and 'data-j222-scope="vi"' in char
class GalleryAssets(HTMLParser):
 def handle_starttag(self, tag, attrs):
  attrs=dict(attrs)
  if tag=='script' or (tag=='link' and attrs.get('rel')=='stylesheet'):
   asset=urlsplit(attrs.get('src',attrs.get('href','')))
   if asset.path in ('./atlas222-characters.js','./atlas222-characters.css'):
    assert (root/asset.path).is_file()
    assets.add((tag,asset.path))
assets=set()
GalleryAssets().feed(char)
assert assets=={('link','./atlas222-characters.css'),('script','./atlas222-characters.js')}
assert 'atlas152-era-iii.svg' not in char, 'Old flat artwork remains public'
assert 'atlas152-era-ensemble.svg' not in css
assert 'jura155-characters.webp' in css
assert 'j222-character-media' in gallery_css
assert 'character' in gallery and 'jura155-vi.webp' in gallery
assert (root/'art'/'jura155-characters.webp').is_file()
elario=(root/'elario.html').read_text()
assert 'atlas152-studio.css' in elario and 'atlas152-studio-future.svg' in elario
assert 'ATLAS 9.3</em>' not in elario
assert (root/'art/atlas152-studio-future.svg').is_file()
heist_js=(root/'atlas93-global.js').read_text()
for ident in ['fleeca','prison-break','humane-labs','series-a','pacific-standard','doomsday-act-1','doomsday-act-2','doomsday-act-3','diamond-casino','cayo-perico','cluckin-bell','salvage-yard','auto-shop','agency-vip','kortz-center']:
 assert (root/'art'/f'atlas152-heist-{ident}.svg').is_file(),ident
 assert (root/'art'/f'atlas152-planning-{ident}.svg').is_file(),ident
assert '--j120-hero-image' in heist_js
assert 'atlas152-heist-' in heist_js and 'atlas152-planning-' in heist_js
film=(root/'one-last-ride.html').read_text()
assert '<section class="j130-olr-share"' not in film, 'Obsolete large social launch kit panel remains'
assert 'Social launch kit' not in film, 'Old posting kit link remains'
assert 'id="watch"' in film and 'one-last-ride-motion-preview.mp4' in film
print('Atlas 22.2: 15.2 compatibility, no legacy flat character gallery, studio, 15 heist/map pairs and film entrance: PASS')
