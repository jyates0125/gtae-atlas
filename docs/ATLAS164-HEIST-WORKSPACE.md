# Atlas 16.4 — approved cinematic artwork + working mission maps

Corrected a real runtime regression: the heist page checklist script had been replacing each approved WebP scene with an older SVG. The page now keeps each mission's original premium WebP. The earlier generic schematic and legacy 185px artwork shrink behavior were also removed.

On all 15 heist pages the existing checklist loads an opt-in mission workspace. Visitors can load the actual existing Atlas interactive map in the page (Cayo uses its own island map; the others use GTA Online) with working map-engine zoom/layers and a full-size map link. Heist-specific real coordinates are not invented or added. Each operation has five separate local-only planning notes (approach, entry, exit, POI/loot, crew), saved under teamjura-heist-plan-v1:<mission>, with export and clear operations. Existing checklist storage keys remain untouched. No signup is introduced.

Comparable GTAMap.io GTA Online has source-backed Cayo infiltration, guard gear and secondary loot, and mapped route planning: https://gtamap.io/gta-online-map/. The in-page world map + personal notes here are useful now but do not claim georeferenced heist POI parity. Source verification and game-specific POI layers remain future work.

This is PR #70 staging only; screenshots and Chromium/Edge browser tests must pass before new owner-approved live release.
