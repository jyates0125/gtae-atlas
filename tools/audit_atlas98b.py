#!/usr/bin/env python3
"""Passive static HTML/link/asset and project inventory audit. No browser interaction.
Designed to run after unpacking the overlay into a full development-branch checkout.
"""
from __future__ import annotations
import argparse,datetime as dt,json,pathlib,re,urllib.parse
from html.parser import HTMLParser

class PageParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True);self.links=[];self.title='';self._in_title=False;self.ids=set()
    def handle_starttag(self,tag,attrs):
        d=dict(attrs);v=d.get('id');self.ids.add(v) if v else None
        if tag=='title':self._in_title=True
        for attr in ('href','src','poster'):
            if attr in d and d[attr]:self.links.append((tag,attr,d[attr]))
    def handle_endtag(self,tag):
        if tag=='title':self._in_title=False
    def handle_data(self,data):
        if self._in_title:self.title+=data


def scan(root:pathlib.Path):
    pages=[];broken=[];warnings=[]
    htmls=sorted(root.glob('*.html'))
    for page in htmls:
        text=page.read_text('utf-8',errors='replace');parser=PageParser();parser.feed(text)
        missing=[];external=0
        if not parser.title.strip():warnings.append({'page':page.name,'issue':'missing-title'})
        elif re.search(r'Atlas\s*(?:6\.|7\.|8\.[013]|9\.[0-3])|7\.4\b',parser.title,re.I):
            warnings.append({'page':page.name,'issue':'stale-title','value':parser.title.strip()})
        for tag,attr,link in parser.links:
            link=link.strip()
            if not link or link.startswith(('#','data:','mailto:','tel:','javascript:','blob:')):continue
            parts=urllib.parse.urlsplit(link)
            if parts.scheme or parts.netloc or link.startswith('//'):
                external+=1;continue
            rel=urllib.parse.unquote(parts.path).lstrip('/')
            if not rel:rel='index.html'
            target=(page.parent/rel).resolve()
            if not target.is_relative_to(root.resolve()):
                missing.append({'url':link,'reason':'escapes-repo-root','tag':tag});continue
            if target.is_dir():target=target/'index.html'
            if not target.exists():missing.append({'url':link,'reason':'missing-local-file','tag':tag})
        if missing:broken.append({'page':page.name,'missing':missing})
        pages.append({'page':page.name,'title':parser.title.strip(),'localRefs':len(parser.links)-external,'externalRefs':external,'missing':len(missing)})
    return {'type':'static-repository-inventory','timestampUTC':dt.datetime.now(dt.timezone.utc).isoformat(),'root':str(root),'pageCount':len(pages),'pages':pages,'missingByPage':broken,'warnings':warnings,'limitations':['Does not execute JavaScript, map engines, fetch requests, localStorage or click handlers','Dynamic JS-created image/link paths require hosted browser QA','External source hosts and map tiles not checked'],'newPackagePages':sum(1 for p in pages if p['page'].startswith('atlas98'))}

def main():
    p=argparse.ArgumentParser();p.add_argument('--root',type=pathlib.Path,default=pathlib.Path('.'));p.add_argument('--output',type=pathlib.Path,default=pathlib.Path('docs/ATLAS98B-DEPLOY-AUDIT.json'));p.add_argument('--strict',action='store_true');a=p.parse_args()
    root=a.root.resolve();report=scan(root);out=a.output if a.output.is_absolute() else root/a.output;out.parent.mkdir(parents=True,exist_ok=True);out.write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
    print(f"Pages {report['pageCount']}; pages with missing local references {len(report['missingByPage'])}; stale/missing titles {len(report['warnings'])}")
    print('Report:',out)
    if a.strict and report['missingByPage']:raise SystemExit(1)
if __name__=='__main__':main()
