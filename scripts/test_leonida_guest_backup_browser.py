import json,threading
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parents[1]
J='team-jura-vi-journeys-v1';O='team-jura-objective-progress-v1:vi-story';A='vj-'+'a'*32;B='vj-'+'b'*32;ID='vi-o-7d4b983e21a6'
def journey(id,name,notes):return {'schema':J,'scope':'vi-story','active':id,'profiles':[{'id':id,'name':name,'chapter':'','character':'','goal':'','notes':notes}]}
def mark(id,note):
 data={'schema':'team-jura-objective-progress-v1','scope':'vi-story','items':{ID:{'done':True,'queued':False,'note':note}}}
 if id:data['profile']=id
 return data
def payload(saves):return {'app':'Elario Studios Team Jura Atlas','version':1,'saves':saves}
def encoded(records):return {k:json.dumps(v) for k,v in records.items()}
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
with ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT/'public'))) as server:
 threading.Thread(target=server.serve_forever,daemon=True).start()
 base=f'http://127.0.0.1:{server.server_port}/'
 with sync_playwright() as pw:
  browser=pw.chromium.launch()
  for width in (390,1440):
   ctx=browser.new_context(viewport={'width':width,'height':844},accept_downloads=True)
   ctx.route('https://**/*',lambda route:route.abort())
   p=ctx.new_page();p.goto(base+'atlas-account.html')
   local=encoded({J:journey(A,'Run A','local'),O:mark(None,'general'),O+':'+A:mark(A,'local note')})
   local['unrelated-private-token']='do-not-export'
   p.evaluate('(s)=>Object.entries(s).forEach(([k,v])=>localStorage.setItem(k,v))',local)
   with p.expect_download() as dl:p.locator('#j131Export').click()
   backed=json.loads(Path(dl.value.path()).read_text())['saves']
   assert all(backed[k]==local[k] for k in (J,O,O+':'+A))
   assert 'unrelated-private-token' not in backed
   remote=journey(A,'Run A changed','remote');remote['profiles']+=journey(B,'Run B','new')['profiles']
   incoming=encoded({J:remote,O+':'+A:mark(A,'remote note'),O+':'+B:mark(B,'new mark')})
   p.once('dialog',lambda d:d.accept())
   p.locator('#j131Import').set_input_files({'name':'restore.json','mimeType':'application/json','buffer':json.dumps(payload(incoming)).encode()})
   expect(p.locator('#j131ProgressStatus')).to_contain_text('2 existing conflicts kept')
   stored=p.evaluate('(keys)=>Object.fromEntries(keys.map(k=>[k,JSON.parse(localStorage.getItem(k))]))',[J,O,O+':'+A,O+':'+B])
   assert stored[J]['profiles'][0]['notes']=='local'
   assert stored[O+':'+A]['items'][ID]['note']=='local note'
   assert stored[O+':'+B]['items'][ID]['note']=='new mark'
   assert stored[O]['items'][ID]['note']=='general'
   before=p.evaluate('()=>JSON.stringify(Object.entries(localStorage).sort())')
   bad=encoded({O+':'+('vj-'+'c'*32):mark('vj-'+'c'*32,'orphan')})
   bad['jura3-progress']='should-not-write'
   p.once('dialog',lambda d:d.accept())
   p.locator('#j131Import').set_input_files({'name':'bad.json','mimeType':'application/json','buffer':json.dumps(payload(bad)).encode()})
   expect(p.locator('#j131ProgressStatus')).to_contain_text('unavailable Leonida playthrough')
   assert p.evaluate('()=>JSON.stringify(Object.entries(localStorage).sort())')==before
   p.goto(base+'atlas-activities.html?mode=vi')
   expect(p.locator('#vj-select')).to_have_value(A)
   p.goto(base+'atlas-collectibles.html?game=vi')
   expect(p.locator('#jo-done')).to_have_text('1',timeout=20000)
   p.locator('#jo-profile').select_option(B)
   expect(p.locator('#jo-done')).to_have_text('1')
   ctx.close()
  browser.close()
print('PASS manual guest backup, two scopes, conflicts, orphan rejection and actual reload phone/desktop')
