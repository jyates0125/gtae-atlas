#!/usr/bin/env python3
"""Atlas 13.0 launch regression: source/brand, real pathways, privacy and social honesty."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import re,xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[1]
def read(name): return (ROOT/name).read_text(encoding='utf8')
index=read('index.html'); dash=read('atlas-dashboard.html'); social=read('atlas-share.html')
film=read('one-last-ride.html');js=read('atlas130-share.js');style=read('atlas130-launch.css')
class Refs(HTMLParser):
 def __init__(self):super().__init__();self.hrefs=[];self.refs=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if 'href' in a:self.hrefs.append(a['href'])
  for x in ['href','src','poster']:
   if a.get(x):self.refs.append(a[x])
def local_ok(name,source):
 p=Refs();p.feed(source)
 for uri in p.refs:
  u=urlsplit(uri);path=unquote(u.path)
  if not path or uri.startswith('#') or u.scheme or u.netloc:continue
  target=(ROOT/name).parent/path
  assert target.is_file(),f'{name}: local link missing: {uri}'
 return p
assert 'class="j98-home j130-home"' in index
assert 'id="heroTitle"' in index and 'id="featuredGrid"' in index
assert 'href="./atlas-dashboard.html"' in index
assert 'href="./atlas-share.html"' in index
assert '<a class="j99-start-link" href="./atlas-dashboard.html">' in index
assert 'href="./atlas-account.html"' in index
assert 'j132-poster-welcome' in index
assert 'Many Crews. One Vision.' in index or 'MANY CREWS. ONE VISION.' in index
assert 'Public development preview' in index and '13 destinations' in index
assert 'data-j130-action="share-page"' in index
assert index.count('<h1')==1
assert 'id="featuredGrid"' in dash
assert 'id="progressCollections"' in dash and 'id="progressVehicles"' in dash and 'id="progressGarage"' in dash
assert 'data-page="home"' in dash
assert 'href="./atlas-dashboard.html"' in dash
assert dash.count('<h1')==1
# Atlas 13.3 replaces the launch-kit cards with a lean share page and global footer.
assert 'j130-share-stacks' not in social
assert 'data-j131-social-host' in social
assert 'data-j130-action="share-page"' in social
assert 'data-j130-action="copy-url"' in social
assert 'data-kind="custom"' in social and 'data-j130-copytext' in social
assert 'No official Team Jura server invite has been verified' not in social
assert social.count('<h1')==1
assert "navigator.share" in js and "navigator.clipboard" in js
assert "document.execCommand('copy')" in js and 'isSecureContext' in js
assert 'POST[el.dataset.kind]' in js
assert not re.search(r'(?:google-analytics\.com|googletagmanager\.com|facebook\.com/tr\?|gtag\(|fbq\()',js,re.I)
assert 'film/assets/one-last-ride-motion-preview.mp4' in film
assert 'id="olrSceneList"' in film and 'id="moments"' in film and 'community-moments.js' in film
assert 'Full animation' in film or 'full animated film' in film
# Atlas 15.3 intentionally moved share actions out of the film's main content.
# The film keeps its production roadmap and the shared compact footer host.
assert 'j130-film-plan' in film and 'data-j131-social-host' in film
assert 'data-j130-action="share-page"' not in film
assert 'og:image' in film and 'atlas98-one-last-ride.webp' in film
assert 'atlas97-proposed-loki-scaly-hero.webp' in style and 'atlas130-launch.css' in index
for name,html in [('index.html',index),('atlas-dashboard.html',dash),('atlas-share.html',social),('one-last-ride.html',film)]:
 local_ok(name,html)
robots=read('robots.txt')
assert 'Sitemap: https://gtae-online.pages.dev/sitemap.xml' in robots
sitemap=ET.fromstring(read('sitemap.xml'))
urls=[e.text for e in sitemap.iter() if e.tag.endswith('loc')]
for suffix in ('/','/atlas-dashboard.html','/atlas-share.html','/one-last-ride.html','/maps.html'):
 assert 'https://gtae-online.pages.dev'+suffix in urls
assert len(urls)==len(set(urls))
print('PASS Atlas 13.0: welcome + preserved dashboard + cross-platform share + Last Ride + crawl discovery')
