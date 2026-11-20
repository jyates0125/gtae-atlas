#!/usr/bin/env python3
"""Heist HQ 15 scene-specific card images must be paired with their own routes."""
from pathlib import Path
import re
root=Path(__file__).resolve().parents[1]
html=(root/'heists.html').read_text(encoding='utf-8')
links=re.findall(r'href="\./heist-([a-z0-9-]+)\.html"',html)
covers=re.findall(r'class="j151-heist-cover"\s+src="\./art/atlas93-heist-([a-z0-9-]+)\.svg"',html)
assert len(links)==len(covers)==15 and len(set(covers))==15,(len(links),len(covers))
assert links==covers,'Heist cover must follow its own mission route'
for slug in covers:
 assert (root/'art'/f'atlas93-heist-{slug}.svg').is_file(),slug
 assert (root/f'heist-{slug}.html').is_file(),slug
assert 'atlas151-heist-gallery.css?v=151' in html
assert 'j151-heist-cover' in (root/'atlas151-heist-gallery.css').read_text(encoding='utf-8')
print('Atlas 15.1: 15 unique heist scenes/routes PASS')
