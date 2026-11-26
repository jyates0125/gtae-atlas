#!/usr/bin/env python3
"""Atlas 12.7: catalog visual upgrade without touching private inventory behavior."""
from html.parser import HTMLParser
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
page = (ROOT/"atlas-catalog.html").read_text(encoding="utf-8")
css = (ROOT/"atlas127-catalog-brand.css").read_text(encoding="utf-8")
js = (ROOT/"atlas-catalog.js").read_text(encoding="utf-8")
assert 'class="j112-unified j113-workspace j127-catalog"' in page
assert './atlas127-catalog-brand.css?v=127' in page
for target in ("atlas-database.html","atlas90-vehicles5.html","atlas-forge-collections.html","atlas-credits.html"):
    assert 'href="./'+target+'"' in page and (ROOT/target).exists(), target
for control in ("dbSearch","dbType","dbScope","dbOwned","dbCards","dbExport","dbImport","dbCsv",
                "dbGarageForm","dbVehicleForm","dbFile","dbGarageSelect","dbVehicles","dbGarages",
                "dbPrev","dbNext"):
    assert 'id="'+control+'"' in page,control
assert 'team-jura-catalog-v51' in js, "The original user inventory key must remain untouched"
assert 'atlas93-garage-hero.webp' in css and (ROOT/"art/atlas93-garage-hero.webp").exists()
assert "body.j127-catalog" in css and "prefers-reduced-motion" in css
assert "not verified spawn pins" in page and "never synced to Rockstar" in page
assert "j127-entrypoints" in page and "data:" not in css
class Links(HTMLParser):
    def __init__(self): super().__init__(); self.tags=0
    def handle_starttag(self,tag,attrs):
        if tag=="a": self.tags+=1
html=Links();html.feed(page)
assert html.tags>=15
print("PASS Atlas 12.7: Elario catalog skin, local art, four real tool links, controls + user inventory preserved")
