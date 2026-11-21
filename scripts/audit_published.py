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
 navdata=ROOT/'atlas132-page-directory.json'
 if not navdata.is_file():errors.append('Public universal navigation directory missing')
 else:
  data=json.loads(navdata.read_text())
  page_names={f.name for f in ROOT.glob('*.html')}
  index_names={p.get('path') for p in data.get('pages',[])}
  if page_names!=index_names:errors.append('Public universal navigation directory does not cover every HTML page')
 if not (ROOT/'atlas132-nav.js').is_file() or not (ROOT/'atlas132-nav.css').is_file():errors.append('Universal menu assets missing')
 for f in ROOT.rglob('*.html'):
  if f.parent==ROOT:
   markup=f.read_text(encoding='utf8',errors='replace')
   nav_match=re.search(r'\./atlas132-nav\.js\?v=(\d+)',markup)
   if not nav_match or int(nav_match.group(1))<222 or './atlas132-nav.css?v=132' not in markup:
    errors.append('Global site menu is missing or stale on '+f.name)
   if len(re.findall(r'\./atlas132-nav\.js\?v=\d+',markup))!=1:
    errors.append('Duplicate global navigation script on '+f.name)
   if 'atlas131-social-icons.js' not in markup or 'atlas131-social-icons.css' not in markup:errors.append('Universal sharing footer is missing on '+f.name)
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
 # Verify that Cloudflare's published security header configuration is present and
 # retains its essential protections. This is a build-time check, not an HTTP probe.
 headers=ROOT/'_headers'
 if headers.is_file():
  rules=headers.read_text(encoding='utf-8',errors='replace')
  # Parse selector blocks rather than searching for a literal backslash-n.
  # The global block must remain DENY even when exact map pages allow self-framing.
  blocks={}
  current=None
  for line in rules.splitlines():
   raw=line.strip()
   if not raw or raw.startswith('#'):
    continue
   if not line.startswith((' ','\\t')) and raw.startswith('/'):
    current=raw
    blocks.setdefault(current,{'headers':{},'removed':set()})
   elif current and raw.startswith('! '):
    blocks[current]['removed'].add(raw[2:].strip().lower())
   elif current and ':' in raw:
    key,value=raw.split(':',1)
    blocks[current]['headers'][key.strip().lower()]=value.strip().lower()
  parsed=blocks.get('/*',{}).get('headers',{})
  required={
   'x-content-type-options':'nosniff',
   'x-frame-options':'deny',
   'referrer-policy':'strict-origin-when-cross-origin',
   'permissions-policy':'camera=()',
   'strict-transport-security':'max-age=',
  }
  for key,value in required.items():
   if value not in parsed.get(key,''):
    errors.append('Missing or weakened global Cloudflare security header: '+key)
  allowed_overrides={'/atlas-online.html','/atlas-cayo.html'}
  for selector,block in blocks.items():
   if selector=='/*':
    continue
   frame=block['headers'].get('x-frame-options')
   if selector not in allowed_overrides and (frame or 'x-frame-options' in block['removed']):
    errors.append('Unexpected frame override outside the approved map pages: '+selector)
  for selector in allowed_overrides:
   block=blocks.get(selector,{})
   scoped=block.get('headers',{})
   if scoped.get('x-frame-options')!='sameorigin' or scoped.get('content-security-policy')!="frame-ancestors 'self'" or 'x-frame-options' not in block.get('removed',set()):
    errors.append('Missing or unsafe exact map frame exception: '+selector)
 for name in ('index.html','maps.html','atlas.html','atlas-online.html','atlas-vi.html','atlas-cayo.html','one-last-ride.html','atlas98-data-lab.html','atlas-source-registry.html','_headers'):
  if not (ROOT/name).is_file():errors.append('Missing production-critical: '+name)
 status={'passed':not errors,'html_pages':len(list(ROOT.rglob('*.html'))),'files':len([x for x in ROOT.rglob('*') if x.is_file()]),'errors':errors}
 print(json.dumps(status,indent=2));return int(bool(errors))
if __name__=='__main__':sys.exit(main())
