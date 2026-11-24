#!/usr/bin/env python3
"""Atlas 10.4 specs + Elario brand + heist-operation map contract."""
from pathlib import Path
import json,re
D=Path(__file__).resolve().parents[1]
data=json.loads((D/'data/atlas-vehicle-intel.json').read_text(encoding='utf-8'))
seed=json.loads((D/'atlas90-seed.json').read_text(encoding='utf-8'))
assert data['schema']==1 and data['checkedAt']=='2026-11-17'
assert len(data['vehicles'])>=20
for model,row in data['vehicles'].items():
    assert model in seed['vehicles'],f'Model {model} not in source archive'
    assert row['model']==model and row['sourceUrl'].startswith('https://gtadb.net/gta-online/vehicles/')
    assert row['category'] and row['description'] and (row['manufacturer'] is None or isinstance(row['manufacturer'],str))
    assert row['seats'] is None or (type(row['seats']) is int and row['seats']>0)
    if row['seats'] is None:
        assert 'conflict' in row['confidence'].lower() and row.get('secondarySourceUrl'),model
    assert row['priceUSD'] is None or (isinstance(row['priceUSD'],int) and row['priceUSD']>=0)
    assert row['topSpeedMph'] is None or (isinstance(row['topSpeedMph'],(int,float)) and row['topSpeedMph']>0)
assert data['vehicles']['jetmax']['seats'] is None, 'Do not invent a seat count when sources disagree'
assert data['vehicles']['squalo']['category']=='Boats & Watercraft'
assert data['vehicles']['squalo']['topSpeedMph']==65.75
assert data['vehicles']['squalo']['priceUSD']==196621
assert data['vehicles']['squalo']['customizable'] is False
assert data['vehicles']['squalo']['purchaseSite']=='DockTease'
assert data['vehicles']['squalo']['storage']=='Pegasus vehicle'
assert data['vehicles']['squalo']['delivery']=='Pegasus Concierge'
assert data['vehicles']['squalo']['secondarySourceUrl'].startswith('https://www.gtabase.com/')
assert data['vehicles']['alkonost']['category']=='Planes & Aircraft'
assert data['vehicles']['akula']['category']=='Helicopters'
assert data['vehicles']['adder']['category']=='Super'
js=(D/'atlas93-garage.js').read_text(encoding='utf-8')
html=(D/'atlas93-garage.html').read_text(encoding='utf-8')
assert "data/atlas-vehicle-intel.json" in js
assert "function modelInfo(id)" in js and "r.spec" in js
assert "j104-intelligence" in js and "View individual GTADB vehicle facts" in js
assert "j104-no-car" in js
assert "This '+r.type.toLowerCase()+' has an original Elario class-specific 3D concept" in js
assert "It is not the exact '+r.name+' game model" in js
assert "has no verified matching 3D vehicle mesh here" in js
assert "garageClassFilter" in js and 'id="garageClassFilter"' in html
assert "atlas104-garage-intel.css?v=201" in html
assert "team-jura-atlas90-collection-v1" in js
assert "team-jura-atlas93-garage-v1" in js
assert "new URLSearchParams(location.search).get('addModel')" in js
assert (D/'art/elario-crest.svg').is_file()
assert (D/'art/atlas104-heist-schematic.svg').is_file()
assert (D/'atlas104-heist-experience.css').is_file()
for page in ('index.html','maps.html','atlas98-style-lab.html'):
    assert 'src="./art/elario-crest.svg"' in (D/page).read_text(encoding='utf-8')
hej=(D/'atlas104-heist-experience.js').read_text(encoding='utf-8')
assert "missionBrief" in hej and "j104-mission-flow" in hej
assert "Optional general GTA Online world map" in hej
assert "atlas-cayo.html" in hej
assert "atlas104-heist-experience.js?v=104" in (D/'atlas93-global.js').read_text(encoding='utf-8')
for page in ('heists.html','heist-fleeca.html','heist-cayo-perico.html'):
    assert "./atlas93-global.js?v=93" in (D/page).read_text(encoding='utf-8')
for page in ('atlas-database.html','atlas-characters.html','atlas-animals.html','atlas-collectibles.html'):
    text=(D/page).read_text(encoding='utf-8')
    css_version='377' if page=='atlas-database.html' else '130'
    assert f"atlas100-universe.css?v={css_version}" in text and re.search(r"atlas100-universe\.js\?v=\d+", text)
assert "document.body.dataset.activeWorld=game" in (D/'atlas100-universe.js').read_text(encoding='utf-8')
assert "https://www.rockstargames.com/VI/media/screenshots" in (D/'atlas-animals.html').read_text(encoding='utf-8')
print('PASS Atlas 10.4 source-checked craft specs, separate concepts, original E crest, dedicated heist ops and game-specific artwork')
