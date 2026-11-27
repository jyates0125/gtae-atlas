import os,json,threading
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parents[1]
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args): pass
with ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT/'public'))) as server:
 threading.Thread(target=server.serve_forever,daemon=True).start()
 with sync_playwright() as p:
  engine=os.environ.get('ATLAS_BROWSER','chromium')
  browser=p.chromium.launch(channel='msedge') if engine=='msedge' else p.chromium.launch()
  for width in (390,1440):
   ctx=browser.new_context(viewport={'width':width,'height':844})
   ctx.route('https://**/*',lambda route:route.abort())
   page=ctx.new_page();url=f'http://127.0.0.1:{server.server_port}/my-crew.html'
   page.goto(url)
   legacy={'schema':1,'game':'story','name':'Legacy Story','tag':'ST','motto':'','bio':'','tasks':[{'text':'Old goal','done':True}]}
   page.evaluate("(v)=>localStorage.setItem('team-jura-my-crew-v1',JSON.stringify(v))",legacy)
   page.reload()
   expect(page.locator('#crewName')).to_have_value('Legacy Story')
   expect(page.locator('#crewSwitcher')).to_be_hidden()
   expect(page.get_by_role('checkbox',name='Completed: Old goal')).to_be_checked()
   page.locator('#crewGame').select_option('online')
   page.locator('#crewName').fill('First Crew')
   page.locator('#crewForm button[type=submit]').click()
   page.locator('#taskInput').fill('First plan');page.locator('#taskForm button').click()
   page.locator('#memberInput').fill('Member A');page.locator('#rosterForm button').click()
   page.locator('#newCrew').click();page.locator('#crewName').fill('Second Crew');page.locator('#crewForm button[type=submit]').click()
   expect(page.locator('#taskList li')).to_have_count(0)
   expect(page.locator('#memberList li')).to_have_count(0)
   page.reload();expect(page.locator('#crewName')).to_have_value('Second Crew')
   page.locator('#crewSelect').select_option('0')
   expect(page.locator('#crewName')).to_have_value('First Crew')
   expect(page.locator('#memberList')).to_contain_text('Member A')
   expect(page.locator('#taskList')).to_contain_text('First plan')
   page.locator('#crewGame').select_option('vi')
   expect(page.locator('#crewSwitcher')).to_be_hidden()
   expect(page.locator('#rosterSection')).to_be_hidden()
   page.locator('#crewName').fill('Leonida HQ');page.locator('#crewForm button[type=submit]').click()
   payload={'schema':1,'game':'story','name':'Conflicting Name','tag':'','motto':'','bio':'','tasks':[{'text':'New goal','done':False}]}
   page.locator('#importCrew').set_input_files({'name':'crew.json','mimeType':'application/json','buffer':json.dumps(payload).encode()})
   expect(page.locator('#backupStatus')).to_contain_text('existing conflicts kept')
   page.locator('#crewGame').select_option('story')
   expect(page.locator('#crewName')).to_have_value('Legacy Story')
   expect(page.locator('#taskList')).to_contain_text('New goal')
   expect(page.get_by_role('checkbox',name='Completed: Old goal')).to_be_checked()
   assert page.evaluate("JSON.parse(localStorage.getItem('team-jura-my-crew-v1')).name")=='Legacy Story'
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+2')
   ctx.close()
  browser.close()
 server.shutdown()
print('PASS legacy migration, separate crews and worlds, additive import, reload and mobile fit')
