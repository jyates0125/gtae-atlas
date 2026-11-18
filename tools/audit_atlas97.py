#!/usr/bin/env python3
"""Whole-site human usability and Designed Brand audit, static only.
Creates one row per HTML page, flags legacy entry points and unsafe claims.
This report never claims to have clicked every button or visually compared CSS.
"""
from pathlib import Path
import json,re
from html.parser import HTMLParser
from collections import Counter
from audit_atlas96 import audit as base_audit
ROOT=Path(__file__).resolve().parents[1]
LEGACY={
 'atlas8-preview.html','directory.html','discovery.html','explorer.html',
 'online-explorer.html','legacy-explorer.html','hunt-hq.html','leonida-hq.html',
}
PUBLIC_STEPS={
 'index.html':'Make the Start Here action obvious and check menu/navigation.',
 'atlas81-hq.html':'Ensure completed sets and map progress clearly link back to a mapped pin.',
 'maps.html':'Each world must clearly say live map, source-only reference, or tracking workspace.',
 'atlas.html':'Test story/online separation, marker detail and 100-stop hunts in browser.',
 'atlas-online.html':'Ensure expired daily records never show current.',
 'atlas-vi.html':'Test Scaly/Loki/Yanis maps, source labels and unobstructed illustration.',
 'atlas-research.html':'Verify community-only pinned records, clustering, 3D fallback and mobile filters.',
 'atlas-cayo.html':'Check entry/exit tools, 2D pinboard vs gameplay and accessible category toggles.',
 'atlas-sa.html':'Replace schematic-only map only when licensed positions are verified.',
 'atlas-iv.html':'Check tile/landmark load; disclose partial game coverage.',
 'atlas93-garage.html':'Validate duplicate-model parking bays, real owned state and imported backups.',
 'atlas90-vehicles5.html':'Test catalog → garage links and owned/wishlist synchronization.',
 'atlas90-vehicles6.html':'Do not present GTA V archive renders as GTA VI evidence.',
 'atlas90-weapons.html':'Check missing models/pictures with original fallback and source credit.',
 'atlas-catalog.html':'Prominently link pictorial catalog and personal garage.',
 'atlas-checklist.html':'Test cross-page completion reconciliation and same-browser persistence.',
 'atlas-completion.html':'Confirm tracked items open the correct map coordinates.',
 'atlas-passport.html':'Distinguish personal notes from actual verified in-game achievements.',
 'heists.html':'Give each heist a clear launch destination and progress overview.',
 'atlas87-daily.html':'Display source dates, reset clocks and unknown states truthfully.',
 'atlas93-dispatch.html':'Make next activity action real and tied to existing trackers.',
 'atlas-verification.html':'Maintain an accessible evidence/provenance key.',
 'atlas-feature-audit.html':'Do not promote static code coverage into live feature parity.',
 'atlas-test-center.html':'Show pass/fail scope and external testing limits.',
 'project.html':'Show current release status instead of the stale 7.x title.',
 'elario.html':'Keep Elario as parent brand; do not imply Rockstar endorsement.',
 'team-jura.html':'Compare new hero and mascots against approved character references.',
 'one-last-ride.html':'Check media loading, mute controls, credit and content notices.',
}
class Page(HTMLParser):
 def __init__(self):super().__init__();self.tags=Counter();self.ids=[];self.links=[];self.scripts=[];self.images=[];self.controls=0
 def handle_starttag(self,tag,attrs):
  a=dict(attrs);self.tags[tag]+=1
  if a.get('id'):self.ids.append(a['id'])
  if tag=='a' and a.get('href'):self.links.append(a['href'])
  if tag=='script' and a.get('src'):self.scripts.append(a['src'])
  if tag=='img':self.images.append({'src':a.get('src'), 'alt':a.get('alt')})
  if tag in ('button','input','select','textarea'):self.controls+=1

def category(p):
 if p.startswith('heist-') or p=='heists.html':return 'Heist missions'
 if p in ('atlas.html','atlas-online.html','atlas-vi.html','atlas-research.html','atlas-cayo.html','atlas-sa.html','atlas-iv.html','maps.html','map-hub.html'):return 'Maps and route tools'
 if any(w in p for w in ('garage','vehicles','weapons','catalog')):return 'Garage and references'
 if any(w in p for w in ('checklist','completion','passport','hunt')):return 'Progress tracking'
 if p in ('index.html','elario.html','team-jura.html','atlas81-hq.html','project.html','one-last-ride.html','atlas97-journey.html'):return 'Homepage and branded universe'
 return 'Supporting / archived'

def produce():
 base=base_audit()
 result=[]
 for file in sorted(ROOT.glob('*.html')):
  text=file.read_text('utf-8',errors='replace');p=Page();p.feed(text)
  name=file.name
  stale=bool(re.search(r'ATLAS\s*7(?:\.\d+)?\s*(?:PREVIEW|STUDIO|EXPLORER|/)',text,re.I))
  group=category(name)
  next_action=PUBLIC_STEPS.get(name, 'Ensure visitor has one clear next action, working links, source credit, and responsive layout.')
  if name in LEGACY:next_action='Keep as archived functional workspace; provide obvious link to modern experience.'
  elif name.startswith('heist-'):next_action='Review individual setup checklist and mark schematic pins vs confirmed gameplay sources.'
  result.append({'page':name,'section':group,'legacy':name in LEGACY,
   'staticControls':p.controls,'scripts':len(p.scripts),'images':len(p.images),
   'duplicateIds':[k for k,v in Counter(p.ids).items() if v>1],
   'hasH1':p.tags['h1']>0,'hasMain':p.tags['main']>0,
   'brandMentions':{'elario':'ELARIO' in text.upper(),'team_jura':'TEAM JURA' in text.upper()},
   'staleVersionMarkerInSource':stale,'currentJourneyLink':any('atlas97-journey.html' in x for x in p.links),
   'sitewideBridgeInstalled':any('atlas97-connect.js' in x for x in p.scripts),
   'recommendedHumanQA':next_action})
 report={'schema':1,'source':'static development branch after cumulative integration',
  'scope':'structural audit, NOT a browser/live art or full gameplay verification',
  'pages':result,'count':len(result),'legacyCount':sum(x['legacy'] for x in result),
  'withDirectStartHereLink':sum(x['currentJourneyLink'] for x in result),
  'withJ97Bridge':sum(x['sitewideBridgeInstalled'] for x in result),
  'criticalUnresolved':[
    'Current hosted preview not yet verified against the approved visual reference pack.',
    'GTA VI provisional positions require post-release gameplay verification.',
    'Third-party archive image reuse rights and live hosting remain separate checks.',
    'Historic gallery, checklist and map progress keys overlap and need careful reconciliation.',
    'Legacy page names/versions still exist in the underlying markup; do not rewrite working engines only for labels.',
    'Heist workspace maps are mostly schematic, not confirmed driving routes.',
    'Offline and mobile map-loading QA require a deployed browser run.'
  ],'baseAuditSummary':{'pages':base['pagesChecked'],'missingRefs':base['brokenResourceReferences'],
                        'criticalMissing':base['criticalMissingPages']}}
 out=ROOT/'docs/ATLAS97-HUMAN-UX-AUDIT.generated.json';out.parent.mkdir(parents=True,exist_ok=True);out.write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n','utf-8')
 print(f"Atlas 9.7 usability audit: {len(result)} pages, {report['legacyCount']} archived, {report['withJ97Bridge']} with Start Here bridge")
 return report
if __name__=='__main__':
 v=produce()
 if v['baseAuditSummary']['criticalMissing']:raise SystemExit('Missing critical page(s)')
