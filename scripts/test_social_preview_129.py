#!/usr/bin/env python3
"""Atlas 12.9 public social share: absolute Open Graph image and truthful development preview."""
from pathlib import Path
from html.parser import HTMLParser
ROOT=Path(__file__).resolve().parents[1]
html=(ROOT/"index.html").read_text(encoding="utf8")
class Parser(HTMLParser):
 def __init__(self): super().__init__();self.meta={};self.links={}
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=="meta" and ("property" in a or "name" in a):self.meta[a.get("property",a.get("name"))]=a.get("content")
  if tag=="link" and "rel" in a:self.links[a["rel"]]=a.get("href")
p=Parser();p.feed(html)
base="https://gtae-online.pages.dev/"
assert p.meta["og:type"]=="website"
assert p.meta["og:url"]==base
assert p.meta["og:image"]==base+"art/atlas98-approved-hero.webp"
assert p.meta["og:site_name"]=="GTAE · Elario Studios"
assert "development preview" in p.meta["og:description"].lower()
assert "13 GTA destinations" in p.meta["og:description"]
assert p.meta["twitter:card"]=="summary_large_image"
assert p.meta["twitter:image"]==p.meta["og:image"]
assert p.links["canonical"]==base
assert p.links["icon"]=="./art/elario-crest.svg"
assert (ROOT/"art/atlas98-approved-hero.webp").is_file()
assert (ROOT/"art/elario-crest.svg").is_file()
assert 'data-page="home"' in html and 'id="featuredGrid"' in html
print("PASS Atlas 12.9: social cards use correct absolute image, active project name and preview language")
