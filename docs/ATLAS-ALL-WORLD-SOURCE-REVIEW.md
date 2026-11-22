# All-world source review — Atlas 23.9

Owner direction: actively seek better sources across all 13 maps; attribution and explicit reuse evidence recorded. Preserve working data when no superior replacement is established. Inventory below is a review of current directory and source evidence, not completed gameplay testing.

| Destination | Current evidence | Next unresolved review |
|---|---|---|
| GTA V Story | 275 locally bundled calibrated community rows, 255 numbered in seven sets | Compare numbering and pinpoint alignment against gameplay; missing sets |
| GTA Online | Scoped catalog, separate rotation state | Individual collectible coordinates, dated rotations; no guessed active pins |
| Leonida | Community provisional map, official references separate | Post-launch source/edition verification and calibration, no bulk promotion |
| Cayo Perico | Independent route workspace and possible chest spots | Exact projection/current daily positions; retain tested planner |
| GTA IV | 2650 source landmarks, 200 source-matched birds | Verify remaining categories and map alignment |
| San Andreas | 320 sourced records across five sets | Individual visual/gameplay alignment; tags 61 direct matches, 39 transcription-only; jumps trigger boxes not ramps |
| Vice City | Personal notebook and source links | Permitted calibrated base and individual coordinates |
| GTA III | Personal notebook and source links | Permitted calibrated base and individual coordinates |
| Vice City Stories | Personal notebook and source links | Edition-specific map and collectible positions |
| Liberty City Stories | Personal notebook and source links | Edition-specific map and collectible positions |
| Chinatown Wars | Personal notebook and source links | Edition-specific map and collectible positions |
| The Lost and Damned | 50 source-matched seagulls, IV explorer link | Other edition categories, native workspace |
| The Ballad of Gay Tony | 50 source-matched seagulls, IV explorer link | Other edition categories, native workspace |

## San Andreas jumps: source extraction
Pinned source: https://github.com/gtasa-savegame-editor/gtasa-savegame-editor/blob/6611e3cf21422bdd530a38743c1d15178d5d5df2/savegame-editor/src/main/resources/savegame.b. MIT software notice in manifest; numerical game-world facts only, no source binary or game artwork redistributed. Checksum 14857859 equals additive file checksum; exact 202752 bytes; BLOCK marker at 160411; 70 records each 68 bytes; next BLOCK marker at expected offset. All 70 start and landing bounds finite, ordered, in world bounds, all rewards 500, unique start boxes. Completion flags ignored. Midpoint of each airborne start box is projected into Toliak map; landing midpoint and full bounds retained. Source numbering is not walkthrough numbering. Reproduce with scripts/extract_sa_jump_zones.py on original source file. No gameplay certification or exact ramp placement. New code pending browser validation.


## Atlas 24.0 — Vice City numeric reference index
Inspected https://github.com/kong78/collectibles-on-radar-gta-vc/blob/b06265e1bf37e2b1ed389c58c80679addfbc8f20/src/Util.cpp under Apache-2.0 (https://github.com/kong78/collectibles-on-radar-gta-vc/blob/b06265e1bf37e2b1ed389c58c80679addfbc8f20/LICENSE). Parsed 36 USJ.SC positions and 15 robbery/AMMU script locations, retaining explicit Z offsets. 51 unique finite XYZ triples. Classic PC Vice City only, source-order IDs. No source code or assets copied; full license retained in data. Existing flat-map calibration is not yet established, so display coordinates and a source link, filter/search, optional same-category nearest-next preview and a private plan export without falsely placing radar pins or synchronizing unrelated checklist numbers. Further map-image calibration and gameplay validation pending. GTA III, VCS, LCS, CTW remain source research priorities; no unsupported pin claims.


## Atlas 24.1 — Vice City and GTA III radar alignment
Publisher XiaoNiaoa/noiseXYZ documents 1024×1024 original radar images, north-west first tile, native world extent -2000 to 2000 both axes. Pinned README: https://github.com/XiaoNiaoa/vc_lc/blob/5756e398975ff2fa7dd9b818edda82b46ea4a6a0/README.md#map-images. The local Vice City asset has the same Git blob SHA 7ae40595da5d5480c50f6a82c2b20557f1f7f6ae as upstream maps/vc.png. GTA III also matches maps/lc.png byte-for-byte (e9ddb8461f9300b4097ccfeeeb88393c7ea5fbb7). Native Vice City script positions use no SA conversion offset; x%=(x+2000)/40, y%=(2000-y)/40. All 51 positions in bounds. Source pins are a separate overlay, hidden on custom/fallback artwork. This establishes the documented numerical projection, not independent gameplay visual accuracy or map-art rights. Preserve original attribution; upstream software license excludes Rockstar assets. III projection established for future sourced coordinates, no invented III markers. Browser validation pending.
