#!/usr/bin/env python3
"""Atlas 12.1 source-loaded GTA game maps without changing personal saves."""
from pathlib import Path
R=Path(__file__).resolve().parents[1]
source=(R/'atlas121-game-maps.js').read_text(encoding='utf8')
classic=(R/'atlas98-classic.js').read_text(encoding='utf8')
portal=(R/'atlas98-portal.js').read_text(encoding='utf8')
for id in ('iii','vc','vcs','lcs','ctw','tlad','tbogt'):
    assert f' {id}:{{' in source,id
for name in ('LibertyCity-GTAIII-MapFull-ExceptUpstate','ViceCity-GTAVC-MapHD','ViceCity-GTAVCS-MapFull','LibertyCity-GTALCS-MapFull-ExceptUpstate','LibertyCity-GTACW-FullMap','LibertyCity-GTAIV-MapwithStreetNames'):
    assert name in source,name
assert 'img.onerror' in source and 'img.naturalWidth' in source
assert 'raw.githubusercontent.com/denizariyan/' in source
for token in ('loadPublishedGameMap','sourceMapUrl','sourceMapSize','source-game-map','highResUrl||state.background||sourceMapUrl','TeamJuraLocalMap.restore(id)','TeamJuraLocalMap.save(id,file,dims)','state.markers'):
    assert token in classic,token
assert 'TeamJuraGameMaps.load(w.id)' not in portal # read using dynamic local alias
assert 'gameArt.load(w.id)' in portal
assert 'has-game-map-art' in portal
for html in ('index.html','maps.html','map-hub.html'):
    text=(R/html).read_text(encoding='utf8')
    assert 'atlas121-game-maps.js?v=121' in text,html
assert (R/'map-hub.html').read_text().index('atlas121-game-maps.js') < (R/'map-hub.html').read_text().index('atlas98-classic.js')
assert 'id="atlas-121-game-maps"' in (R/'atlas-credits.html').read_text()
for local_map in ('gta-vice-city-original.png','gta-iv-liberty-reference.jpg'):
    asset=R/'art'/'maps'/local_map
    assert asset.is_file() and asset.stat().st_size>100000,local_map
assert './art/maps/gta-vice-city-original.png' in source
assert './art/maps/gta-iv-liberty-reference.jpg' in source
assert 'source-game-map' in (R/'atlas98-classic.css').read_text()
print('PASS Atlas 12.1: sourced maps and image fallback across seven classic worlds')
