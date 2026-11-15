#!/usr/bin/env python3
"""Offline QA for Atlas 9.8 overlay. Does not certify hosted maps or external data."""
import json,re,subprocess,sys,pathlib
from bs4 import BeautifulSoup
ROOT=pathlib.Path(__file__).resolve().parent.parent
PAGES=['index.html','maps.html','map-hub.html','atlas98-style-lab.html','atlas98-landmarks.html']
BASE_PAGES='''atlas-activities atlas-calibration atlas-catalog atlas-cayo atlas-checklist atlas-completion atlas-coverage atlas-credits atlas-feature-audit atlas-iv atlas-online atlas-pack-format atlas-passport atlas-research atlas-sa atlas-test-center atlas-toolkit atlas-verification atlas-vi atlas atlas8-preview atlas81-hq atlas87-daily atlas90-vehicles5 atlas90-vehicles6 atlas90-weapons atlas93-dispatch atlas93-garage atlas97-journey directory discovery elario explorer guides heist-agency-vip heist-auto-shop heist-cayo-perico heist-cluckin-bell heist-diamond-casino heist-doomsday-act-1 heist-doomsday-act-2 heist-doomsday-act-3 heist-fleeca heist-humane-labs heist-kortz-center heist-pacific-standard heist-prison-break heist-salvage-yard heist-series-a heists hunt-hq index legacy-explorer leonida-hq map-hub maps one-last-ride online-explorer project team-jura'''.split()
BASE_FILES={x+'.html' for x in BASE_PAGES}
BASE_ASSETS='''atlas86-crew-approved.webp atlas86-loki-approved.webp atlas86-scaly-approved.webp atlas93-los-santos.svg atlas93-gta-online.svg atlas93-leonida.svg atlas93-cayo.svg atlas93-liberty.svg atlas93-sa.svg los-santos.svg online.svg leonida.svg island.svg liberty.svg country.svg sunset.svg oldcity.svg vice.svg chin.svg biker.svg nightlife.svg'''.split()
BASE_FILES|={'art/'+x for x in BASE_ASSETS}
errors=[];warnings=[];checks=[]

def check(cond,success,error):
    if cond:checks.append(success)
    else:errors.append(error)

def verify():
    for path in PAGES:
        f=ROOT/path;check(f.exists(),'page '+path,'MISSING '+path)
        if not f.exists():continue
        soup=BeautifulSoup(f.read_text(encoding='utf-8'),'html.parser')
        check(bool(soup.title),'title '+path,'Missing <title> '+path)
        for el in soup.find_all(['a','img','script','link']):
            key='href' if el.name in ('a','link') else 'src';u=el.get(key,'')
            if not u or u.startswith(('#','http:','https:','data:','mailto:','tel:')):continue
            pathpart=u.split('#')[0].split('?')[0].lstrip('./')
            if not pathpart:continue
            check((ROOT/pathpart).is_file() or pathpart in BASE_FILES,'asset/link '+pathpart,'UNRESOLVED '+path+': '+pathpart)
        ids={x.get('id') for x in soup.find_all(id=True)}
        for a in soup.find_all('a',href=True):
            if a['href'].startswith('#') and a['href']!='#':check(a['href'][1:] in ids,'hash '+a['href'],'BROKEN HASH '+path+' '+a['href'])
    code=(ROOT/'atlas98-worlds.js').read_text()
    ids=re.findall(r"\{id:'([a-z]+)'",code)
    check(len(ids)==13,'13 world definitions',f'Expected 13 worlds, found {len(ids)}')
    check(len(set(ids))==13,'unique worlds','Duplicate world ID')
    for js in sorted(ROOT.glob('atlas98-*.js'))+[ROOT/'atlas97-connect.js']:
        p=subprocess.run(['node','--check',str(js)],capture_output=True,text=True)
        check(p.returncode==0,'JS syntax '+js.name,'JS parse error '+js.name+': '+p.stderr)
    for file in ['atlas98-portal.css','atlas98-classic.css','atlas98-flow.css','atlas98-landmarks.css','atlas98-portal.js','atlas98-worlds.js','atlas98-classic.js','atlas98-landmarks.js','atlas98-flow.js','atlas97-connect.js']:
        check((ROOT/file).exists(),'shared file '+file,'MISSING '+file)
    # Provenance is machine readable and every world is represented.
    data=json.loads((ROOT/'data/atlas98-source-rights.json').read_text());check(len(data['worlds'])==13,'13 sources coverage records','Incomplete coverage manifest')
    # Standalone package intentionally depends on files already verified in development baseline.
    warnings.append('Baseline assets and original map pages are references to existing development repository, not bundled replacements.')
    warnings.append('Live Cloudflare map tile hosts, browser saved progress, and third-party data freshness are NOT certified by static tests.')
    out={'release':'9.8','testsPassed':len(checks),'failed':errors,'warnings':warnings,'sourceBranch':'development','baseCommit':'5689876565af2a248b1e230c77fbdaedb43bd85b'}
    (ROOT/'docs/ATLAS98-QA-RESULTS.json').write_text(json.dumps(out,indent=2))
    print(json.dumps(out,indent=2))
    return not errors
if __name__=='__main__':sys.exit(0 if verify() else 1)
