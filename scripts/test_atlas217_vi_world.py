#!/usr/bin/env python3
"""Atlas 21.7: source-contract for one connected VI world and cinematic Start Here."""
from pathlib import Path
import re
R=Path(__file__).resolve().parents[1]
vi=(R/'atlas-vi.html').read_text(encoding='utf-8')
research=(R/'atlas-research.html').read_text(encoding='utf-8')
start=(R/'atlas97-journey.html').read_text(encoding='utf-8')
worlds=(R/'atlas98-worlds.js').read_text(encoding='utf-8')
portal=(R/'atlas98-portal.js').read_text(encoding='utf-8')
css=(R/'atlas217-vi-world.css').read_text(encoding='utf-8')
js=(R/'atlas217-vi-world.js').read_text(encoding='utf-8')
for dep in ('atlas217-vi-world.css?v=217','atlas217-vi-world.js?v=217'):
 assert dep in vi,dep
assert 'j217-vi-hub' in vi and 'j217-vi-panel' in vi and 'j217-vi-compass' in vi
assert 'j217-vi-research' in research and 'atlas217-vi-world.css?v=217' in research
assert '2026-11-19' in vi and '2026-11-19' in research
for link in ('./atlas-vi.html?view=rockstar','./atlas90-vehicles6.html','./atlas90-weapons6.html',
             './atlas-characters.html?game=vi#results','./atlas-animals.html?game=vi',
             './atlas-research.html','https://www.rockstargames.com/VI/media'):
 assert link in vi,link
assert 'GTA VI · OUT NOW' in vi
assert 'Community coordinates remain provisional' in vi
assert "w.id==='vi'" in portal and "kind:'research'" in worlds
assert 'Interactive Leonida map' in worlds
assert 'j217-vi-hub[hidden]' in css and 'j217-research-bridge' in css
assert 'localStorage' not in js and 'MutationObserver' in js
expected={'story':'jura155-story.webp','online':'jura155-online.webp',
          'vi':'jura155-vi.webp','cayo':'jura155-cayo.webp'}
for game,art in expected.items():
 card=re.search(r'<a class="j97-world" data-j97-world="'+game+r'"[^>]*>(.*?)</a>',start,re.S)
 assert card,game
 assert './art/'+art in card.group(1),(game,art)
 assert (R/'art'/art).is_file(),art
assert 'data-j97-world="vi" href="./atlas-vi.html"' in start
assert 'data-j97-world="cayo" href="./heist-cayo-perico.html"' in start
assert 'atlas97-proposed-loki-scaly-hero.webp' in (R/'atlas97-journey.css').read_text()
assert all('atlas217' not in (R/page).read_text() for page in ('atlas.html','atlas-online.html'))
print('PASS Atlas 21.7: connected VI map index, official source leads, 4 cinematic Start Here covers, world isolation')
