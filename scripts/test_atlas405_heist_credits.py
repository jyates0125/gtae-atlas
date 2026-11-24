#!/usr/bin/env python3
"""Heist source links are centralized without changing mission controls."""
from html.parser import HTMLParser
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
PAGES=["heist-fleeca.html","heist-prison-break.html","heist-humane-labs.html","heist-series-a.html","heist-pacific-standard.html","heist-doomsday-act-1.html","heist-doomsday-act-2.html","heist-doomsday-act-3.html","heist-diamond-casino.html","heist-cluckin-bell.html","heist-salvage-yard.html","heist-auto-shop.html","heist-agency-vip.html","heist-kortz-center.html","heists.html"]
TARGET="./atlas-credits.html#online-heist-sources"
class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.footer=0
        self.links=[]
        self.ids=[]
        self.steps=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag=="footer": self.footer+=1
        if "id" in a: self.ids.append(a["id"])
        if tag=="a": self.links.append((a.get("href"),self.footer>0))
        if tag=="input" and "data-step" in a: self.steps.append(a["data-step"])
    def handle_endtag(self,tag):
        if tag=="footer": self.footer-=1
def parse(path):
    p=Page()
    p.feed(path.read_text(encoding="utf-8"))
    return p
for base in (ROOT, ROOT/"public"):
    credits=parse(base/"atlas-credits.html")
    assert credits.ids.count("online-heist-sources")==1
    for name in PAGES:
        p=parse(base/name)
        assert [(url,foot) for url,foot in p.links if url==TARGET]==[(TARGET,True)], name
        assert "./heists.html" in [url for url,_ in p.links], name
        if name!="heists.html":
            assert {"stepSearch","exportProgress","resetProgress","progressBar"}.issubset(p.ids), name
            assert p.steps and len(set(p.steps))==len(p.steps), name
            assert "./atlas-online.html" in [url for url,_ in p.links], name
            assert "./atlas-research.html" in [url for url,_ in p.links], name
print("PASS: 15 heist pages, central anchor, mission controls and operational links")
