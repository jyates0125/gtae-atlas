#!/usr/bin/env python3
"""Atlas 14.7 — mobile Garage nav is compact, accessible and non-destructive."""
from pathlib import Path
root=Path(__file__).resolve().parents[1]
h=(root/'atlas93-garage.html').read_text()
css=(root/'atlas147-garage-mobile.css').read_text()
assert '<body class="j147-garage">' in h
assert 'atlas147-garage-mobile.css?v=147' in h
for path in ('atlas81-hq.html','maps.html','heists.html','atlas90-vehicles5.html',
             'atlas-database.html?kind=vehicle','atlas-vehicle-configurator.html','atlas93-dispatch.html'):
 assert 'href="./'+path+'"' in h, path
assert 'scroll-snap-type:x proximity' in css
assert 'overflow-x:auto' in css and 'flex-wrap:nowrap!important' in css
assert '.mast nav a:focus-visible' in css
assert 'j147-garage' not in (root/'atlas.html').read_text()
assert 'j147-garage' not in (root/'atlas-online.html').read_text()
assert 'team-jura-atlas93-garage-v1' in (root/'atlas93-garage.js').read_text()
assert 'team-jura-atlas96-parking-v1' in (root/'atlas96-garage.js').read_text()
print('Atlas 14.7 original branded mobile Garage nav and save-key preservation PASS')
