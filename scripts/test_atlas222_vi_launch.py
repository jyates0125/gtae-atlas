#!/usr/bin/env python3
"""Atlas 22.2: source-ranked official launch and character/world isolation checks."""
from pathlib import Path
import json
from urllib.parse import urlsplit

R=Path(__file__).resolve().parents[1]
profiles=json.loads((R/'data/atlas-universe-profiles.json').read_text(encoding='utf-8'))
release=json.loads((R/'data/atlas222-vi-release-index.json').read_text(encoding='utf-8'))
char=(R/'atlas-characters.html').read_text(encoding='utf-8')
ch_js=(R/'atlas222-characters.js').read_text(encoding='utf-8')
univ=(R/'atlas100-universe.js').read_text(encoding='utf-8')
nav=(R/'atlas132-nav.js').read_text(encoding='utf-8')
vi=(R/'atlas-vi.html').read_text(encoding='utf-8')
official='https://www.rockstargames.com/VI/only-in-leonida'

assert release['launched']=='2026-11-19'
assert release['scope']=='vi-story'
assert release['reviewedAt']=='2026-11-21'
assert len(release['regions'])==6
assert set(r['name'] for r in release['regions'])=={
 'Vice City','Leonida Keys','Grassrivers','Port Gellhorn','Ambrosia','Mount Kalaga'}
assert len(release['categories'])>=11
for c in release['categories']:
 assert c['status'] and c['note'] and c['sourceId']
 p=urlsplit(c['href']).path
 assert (R/p).is_file(),('missing category route',c)
assert all(s['url'].startswith('https://www.rockstargames.com/')
           for s in release['sources'])
assert len({x['id'] for x in release['categories']})==len(release['categories'])

cast=[r for r in profiles['records'] if r.get('kind')=='character' and r.get('scope')=='vi']
assert len(cast)==8,cast
# The eight publisher-hosted references are source-linked images, not a rights grant.
rockstar_media=[r for r in cast if r.get('image','').startswith('https://www.rockstargames.com/VI/_next/static/media/')]
assert len(rockstar_media)==8,[(r['name'],r.get('image','')) for r in cast]
assert all(r['imageCredit']=='https://www.rockstargames.com/VI/only-in-leonida' for r in rockstar_media)
assert all('reuse rights are not guaranteed' in r['imageRights'] for r in rockstar_media)
assert all('/VI/_next/static/media/' in r['image'] for r in rockstar_media)
assert len({r['image'] for r in rockstar_media})==8,'Character-specific Rockstar media URLs must not repeat'
assert len({r['id'] for r in cast})==len(cast)
all_cast=[r for r in profiles['records'] if r.get('kind')=='character']
assert len(all_cast)==40 and len({r['id'] for r in all_cast})==40
for name in ('Lamar Davis','Lester Crest','Franklin Clinton','Chop'):
 editions=[r for r in all_cast if r['name']==name]
 assert len(editions)==2 and {r['scope'] for r in editions}=={'story','online'}, (name,editions)
 assert all(r['sourceUrl'].startswith('https://') and r['verification'] for r in editions)
assert 'j225-character-appearances' in ch_js, 'Game-specific versions must link to each other'
names={r['name'] for r in cast}
for name in ('Lucia Caminos','Jason Duval','Cal Hampton','Boobie Ike',
             "Dre'Quan Priest",'Real Dimez','Raul Bautista','Brian Heder'):
 assert name in names,name
for r in cast:
 assert r['game']=='GTA VI Story',r
 assert r['sourceUrl']==official,r
 assert 'Rockstar official character profile' in r['verification'],r
 assert r['summary'] and 'spoiler' not in r['summary'].lower()
regions=[r for r in profiles['records'] if r.get('kind')=='landmark' and r.get('scope')=='vi' and r.get('group')=='Official region']
assert len(regions)==6
assert set(x['name'] for x in regions)=={r['name'] for r in release['regions']}
assert all('coordinate not claimed' in x['verification'] for x in regions)

assert 'j222-character-grid' in char and 'j222-character-search' in char
assert 'href="./art/elario-crest.svg"' in char, 'Character page favicon must use approved crowned E'
assert 'data-j222-scope="all"' in char
for scope in ('classic','story','online','vi'):assert f'data-j222-scope="{scope}"' in char
assert 'atlas152-era-iii.svg' not in char
assert 'jura155-characters.webp' in (R/'atlas152-characters.css').read_text()
assert 'const DEFAULT_GAME=MODE===' in univ and "MODE==='character'?'all'" in univ
assert "r.scope==='vi'||/unverified" not in univ, 'GTA VI must not be unconditionally unverified'
assert 'x.aliases||[]' in univ
assert 'atlas-characters.html?game=' in ch_js and 'j222-character-search' in ch_js
assert 'id="j222-profile-dialog"' in char and 'id="j222-profile-content"' in char
assert "let q=(args.get('q')||'').slice(0,120)" in ch_js, 'Deep links must populate character search'
assert 'search.value=q' in ch_js and "'#mainCharacterEra'" in ch_js
assert "details.addEventListener('click'" in ch_js and 'dialog.showModal()' in ch_js
assert "nameMatches=s?" in ch_js and "profile='+encodeURIComponent(r.id)" in ch_js, 'Name-first lookup and shareable profile links are required'
assert "if(r.verification)" in ch_js and "if(srcSafe(r.sourceUrl))" in ch_js
assert 'map-hub.html?game=iii' in ch_js and 'atlas-online.html' in ch_js and 'atlas-vi.html' in ch_js
assert 'CHARACTERS · SEARCH ALL WORLDS' in nav and 'x.aliases' not in nav
assert 'j222-vi-categories' in vi and 'atlas222-vi-release.js?v=222' in vi
assert 'atlas217-vi-world.js?v=217' in vi, 'The existing map engine must stay in place'
assert 'atlas.js?v=191' in vi

# Premium visual and vehicle-class integrity guards: these check source wiring,
# not actual browser rendering, which remains a separate release requirement.
garage3d=(R/'atlas99-garage3d.js').read_text(encoding='utf-8')
config=(R/'atlas101-configurator.js').read_text(encoding='utf-8')
dbcss=(R/'atlas100-universe.css').read_text(encoding='utf-8')
garage=(R/'atlas93-garage.js').read_text(encoding='utf-8')
assert 'const aircraft=' in garage3d and 'const watercraft=' in garage3d
assert 'Aircraft / Plane concept' in config and 'Boat / Watercraft concept' in config
assert '◈ Open this vehicle in the 3D concept studio' in garage
assert 'body[data-atlas-kind="all"] .u-hero-art' in dbcss
assert "url('./art/atlas98-approved-hero.webp')" in dbcss
assert (R/'art/atlas98-approved-hero.webp').is_file()

print('PASS Atlas 22.2: 8 verified VI profile groups, 6 official regions, 11 source-labeled categories, global character search and isolated world routes')
