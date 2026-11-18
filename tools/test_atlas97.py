#!/usr/bin/env python3
"""Atlas 9.7 package static acceptance. Uses installed script source, no live claims."""
from pathlib import Path
import json, re, sys
ROOT=Path(__file__).resolve().parents[1]

def run():
 html=(ROOT/'atlas97-journey.html').read_text('utf-8');css=(ROOT/'atlas97-journey.css').read_text('utf-8');js=(ROOT/'atlas97-connect.js').read_text('utf-8')
 assert '<main id="main">' in html and 'id="worlds"' in html
 assert 'atlas97-proposed-loki-scaly-hero.webp' in css
 assert 'art/atlas86-scaly-approved.webp' in html and 'art/atlas86-loki-approved.webp' in html
 assert 'GTA VI locations remain unverified community research' in html
 assert 'team-jura-atlas97-last-workspace-v1' in js
 assert 'atlas97-journey.html' in js and 'j89-menu' in js
 assert 'team-jura-atlas90-collection-v1' in (ROOT/'atlas97-journey.js').read_text('utf-8')
 assert (ROOT/'art/atlas97-proposed-loki-scaly-hero.webp').stat().st_size>10000
 assert 'def patch_cluster_engine' in (ROOT/'tools/apply_atlas96.py').read_text('utf-8')
 assert 'apply_96(check)' in (ROOT/'tools/apply_atlas97.py').read_text('utf-8')
 print('Atlas 9.7 contract tests: 9/9 passed (source-level only)')
if __name__=='__main__':run()
