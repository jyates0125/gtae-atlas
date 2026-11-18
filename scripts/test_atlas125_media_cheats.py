#!/usr/bin/env python3
"""Atlas 12.6: artwork-first directory, credited character portraits, and per-platform cheats."""
from pathlib import Path
import json, re
from html.parser import HTMLParser

ROOT = Path(__file__).resolve().parents[1]
def source(path):
    return (ROOT / path).read_text(encoding="utf-8")

worlds = source("atlas98-worlds.js")
portal = source("atlas98-portal.js")
css = source("atlas98-portal.css")
credits = source("atlas-credits.html")
expected = ("story","online","vi","cayo","iv","sa","vc","iii","vcs","lcs","ctw","tlad","tbogt")
assert worlds.count("coverFallback:") == len(expected)
for key in expected:
    entry = next((line for line in worlds.splitlines() if "{id:'" + key + "'" in line), None)
    assert entry is not None, key
    assert re.search(r"coverSrc:'https://[^']+',coverFallback:'[^']+'",entry), key
    assert re.search(r"art:'[^']+\\.svg'",entry),key
assert "world-art-frame" in portal and "world-art-main" in portal and "sourceIndex++" in portal
assert ".world-card .world-art-frame" in css
assert 'id="cover-art"' in credits and 'id="reuse"' in credits
for p in ("index.html","maps.html","map-hub.html","atlas98-style-lab.html"):
    html=source(p)
    for asset in ("atlas98-portal.js","atlas98-worlds.js","atlas98-portal.css"):
        assert f"./{asset}?v=125" in html,(p,asset)

profiles=json.loads(source("data/atlas-universe-profiles.json"))
characters=[r for r in profiles["records"] if r["kind"]=="character"]
assert len(characters)==25
assert all(r.get("image","").startswith("https://") for r in characters)
assert all(r.get("imageCredit","").startswith("https://") for r in characters)
assert "data/atlas-universe-profiles.json?v=126" in source("atlas100-universe.js")
animals=[r for r in profiles["records"] if r["kind"]=="animal"]
assert len(animals)>=18
assert len([a for a in animals if a.get("image")])>=3

data=json.loads(source("data/atlas-news-cheats.json"))
assert data["schema"]==1 and data["checkedAt"]>="2026-11-18"
story=[c for c in data["cheats"] if c["game"]=="story"]
sa=[c for c in data["cheats"] if c["game"]=="sa"]
assert len(story)==36 and len(sa)>=17
assert all(r.get("ps") and r.get("code") and r.get("phone") for r in story if r.get("code"))
assert next(r for r in sa if r["code"]=="KANGAROO")["ps"]=="Up Up Triangle Triangle Up Up Left Right Square R2 R2"
assert not any(r["game"]=="sa" and r["code"]=="CJPHONEHOME" and "jump" in r["name"].lower() for r in data["cheats"])
for row in data["cheats"]:
    if row.get("ps"):
        assert all(t in {"Left","Right","Up","Down","Cross","Circle","Square","Triangle","L1","L2","R1","R2"} for t in row["ps"].split()),row
class Doc(HTMLParser):
    def __init__(self):super().__init__();self.ids=set();self.scripts=[]
    def handle_starttag(self,tag,attrs):
        p=dict(attrs)
        if "id" in p: self.ids.add(p["id"])
        if tag=="script":self.scripts.append(p.get("src",""))
page=Doc();page.feed(source("atlas-cheats.html"))
assert {"hubGame","hubSearch","hubPlatform","hubCards","cheatPlatformHelp"}.issubset(page.ids)
assert "./atlas103-hub.js?v=124" in page.scripts
hub=source("atlas103-hub.js")
for needle in ("PS_TO_XBOX","PS3_HD","X360_SWAP","MODERN_PHONE","function tokens","function available"):
    assert needle in hub,needle
print("PASS Atlas 12.6 artwork-first 13 covers, 25 sourced character portraits and cross-platform cheats")
