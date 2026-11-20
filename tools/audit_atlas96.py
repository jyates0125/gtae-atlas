#!/usr/bin/env python3
"""Repo-wide static page integrity/Designed Brand audit (not a browser test).
Checks local resource links, key page assets, visual authority references, and
basic accessibility. Reports warnings without claiming screenshot parity.
"""
from __future__ import annotations
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlparse, unquote
from collections import Counter
import json
import re

ROOT=Path(__file__).resolve().parents[1]
REPORT=ROOT/'docs'/'ATLAS96-SITE-AUDIT.generated.json'
CRITICAL=['index.html','maps.html','atlas.html','atlas-online.html','atlas-vi.html',
          'atlas-research.html','atlas93-garage.html','atlas90-vehicles5.html',
          'atlas90-vehicles6.html','heists.html','atlas81-hq.html','atlas-feature-audit.html']
class Scan(HTMLParser):
    def __init__(self):
        super().__init__();self.refs=[];self.ids=[];self.images_missing_alt=0;self.title=False;self.main=False;self.body='';self.headline=False
    def handle_starttag(self,t,attrs):
        a=dict(attrs)
        if t=='title':self.title=True
        if t=='main':self.main=True
        if t=='h1':self.headline=True
        if t=='img' and 'alt' not in a:self.images_missing_alt+=1
        if 'id' in a:self.ids.append(a['id'])
        for key in ('src','href'):
            if key in a and t in ('script','link','img','a','source'):
                self.refs.append((t,key,a[key]))


def audit():
    html=sorted(ROOT.glob('*.html'));pages=[];all_broken=[]
    for p in html:
        parser=Scan();text=p.read_text('utf-8',errors='replace');parser.feed(text)
        missing=[];names=Counter(parser.ids)
        dup=sorted(k for k,v in names.items() if v>1)
        for tag,key,url in parser.refs:
            if not url or url.startswith(('#','data:','blob:','mailto:','tel:','javascript:','//')):continue
            parsed=urlparse(url)
            if parsed.scheme or parsed.netloc or not parsed.path:continue
            target=unquote(parsed.path)
            if '{' in target or '${' in target or target.startswith('/'):continue
            path=(p.parent/target).resolve()
            if ROOT not in path.parents and path!=ROOT:continue
            if not path.is_file() and not path.is_dir():
                missing.append({'tag':tag,'attribute':key,'resource':url})
                all_broken.append({'page':p.name,'resource':url})
        page={'page':p.name,'title':parser.title,'main':parser.main,'h1':parser.headline,
              'duplicateIds':dup,'imagesMissingAlt':parser.images_missing_alt,
              'missingResources':missing,'approvedBrandWords':{'elario':'ELARIO' in text.upper(),'team_jura':'TEAM JURA' in text.upper()}}
        pages.append(page)
    def group(name):
        if name.startswith('heist-'):return 'Heist workspaces'
        if name in ('atlas.html','atlas-online.html','atlas-vi.html','atlas-research.html','atlas-cayo.html','atlas-sa.html','atlas-iv.html','maps.html','map-hub.html'):return 'Maps & worlds'
        if 'garage' in name or 'vehicles' in name or 'catalog' in name:return 'Garage & catalogs'
        if 'checklist' in name or 'collection' in name or 'completion' in name:return 'Progress & collectibles'
        if name in ('index.html','elario.html','team-jura.html','project.html','atlas81-hq.html'):return 'Brand & dashboard'
        return 'Supporting / legacy'
    by_group={}
    for p in pages:by_group.setdefault(group(p['page']),[]).append(p['page'])
    critical_missing=[p for p in CRITICAL if not (ROOT/p).is_file()]
    outputs={'schema':1,'branch':'development (expected)','type':'static repository inspection, NOT a runtime browser or visual parity claim',
             'pagesChecked':len(pages),'scriptCount':len(list(ROOT.glob('*.js'))),
             'stylesCount':len(list(ROOT.glob('*.css'))),
             'brokenResourceReferences':len(all_broken),'criticalMissingPages':critical_missing,
             'duplicateHtmlIds':sum(len(p['duplicateIds']) for p in pages),
             'imagesWithoutAlt':sum(p['imagesMissingAlt'] for p in pages),'groups':by_group,'pages':pages,
             'authoritativeBrandAssets':{'imageMaster':(ROOT/'docs/APPROVED-DESIGNED-BRAND-MASTER.png').exists(),
                     'writtenMaster':(ROOT/'docs/ATLAS92-MASTER-SPEC.md').exists(),
                     'crewScaly':(ROOT/'art/atlas86-scaly-approved.webp').exists(),
                     'crewLoki':(ROOT/'art/atlas86-loki-approved.webp').exists()},
             'knownExternalQA':'Map tiles, image licenses, browser WebGL, responsive layout and Rockstar gameplay require manual verification.'}
    REPORT.parent.mkdir(parents=True,exist_ok=True)
    REPORT.write_text(json.dumps(outputs,indent=2,ensure_ascii=False)+'\n','utf-8')
    print('Atlas 9.6 static sweep:',outputs['pagesChecked'],'pages; ',outputs['brokenResourceReferences'],'missing links/assets; ',outputs['duplicateHtmlIds'],'duplicate IDs; ',outputs['imagesWithoutAlt'],'images missing alt')
    print('Critical missing pages:',critical_missing)
    for row in all_broken[:20]:print('BROKEN',row['page'],'=>',row['resource'])
    for k,v in outputs['authoritativeBrandAssets'].items():print('BRAND',k,'PASS' if v else 'MISSING')
    return outputs
if __name__=='__main__':
    report=audit()
    if report['criticalMissingPages']:raise SystemExit(2)
