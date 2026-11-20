#!/usr/bin/env python3
"""Dependency-free, deployment-safe Atlas source, HTML, CSS and data audit."""
from __future__ import annotations
import json,re,subprocess,sys,urllib.parse
from pathlib import Path
from html.parser import HTMLParser
ROOT=Path(__file__).resolve().parents[1]
class Page(HTMLParser):
 def __init__(self):super().__init__(convert_charrefs=True);self.refs=[];self.ids=[];self.has_title=False
 def handle_starttag(self,tag,attrs):
  d=dict(attrs)
  if tag=='title':self.has_title=True
  if d.get('id'):self.ids.append(d['id'])
  for k in ('src','href','poster'):
   if d.get(k):self.refs.append((k,d[k]))

def local_ref(file,ref):
 ref=ref.strip()
 if not ref or ref.startswith(('#','data:','blob:','mailto:','tel:','javascript:','//')):return None
 u=urllib.parse.urlsplit(ref)
 if u.scheme or u.netloc:return None
 path=urllib.parse.unquote(u.path)
 if not path:return None
 if path.startswith('/'):target=ROOT/path.lstrip('/')
 else:target=file.parent/path
 try:target=target.resolve()
 except Exception:return 'bad-target:'+ref
 if not target.is_relative_to(ROOT.resolve()):return 'outside-site:'+ref
 if target.is_dir():target/= 'index.html'
 if not target.exists():return 'missing:'+ref
 return None

def main():
 errors=[];warnings=[];counts={}
 htmls=list(ROOT.glob('*.html'));css=[p for p in ROOT.rglob('*.css') if 'public' not in p.relative_to(ROOT).parts];js=[p for p in ROOT.rglob('*.js') if 'public' not in p.relative_to(ROOT).parts]
 jsons=[p for p in ROOT.rglob('*.json') if 'public' not in p.relative_to(ROOT).parts]
 for f in htmls:
  parser=Page();parser.feed(f.read_text(encoding='utf-8',errors='replace'))
  if not parser.has_title:errors.append(f'{f.name}: no title')
  if len(set(parser.ids))!=len(parser.ids):warnings.append(f'{f.name}: repeated element IDs')
  for key,url in parser.refs:
   issue=local_ref(f,url)
   if issue:errors.append(f'{f.relative_to(ROOT)}: {issue}')
 for f in css:
  source=f.read_text(encoding='utf-8',errors='replace')
  for raw in re.findall(r'url\(\s*["\']?([^"\')]+)',source,flags=re.I):
   issue=local_ref(f,raw)
   if issue:errors.append(f'{f.relative_to(ROOT)}: {issue}')
 for f in jsons:
  try:json.loads(f.read_text(encoding='utf-8'))
  except Exception as exc:errors.append(f'{f.relative_to(ROOT)}: invalid JSON {exc}')
 for f in js:
  p=subprocess.run(['node','--check',str(f)],capture_output=True,text=True)
  if p.returncode:errors.append(f'{f.relative_to(ROOT)}: JS syntax {p.stderr[-160:]}')
 for f in [ROOT/'art/atlas98-approved-hero.webp',ROOT/'art/atlas86-scaly-approved.webp',ROOT/'art/atlas86-loki-approved.webp',ROOT/'film/assets/approved-crew-poster.webp']:
  if not f.exists():errors.append(f'Missing approved artwork: {f.relative_to(ROOT)}')
 counts.update(html=len(htmls),css=len(css),js=len(js),json=len(jsons),assets=len([f for f in ROOT.rglob('*') if f.is_file() and 'public' not in f.relative_to(ROOT).parts]))
 report={'build':'Team Jura Atlas 9.8C full-site integration','checks':counts,'passed':not errors,'errors':errors,'warnings':warnings,'limitations':['Third-party tile hosts, Cloudflare Pages deployment and end-user browsers cannot be certified by static analysis','GTA V/Online full per-item coordinates and GTA VI official mapping remain incomplete','No unauthorized Rockstar icon or game artwork package is included']}
 (ROOT/'docs').mkdir(exist_ok=True)
 (ROOT/'docs'/'RELEASE-98C-STATIC-REPORT.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
 print(json.dumps({k:v for k,v in report.items() if k!='limitations'},indent=2))
 return 0 if not errors else 1
if __name__=='__main__':sys.exit(main())
