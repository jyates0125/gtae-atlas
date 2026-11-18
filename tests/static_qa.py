from pathlib import Path
from bs4 import BeautifulSoup
from PIL import Image
import json,subprocess,re,zipfile
root=Path(__file__).resolve().parents[1]
html=(root/'atlas81-hq.html').read_text()
js=(root/'atlas81-hq.js').read_text()
soup=BeautifulSoup(html,'html.parser')
sets=json.loads((root/'atlas81-collections.json').read_text())['sets']
ev=json.loads((root/'atlas81-evidence.json').read_text())['records']
checks=[]
def check(name,value,details=''):checks.append({'test':name,'passed':bool(value),'details':details})
check('JS parse',subprocess.run(['node','--check',str(root/'atlas81-hq.js')],capture_output=True).returncode==0)
check('20 source-labelled collection sets',len(sets)==20,str(len(sets)))
check('Unique set IDs',len(set(x['id'] for x in sets))==len(sets))
check('Correct collection modes',sum(s['mode']=='story' for s in sets)==11 and sum(s['mode']=='online' for s in sets)==9)
check('Evidence IDs valid',all(k in {x['id'] for x in sets} for k in ev))
check('Evidence slot bounds',all(1<=int(i)<=next(s['total'] for s in sets if s['id']==k) for k,rec in ev.items() for i in rec))
check('Direct source links are HTTPS',all(s['sourceUrl'].startswith('https://') for s in sets))
ids={e.get('id') for e in soup.select('[id]')}
check('No repeated HTML IDs',len(ids)==len(soup.select('[id]')))
required=['overview','collections','maps','missions','intel','passport','library','itemGrid','selectedTitle','collDone','exportAll','backupFile','statSets','nav']
check('Interactive component IDs present',all(x in ids for x in required))
check('Image crop exists', (root/'art/atlas81-approved-dashboard-crew.webp').exists())
check('Approved reference present',(root/'reference/Team-Jura-Approved-Dashboard.png').exists())
check('Approved crop readable',Image.open(root/'art/atlas81-approved-dashboard-crew.webp').verify() is None)
check('Local assets valid',all((root / p).exists() for p in ['atlas81-hq.css','atlas81-hq.js','atlas81-collections.json','atlas81-evidence.json','art/atlas81-approved-dashboard-crew.webp']))
check('Local styles resolve',all((root/link['href'][2:]).exists() for link in soup.select('link[rel=stylesheet]') if link.get('href','').startswith('./')))
check('No placeholder target links',not any(a.get('href')=='#' for a in soup.select('a[href]')))
check('Keyboard focus and navigation',bool(soup.select_one('a.skip[href="#main"]')) and bool(soup.select_one('nav[aria-label]')))
# Existing verified repository file names on development branch as of this test; these are not bundled, therefore cloud deployment is required for link tests.
known=set('elario.html one-last-ride.html atlas.html atlas-online.html atlas-vi.html atlas-cayo.html atlas-iv.html atlas-completion.html atlas-verification.html atlas-credits.html atlas-activities.html atlas-research.html atlas-coverage.html atlas-checklist.html atlas-passport.html atlas-catalog.html atlas-toolkit.html atlas-feature-audit.html atlas-test-center.html heist-fleeca.html heist-prison-break.html heist-humane-labs.html heist-series-a.html heist-pacific-standard.html heist-doomsday-act-1.html heist-doomsday-act-2.html heist-doomsday-act-3.html heist-diamond-casino.html heist-cayo-perico.html heist-auto-shop.html heist-agency-vip.html heist-salvage-yard.html heist-cluckin-bell.html heist-kortz-center.html'.split())
local_links=[a['href'][2:].split('?')[0] for a in soup.select('a[href]') if a['href'].startswith('./')]
check('Existing repository navigation paths',all(f in known for f in local_links),','.join(sorted(set(local_links)-known)))
# Browser navigation is not reachable in this environment (ERR_BLOCKED_BY_ADMINISTRATOR), so this is deliberately not marked passed.
checks.append({'test':'Live browser interaction / screenshot comparison','passed':False,'status':'BLOCKED','details':'Chromium returned ERR_BLOCKED_BY_ADMINISTRATOR for local file and localhost; manual Cloudflare acceptance required. Not counted as a product code failure.'})
report={'passed':sum(x['passed'] for x in checks),'total':len(checks),'blocked':1,'tests':checks}
(root/'tests/qa-results.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report,indent=2))
