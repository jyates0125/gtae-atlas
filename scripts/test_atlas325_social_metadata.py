#!/usr/bin/env python3
"""Atlas 32.5: real GTAE social previews for 16 public pages, no legacy canonical."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse
import xml.etree.ElementTree as ET

ROOT=Path(__file__).resolve().parents[1]
BASE='https://gtae-online.pages.dev/'
EXPECTED={
 'maps.html':'jura158-map-world-cinematic.webp',
 'atlas.html':'jura155-story.webp',
 'atlas-online.html':'jura155-online.webp',
 'atlas-vi.html':'jura155-vi.webp',
 'atlas-sa.html':'jura157-sa-cinematic.webp',
 'atlas-iv.html':'jura157-iv-cinematic.webp',
 'heists.html':'jura159-heist-hq.webp',
 'atlas-characters.html':'jura155-characters.webp',
 'atlas93-garage.html':'atlas93-garage-hero.webp',
 'atlas-passport.html':'jura155-map.webp',
 'atlas-credits.html':'jura155-studio.webp',
 'atlas-database.html':'jura155-characters.webp',
 'atlas-research.html':'jura155-vi.webp',
 'leonida-hq.html':'jura155-vi.webp',
 'atlas81-hq.html':'jura155-map.webp',
 'atlas-collectibles.html':'jura155-map.webp',
}
class Document(HTMLParser):
 def __init__(self):
  super().__init__(convert_charrefs=True);self.links=[];self.meta=[];self.titles=[];self.in_title=False
 def handle_starttag(self,tag,attrs):
  data=dict(attrs)
  if tag=='link':self.links.append(data)
  if tag=='meta':self.meta.append(data)
  if tag=='title':self.in_title=True
 def handle_endtag(self,tag):
  if tag=='title':self.in_title=False
 def handle_data(self,data):
  if self.in_title:self.titles.append(data)
 def canonical(self):
  return [link.get('href') for link in self.links if link.get('rel')=='canonical']
 def property(self,name):
  return [m.get('content') for m in self.meta if m.get('property')==name or m.get('name')==name]

assert len(EXPECTED)==16
for name,image in EXPECTED.items():
 source=(ROOT/name).read_text(encoding='utf-8')
 parsed=Document();parsed.feed(source)
 url=BASE+name
 assert parsed.canonical()==[url],(name,'canonical',parsed.canonical())
 for property_,value in [('og:url',url),('og:type','website'),('og:site_name','Elario Studios · Team Jura Atlas'),
                         ('og:image',BASE+'art/'+image),('twitter:card','summary_large_image'),
                         ('twitter:image',BASE+'art/'+image)]:
  assert parsed.property(property_)==[value],(name,property_,parsed.property(property_))
 for field in ('og:title','og:description','og:image:alt','twitter:title','twitter:description'):
  value=parsed.property(field)
  assert len(value)==1 and value[0] and len(value[0])<=320,(name,field,value)
 assert parsed.property('og:title')==parsed.property('twitter:title')
 assert parsed.property('og:description')==parsed.property('twitter:description')
 assert len(parsed.property('og:description')[0])>=60,name
 assert (ROOT/'art'/image).is_file() and (ROOT/'art'/image).stat().st_size>4000,(name,'art absent')
 assert 'team-jura-atlas-preview.pages.dev' not in source,(name,'legacy share link')
 assert len(parsed.titles)>0,name
 assert all(urlparse(a).query=='' for a in parsed.canonical()),name
 assert 'game=' not in parsed.property('og:url')[0] and '?profile=' not in parsed.property('og:url')[0]
sitemap=(ROOT/'sitemap.xml').read_text(encoding='utf-8')
tree=ET.fromstring(sitemap)
links={n.text for n in tree.iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')}
for name in EXPECTED:
 assert BASE+name in links,('missing canonical sitemap page',name)
assert len(links)==len(list(tree.iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc'))),'Duplicate sitemap URLs'
assert len(links)>=40
# Query-based classic notebooks have several worlds per page; do not invent one
# static canonical that merges seven game editions into the wrong world's URL.
hub=(ROOT/'map-hub.html').read_text(encoding='utf-8')
assert 'rel="canonical"' not in hub and "og:url" not in hub
robots=(ROOT/'robots.txt').read_text(encoding='utf-8')
assert BASE+'sitemap.xml' in robots
print(f'Atlas 32.5 social SEO: {len(EXPECTED)} unique GTAE canonicals and source-backed art files; sitemap, privacy and edition constraints passed')
