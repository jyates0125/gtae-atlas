#!/usr/bin/env python3
"""Player-first route contract: no generic My Garage link to management."""
import json
import re
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit
ROOT=Path(__file__).resolve().parents[1]
class Anchors(HTMLParser):
    def __init__(self):
        super().__init__();self.links=[];self.current=None
    def handle_starttag(self, tag, attrs):
        if tag=="a": self.current=[dict(attrs).get("href",""),""]
    def handle_data(self,data):
        if self.current is not None:self.current[1]+=data
    def handle_endtag(self,tag):
        if tag=="a" and self.current is not None:self.links.append(self.current);self.current=None
pages=json.loads((ROOT/"atlas132-page-directory.json").read_text(encoding="utf-8"))["pages"]
bad=[]
for row in pages:
    page=ROOT/row["path"]
    parser=Anchors();parser.feed(page.read_text(encoding="utf-8"))
    for href,label in parser.links:
        url=urlsplit(href)
        if url.path.removeprefix("./")=="atlas93-garage.html" and not url.query and re.search(r"\bmy garage\b",label,re.I):
            bad.append((row["path"],href,label))
assert not bad,bad
for name in ("atlas.html","atlas-online.html","atlas-vi.html"):
    html=(ROOT/name).read_text(encoding="utf-8")
    assert '<section class="offline" id="datasets"><details class="j4725-advanced">' in html,name
    for control in ("packFile","loadPack","sourceToggles","legend","atlasCanvas"):
        assert html.count('id="'+control+'"')==1,(name,control)
for name in ("atlas-forge-collections.html","atlas-vehicle-configurator.html"):
    assert 'href="./atlas93-garage.html"' in (ROOT/name).read_text(encoding="utf-8"),name
print(f"PASS {len(pages)} indexed pages: canonical My Garage links; management still reachable; optional map packs")
