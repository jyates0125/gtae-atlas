#!/usr/bin/env python3
"""Atlas 12.0: 15 source-safe and distinctly branded heist workspaces."""
from pathlib import Path
from html.parser import HTMLParser
ROOT=Path(__file__).resolve().parents[1]
SLUGS=(
 'fleeca','prison-break','humane-labs','series-a','pacific-standard',
 'doomsday-act-1','doomsday-act-2','doomsday-act-3','diamond-casino',
 'cayo-perico','cluckin-bell','salvage-yard','auto-shop','agency-vip','kortz-center'
)
class HTMLProbe(HTMLParser):
    def __init__(self):
        super().__init__();self.urls=[];self.ids=set();self.svgs=[]
    def handle_starttag(self,tag,attrs):
        d=dict(attrs)
        if d.get('id'):self.ids.add(d['id'])
        for k in ('src','href'):
            u=d.get(k,'')
            if u.startswith('./'):self.urls.append(u[2:].split('#',1)[0].split('?',1)[0])
        if tag=='img':self.svgs.append((d.get('src',''),d.get('alt','')))
assert (ROOT/'atlas120-heist-worlds.css').exists()
css=(ROOT/'atlas120-heist-worlds.css').read_text(encoding='utf-8')
assert css.count('{')==css.count('}')
assert 'not a verified' in css.lower() or 'NOT claim to be a verified' in css
for slug in SLUGS:
    path=f'heist-{slug}.html'
    html=(ROOT/path).read_text(encoding='utf-8')
    parsed=HTMLProbe();parsed.feed(html)
    art=f'./art/atlas93-heist-{slug}.svg'
    assert art in [src for src,alt in parsed.svgs],(path,'missing exact artwork')
    assert (ROOT/art[2:]).stat().st_size>2000,(path,'empty art file')
    assert any('not a verified in-game map' in alt for src,alt in parsed.svgs if src==art),path
    assert 'j120-heist-page' in html and f'data-heist="{slug}"' in html
    assert f'body.j120-heist-page[data-heist="{slug}"]' in css
    assert './atlas120-heist-worlds.css?v=120' in html
    assert './atlas119-workspace-brand.css?v=119' in html
    assert './art/elario-crest.svg' in [src for src,alt in parsed.svgs]
    assert 'MANY CREWS · ONE VISION' in html and 'ATLAS 9.3' not in html
    assert (ROOT/'heist-pages.js').is_file() and './heist-pages.js' in html
    for id in ('stepSearch','progress','progressBar','exportProgress','resetProgress'):
        assert id in parsed.ids,(path,id)
    assert 'Sources & licenses' in html and './atlas-credits.html' in html
    assert 'Not a verified heist overlay' in html and 'No fictional pins or invented routes' in html
    missing=[u for u in parsed.urls if u and not (ROOT/u).is_file()]
    assert not missing,(path,missing)
assert len(SLUGS)==len(set(SLUGS))==15
print('Atlas 12.0 PASS: 15 original heist illustrations, current Elario headers, save-key UI and source cautions')
