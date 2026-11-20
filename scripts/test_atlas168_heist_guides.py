#!/usr/bin/env python3
"""Atlas 16.8: premium guided heist flow, safe local completion keys and source references."""
from pathlib import Path
r=Path(__file__).resolve().parents[1]
js=(r/'atlas168-heist-guides.js').read_text()
css=(r/'atlas168-heist-guides.css').read_text()
loader=(r/'heist-pages.js').read_text()
checks=['cayo-perico','kortz-center','diamond-casino','fleeca','humane-labs','prison-break','series-a','pacific-standard','doomsday-act-1','doomsday-act-2','doomsday-act-3','cluckin-bell','salvage-yard','auto-shop','agency-vip']
assert len(checks)==15
for slug in checks:
 assert ("'"+slug+"'") in js,slug
 assert (r/('heist-'+slug+'.html')).is_file(),slug
for label in ['What','When','Where','Why','How','Unlock','Intel','Preps','Finale','Challenges','Show related map POI','Export walkthrough progress']:
 assert label in js,label
assert 'teamjura-heist-walkthrough-v1:' in js and 'localStorage.setItem' in js
assert 'teamjura-heist-focus-v1:' not in js and 'teamjura-heist-plan-v1:' not in js
assert "S('intel','Gather Intel'" in js and "S('intel','Scope Out Kortz Center'" in js
assert 'Art Studio' in js and 'Kosatka' in js and 'Diamond Casino main entrance' in js
assert 'https://www.gtabase.com' in js and 'https://www.gtaboom.com' in js
assert "s.phase===phase" in js
assert 'atlas168-heist-guides.js?v=168' in loader and 'atlas168-heist-guides.css?v=168' in loader
assert 'guide.async=false' in loader and 'focus.async=false' in loader
assert 'jura159-heist-' in loader and "atlas93-heist-'+heistId+'.svg" not in loader
assert css.count('{')==css.count('}') and '@media(max-width:480px)' in css
assert 'background-image:' not in css and '.svg' not in css
browser=(r/'scripts/browser_smoke.py').read_text()
assert "await pg.locator('#j168-heist-guide').wait_for" in browser
assert "teamjura-heist-walkthrough-v1:" in browser and "Walkthrough map POI button" in browser
print('Atlas 16.8 15 heists: 5W prep/finale walkthrough, map context, save/export, artistic non-regression PASS')
