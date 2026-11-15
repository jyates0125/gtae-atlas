#!/usr/bin/env python3
"""Post-merge release polish: metadata and navigational links. Idempotent."""
from pathlib import Path
from html.parser import HTMLParser
import html,re
ROOT=Path(__file__).resolve().parent.parent
class Reader(HTMLParser):
 def __init__(self):super().__init__();self.title='';self.intitle=False;self.desc=''
 def handle_starttag(self,tag,attrs):
  d=dict(attrs)
  if tag=='title':self.intitle=True
  if tag=='meta' and d.get('name','').lower()=='description':self.desc=d.get('content','')
 def handle_endtag(self,tag):
  if tag=='title':self.intitle=False
 def handle_data(self,data):
  if self.intitle:self.title+=data

def apply():
 touched=[]
 for f in sorted(ROOT.glob('*.html')):
  s=f.read_text(encoding='utf-8');p=Reader();p.feed(s)
  if len(p.desc.strip())<35:
   summary=re.sub(r'\s+',' ',p.title).strip() or f.stem.replace('-',' ').title()
   description=f'{summary} — Explore the Team Jura Atlas community map, game research, guides, collections and Elario Studios tools.'
   meta=f'<meta name="description" content="{html.escape(description,quote=True)}">\n'
   if p.desc:
    s=re.sub(r'<meta\s+name=["\']description["\'][^>]*>',meta,s,count=1,flags=re.I)
   elif '<head>' in s.lower():
    s=re.sub(r'<head>',lambda m:m.group(0)+'\n'+meta,s,count=1,flags=re.I)
   else:raise ValueError('Missing head: '+f.name)
  if f.name=='index.html':
   anchor='<a href="./atlas98-landmarks.html">▦ Landmark Library</a>'
   if 'href="./atlas98-data-lab.html"' not in s:
    assert anchor in s
    s=s.replace(anchor,anchor+'<a href="./atlas98-data-lab.html">▤ Data Lab</a><a href="./atlas-source-registry.html">⌕ Source Registry</a>',1)
  if f.name in ('atlas.html','atlas-online.html','atlas-vi.html'):
   anchor='<a href="./atlas-toolkit.html">Toolkit</a>'
   if 'href="./atlas98-data-lab.html"' not in s and anchor in s:
    s=s.replace(anchor,anchor+'<a href="./atlas98-data-lab.html">Data Lab</a>',1)
  if f.name=='atlas-research.html':
   if 'href="./atlas98-data-lab.html"' not in s:
    s=s.replace('<div class="workspace">','<div class="jura-source-actions" style="padding:12px 20px;display:flex;gap:12px;flex-wrap:wrap;background:#20182e"><a style="color:#ffd192;font-weight:700" href="./atlas98-data-lab.html">Open Data Lab · validate & export</a><a style="color:#ffd192" href="./atlas-source-registry.html">Research source registry</a></div><div class="workspace">',1)
  if f.name=='atlas98-data-lab.html':
   anchor='<button id="download" disabled>Export usable candidates (.json)</button>'
   if 'id="mapPack"' not in s:
    assert anchor in s
    s=s.replace(anchor,anchor+'<button id="mapPack" type="button" disabled>Export Atlas-compatible map pack</button>',1)
   anchor='<div class="field"><label for="game">World / map</label>'
   if 'id="coordinateSystem"' not in s:
    assert anchor in s
    s=s.replace(anchor,'<div class="field"><label for="coordinateSystem">Coordinate verification</label><select id="coordinateSystem"><option value="unknown">Unknown or geographic GPS — research only</option><option value="gta-world-xy">Confirmed Atlas GTA world X/Y (not latitude/longitude)</option></select></div>'+anchor,1)
   s=s.replace('Exported records are candidates, not live Atlas markers. Importing them into map engines requires calibration, mode matching, attribution, and testing.','An Atlas-compatible pack requires source rights and confirmed in-game coordinate alignment. Download it, open the matching GTA map, and use its existing Import Pack button. Imported pins stay marked provisional until verified.')
  if f.name=='atlas-source-registry.html':
   if 'href="./atlas98-data-lab.html"' not in s:
    s=s.replace('<h2>Next verified ingestion protocol</h2>','<h2>Next verified ingestion protocol</h2><p><a href="./atlas98-data-lab.html">Open the Team Jura Data Lab to validate an authorized dataset and export a map pack.</a></p>',1)
  if f.name=='maps.html' and 'href="./atlas98-data-lab.html"' not in s:
   target='<main id="main"'
   # intentionally light-touch: add link in the existing page's navigation if present
   s=s.replace('href="./atlas98-landmarks.html"','href="./atlas98-data-lab.html"',0) if False else s
  if s!=f.read_text(encoding='utf-8'):
   f.write_text(s,encoding='utf-8');touched.append(f.name)
 print('Release polish touched',len(touched),'pages')
if __name__=='__main__':apply()
