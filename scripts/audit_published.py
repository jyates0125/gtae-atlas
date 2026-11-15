#!/usr/bin/env python3
"""Check actual Cloudflare output, rather than only the working repository."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import json,sys,re
ROOT=(Path(__file__).resolve().parents[1]/'public').resolve()
class Refs(HTMLParser):
 def __init__(self):super().__init__();self.refs=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  for key in ('href','src','poster'):
   if a.get(key):self.refs.append(a[key])
def target(path,ref):
 p=urlsplit(ref.strip())
 if p.scheme or p.netloc or not p.path or p.path.startswith('//'):return None
 if p.path.startswith('/'):dest=ROOT/p.path.lstrip('/')
 else:dest=path.parent/unquote(p.path)
 dest=dest.resolve()
 if not dest.is_relative_to(ROOT):return 'unsafe path'
 if dest.is_dir():dest=dest/'index.html'
 return None if dest.is_file() else 'missing file'
def main():
 errors=[]
 if not (ROOT/'index.html').exists():raise SystemExit('Run node scripts/build-cloudflare.cjs before auditing production output')
 for f in ROOT.rglob('*.html'):
  p=Refs();p.feed(f.read_text(encoding='utf-8',errors='replace'))
  for ref in p.refs:
   error=target(f,ref)
   if error:errors.append(f'{f.relative_to(ROOT)}: {error} {ref}')
 for f in ROOT.rglob('*.css'):
  for ref in re.findall(r'url\(\s*["\']?([^"\')]+)',f.read_text(errors='replace'),re.I):
   error=target(f,ref)
   if error:errors.append(f'{f.relative_to(ROOT)}: {error} {ref}')
 for f in ROOT.rglob('*'):
  if not f.is_file():continue
  if f.suffix in ('.py','.ps1','.yml','.yaml','.key','.pem','.zip') or any(x in f.parts for x in ('scripts','tests','.github','private-lab')):
   errors.append('Non-production file leaked to public: '+str(f.relative_to(ROOT)))
 for name in ('index.html','maps.html','atlas.html','atlas-online.html','atlas-vi.html','atlas-cayo.html','one-last-ride.html','atlas98-data-lab.html','atlas-source-registry.html','_headers'):
  if not (ROOT/name).is_file():errors.append('Missing production-critical: '+name)
 status={'passed':not errors,'html_pages':len(list(ROOT.rglob('*.html'))),'files':len([x for x in ROOT.rglob('*') if x.is_file()]),'errors':errors}
 print(json.dumps(status,indent=2));return int(bool(errors))
if __name__=='__main__':sys.exit(main())
