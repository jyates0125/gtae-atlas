#!/usr/bin/env python3
"""Atlas 32.4: enforce rights-aware, exactly 4:15 film production boundaries."""
import json
from pathlib import Path
from html.parser import HTMLParser

ROOT=Path(__file__).resolve().parents[1]
project=json.loads((ROOT/'film/production/CONDENSED-CUT-255S.json').read_text(encoding='utf-8'))
chapters=project['chapters']
assert project['schema']=='team-jura-olr-animatic-1'
assert len(chapters)==9 and project['runtimeSeconds']==255
assert sum(s['durationSeconds'] for s in chapters)==255
assert [s['card'] for s in chapters]==[8,2,3,5,6,7,1,8,9]
assert all(15<=s['durationSeconds']<=40 for s in chapters)
assert all(s['title'] and s['place'] and s['caption'] for s in chapters)
for s in chapters:
    assert (ROOT/f"film/assets/preview-card-{s['card']:02d}.jpg").is_file()
assert (ROOT/'film/assets/original_teaser_score.wav').is_file()
renderer=(ROOT/'scripts/render_one_last_ride_animatic.py').read_text(encoding='utf-8')
for text in ["previewOnly", "'-stream_loop','-1'","afade=t=out","NO", "'sha256'", "scene['card']"]:
    if text=="NO":continue
    assert text in renderer,text
assert "http://" not in renderer and "https://" not in renderer, 'No media fetch permitted'
assert "NOT FINISHED ANIMATION" in renderer
site=(ROOT/'one-last-ride.html').read_text(encoding='utf-8')
assert 'https://gtae-online.pages.dev/one-last-ride.html' in site
assert 'https://gtae-online.pages.dev/art/atlas98-one-last-ride.webp' in site
assert 'team-jura-atlas-preview.pages.dev/one-last-ride' not in site
assert 'team-jura-atlas-preview.pages.dev/art/atlas98-one-last-ride' not in site
assert 'Leonida awaits' not in site
assert '39-second music-only teaser' in site
assert '4:15 editorial storyboard animatic' in site
assert 'not a finished video or a public film release' in site
production=(ROOT/'film/production/README.md').read_text(encoding='utf-8')
assert '8:30' in production and '255-second' in production and 'not a finished' in production.lower()
class TagParse(HTMLParser):
    def __init__(self):
        super().__init__();self.meta=[]
    def handle_starttag(self, tag, attrs):
        if tag=='meta':self.meta.append(dict(attrs))
parser=TagParse();parser.feed(site)
for name in ['og:url','og:image','twitter:image']:
    tag=next((x for x in parser.meta if x.get('property')==name or x.get('name')==name),None)
    assert tag and tag['content'].startswith('https://gtae-online.pages.dev/'),name
print('Atlas 32.4: 9 original scenes, 255s condensed runtime, approved source assets, corrected GTAE social URLs and unfinished-film disclosure passed')
