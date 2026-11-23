#!/usr/bin/env python3
"""GTAE 22.3 — functional homepage contract, real local links and evidence-safe copy."""
from html.parser import HTMLParser
from pathlib import Path
import re,json
R=Path(__file__).resolve().parents[1]
page=(R/'atlas-dashboard.html').read_text()
js=(R/'atlas223-home.js').read_text()
css=(R/'atlas223-home.css').read_text()
welcome=(R/'index.html').read_text()
class Parser(HTMLParser):
 def __init__(self):super().__init__();self.links=[];self.images=[];self.anchors=[]
 def handle_starttag(self,t,attrs):
  d=dict(attrs)
  if t=='a': self.links.append((d.get('href',''),d.get('class','')))
  if t=='img': self.images.append(d.get('src',''))
  if t in ('form','a','button'):self.anchors.append(d)
p=Parser();p.feed(page)
assert 'atlas223-home.css?v=223' in page and 'atlas223-home.js?v=356' in page
assert '<main id="main"' in page and 'id="heroTitle"' in page
assert len([c for h,c in p.links if 'j223-world-card' in c])==7
assert len([c for h,c in p.links if h and 'j223-shortcuts' in c])==0 # links belong to nav, not class
assert page.count('<article class="j223-feature-panel')==4
assert page.count('class="j223-world-card')==7
# The approved accessible shortcut filter added a nav ID and ARIA label.
# Parse the real DOM instead of requiring a retired exact opening tag.
class ShortcutParser(HTMLParser):
 def __init__(self): super().__init__();self.active=False;self.depth=0;self.hrefs=[]
 def handle_starttag(self,t,attrs):
  d=dict(attrs)
  if not self.active and t=='nav' and 'j223-shortcuts' in d.get('class','').split():
   self.active=True;self.depth=1;return
  if self.active:
   if t=='nav':self.depth+=1
   if t=='a':self.hrefs.append(d.get('href',''))
 def handle_endtag(self,t):
  if self.active and t=='nav':
   self.depth-=1
   if not self.depth:self.active=False
shortcuts=ShortcutParser();shortcuts.feed(page)
assert len(shortcuts.hrefs)==13, ('dashboard shortcut count',shortcuts.hrefs)
assert len(set(shortcuts.hrefs))==len(shortcuts.hrefs), 'duplicate shortcut destinations'
assert all(h.startswith('./') for h in shortcuts.hrefs), 'shortcuts must remain local Atlas links'
assert 'j223-search-results' in page and 'role="search"' in page
assert 'No account required' in welcome and 'atlas-dashboard.html' in welcome
assert 'jura155-vi.webp' in css and 'j223-hero' in css
assert 'j223-cast-rail' in js and 'atlas-universe-profiles.json' in js
assert page.count('class="j223-evidence-card"')==3
assert 'j223-evidence-lab' in page and 'evidenceExplanations' in js
assert 'aria-live="polite"' in page and 'j223-evidence-cases' in css
assert 'atlas-verification.html' in page and (R/'atlas-verification.html').exists()

assert 'atlas152-era' not in page, 'Do not restore flat avatar art'
assert 'data-j130-surface="dashboard"' in page
for h,c in p.links:
 if not h.startswith('./'):continue
 local=h[2:].split('?',1)[0].split('#',1)[0]
 if local:assert (R/local).is_file(), ('broken dashboard CTA',h)
for src in p.images:
 if src.startswith('./'):
  assert (R/src[2:]).is_file(),('missing bundled original art',src)
assert 'https://gtae-online.pages.dev/atlas-dashboard.html' in page
assert 'team-jura-atlas-preview.pages.dev/atlas-dashboard.html' not in page
assert 'original' in page.lower() and 'provisional' in page.lower()
assert 'atlas132-nav.js' in (R/'scripts/build-cloudflare.cjs').read_text(), 'Global page navigation must still load'
print('PASS GTAE 22.3: actual 7 destination and 13 category links, 4 functional panels, original art, source boundaries and welcome flow')

assert js.index('indexCharacters(featuredFallback);') < js.index('loadCharacterIndex();'), 'Featured search must be active before starting the full index request'
