import json,threading
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parents[1]
KEY='team-jura-objective-progress-v1:vi-story'
LEGACY='team-jura-vi-activity-counts-v1'
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args): pass
with ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT/'public'))) as server:
 threading.Thread(target=server.serve_forever,daemon=True).start()
 base=f'http://127.0.0.1:{server.server_port}/'
 with sync_playwright() as pw:
  browser=pw.chromium.launch()
  for width in (390,1440):
   ctx=browser.new_context(viewport={'width':width,'height':844},accept_downloads=True)
   ctx.route('https://**/*',lambda route:route.abort())
   p=ctx.new_page();p.goto(base+'atlas-collectibles.html?game=vi')
   expect(p.locator('#leonidaDiscovery')).to_be_visible(timeout=20000)
   expect(p.locator('.jo-card')).to_have_count(40,timeout=20000)
   p.locator('#jo-category').select_option('flamingos-cards')
   expect(p.locator('.jo-card')).to_have_count(24)
   p.locator('#jo-search').fill('Charlie Spears')
   expect(p.locator('.jo-card')).to_contain_text('Conflicting location reports')
   expect(p.locator('.jo-card a')).to_have_count(0)
   p.locator('#jo-category').select_option('all')
   p.evaluate("(k)=>localStorage.setItem(k,'old-counts')",LEGACY)
   p.locator('#jo-search').fill('King Gator')
   expect(p.locator('.jo-card')).to_have_count(1)
   card=p.locator('.jo-card');card.get_by_role('button',name='Hunt next',exact=True).click()
   expect(p.locator('#jo-queued')).to_have_text('1')
   card.locator('summary').click();card.locator('textarea').fill('Find the entrance')
   card.get_by_role('button',name='Save note').click()
   expect(p.locator('#jo-message')).to_have_text('Saved on this device.')
   card.get_by_role('button',name='Mark visited').click()
   expect(p.locator('#jo-done')).to_have_text('1')
   expect(p.locator('.jo-card')).to_have_count(0)
   p.locator('#jo-filter').select_option('done')
   expect(p.locator('.jo-card')).to_have_count(1)
   card.locator('summary').click();expect(card.locator('textarea')).to_have_value('Find the entrance')
   assert 'search=' in card.get_by_role('link',name='Search Leonida map (approximate)').get_attribute('href')
   p.reload();expect(p.locator('#jo-done')).to_have_text('1',timeout=20000)
   assert p.evaluate('(k)=>localStorage.getItem(k)',LEGACY)=='old-counts'
   assert p.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
   p.locator('.jo-backup summary').click()
   with p.expect_download() as download:p.locator('#jo-export').click()
   backup=json.loads(Path(download.value.path()).read_text())
   assert backup['items']['vi-o-7d4b983e21a6']['done']
   # Explicit separate profile scope, never implicitly move the unassigned mark.
   journey='vj-'+'a'*32
   journey2='vj-'+'b'*32
   p.evaluate("""([a,b])=>localStorage.setItem('team-jura-vi-journeys-v1',JSON.stringify({schema:'team-jura-vi-journeys-v1',scope:'vi-story',active:a,profiles:[a,b].map((id,i)=>({id,name:'Run '+(i+1),chapter:'',character:'',goal:'',notes:''}))}))""",[journey,journey2])
   p.reload();expect(p.locator('#jo-done')).to_have_text('1',timeout=20000)
   p.locator('#jo-profile').select_option(journey)
   expect(p.locator('#jo-done')).to_have_text('0')
   p.locator('#jo-search').fill('King Gator')
   p.locator('.jo-card').get_by_role('button',name='Mark visited').click()
   expect(p.locator('#jo-done')).to_have_text('1')
   p.locator('#jo-profile').select_option(journey2)
   expect(p.locator('#jo-done')).to_have_text('0')
   p.locator('.jo-card summary').click();p.locator('.jo-card textarea').fill('Unsaved second run')
   p.locator('#jo-profile').select_option(journey)
   expect(p.locator('#jo-profile')).to_have_value(journey2)
   expect(p.locator('#jo-message')).to_contain_text('Save or discard')
   p.once('dialog',lambda dialog:dialog.accept())
   p.locator('#jo-discard').click()
   p.locator('#jo-profile').select_option(journey)
   expect(p.locator('#jo-done')).to_have_text('1')
   p.locator('#jo-profile').select_option('')
   expect(p.locator('#jo-done')).to_have_text('1')
   assert p.evaluate("([k,a,b])=>JSON.parse(localStorage.getItem(k)).items['vi-o-7d4b983e21a6'].done&&JSON.parse(localStorage.getItem(k+':'+a)).profile===a&&localStorage.getItem(k+':'+b)===null",[KEY,journey,journey2])
   # Hold the asynchronous file read; all scope and note controls must freeze.
   p.locator('#jo-profile').select_option(journey)
   p.locator('#jo-filter').select_option('all')
   p.locator('#jo-search').fill('King Gator')
   if p.locator('.jo-backup').get_attribute('open') is None:
    p.locator('.jo-backup summary').click()
   p.evaluate("""()=>{window.originalFileText=File.prototype.text;File.prototype.text=function(){const file=this;return new Promise(resolve=>{window.finishFileRead=()=>resolve(window.originalFileText.call(file))})}}""")
   profile_backup={'schema':backup['schema'],'scope':'vi-story','profile':journey,'items':{'vi-o-7d4b983e21a6':{'done':True,'queued':True,'note':'Imported run one'}}}
   p.locator('#jo-import').set_input_files({'name':'profile.json','mimeType':'application/json','buffer':json.dumps(profile_backup).encode()})
   expect(p.locator('#jo-profile')).to_be_disabled()
   expect(p.locator('.jo-card [data-action=mark]')).to_be_disabled()
   p.evaluate("()=>window.finishFileRead()")
   expect(p.locator('#jo-profile')).to_be_enabled()
   expect(p.locator('#jo-profile')).to_have_value(journey)
   assert p.evaluate("([k,a])=>JSON.parse(localStorage.getItem(k+':'+a)).items['vi-o-7d4b983e21a6'].note",[KEY,journey])=='Imported run one'
   assert p.evaluate("([k,b])=>localStorage.getItem(k+':'+b)",[KEY,journey2]) is None
   p.evaluate("()=>{File.prototype.text=window.originalFileText}")
   # A later save must not overwrite a note changed in another tab.
   p.locator('.jo-card summary').click()
   p.locator('.jo-card textarea').fill('My unsaved edit')
   second=ctx.new_page();second.goto(base+'atlas-collectibles.html?game=vi')
   second.evaluate("([k,a])=>{const key=k+':'+a,v=JSON.parse(localStorage.getItem(key));v.items['vi-o-7d4b983e21a6'].note='Other tab edit';localStorage.setItem(key,JSON.stringify(v))}",[KEY,journey])
   p.locator('.jo-card [data-action=note]').click()
   expect(p.locator('#jo-message')).to_contain_text('Note changed in another tab')
   expect(p.locator('.jo-card textarea')).to_have_value('My unsaved edit')
   assert p.evaluate("([k,a])=>JSON.parse(localStorage.getItem(k+':'+a)).items['vi-o-7d4b983e21a6'].note",[KEY,journey])=='Other tab edit'
   p.once('dialog',lambda dialog:dialog.accept());p.locator('#jo-discard').click()
   second.close()
   p.locator('#jo-profile').select_option('')
   p.evaluate("(k)=>localStorage.setItem(k,'broken')",KEY);p.reload()
   expect(p.locator('#jo-message')).to_contain_text('Editing paused',timeout=20000)
   expect(p.locator('.jo-card [data-action=mark]').first).to_be_disabled()
   assert p.evaluate('(k)=>localStorage.getItem(k)',KEY)=='broken'
   p.locator('[data-world=story]').click();expect(p.locator('#leonidaDiscovery')).to_be_hidden()
   p.locator('[data-world=vi]').click();expect(p.locator('#leonidaDiscovery')).to_be_visible()
   ctx.close()
  browser.close()
print('PASS Leonida discovery workspace, phone/desktop, progress, note, queue, backup, corruption and world isolation')
