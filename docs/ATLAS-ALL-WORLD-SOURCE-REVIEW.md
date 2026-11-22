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


## Atlas 24.2 — cleaner basemap and GTADB permission review
Owner approved replacing baked-in marker art with better, appropriately reusable and correctly calibrated source art. GTADB explicit license: https://github.com/rolux/gtadb.org/blob/d406fea099e1df2bce42fd6b87eed04bce646629/LICENSE-DATA. It covers data and images unless otherwise noted; require attribution, license link, modification notice. Retain game rights notices. GTA IV original/elevation tile inventory: 936 blobs, all identical paths and hashes to 0d79c62bd47f7521b6847ec676b0f7389231101a. GTA V hybrid/radar/roadmap/satellite/terrain: 37,640 blobs, all identical paths and hashes. No visual upgrade from swapping identical assets. Reviewed the VI tile directory separately (recursive listing truncated), confirming current YANIS V18, V15 archive, DUPZOR V51 and related composite layers. Added immutable same-publisher fallback to existing V/Online/VI tile engine and recognition of pinned tile URLs in offline worker without deleting existing cache or progress. Existing IV pinned tiles retained. New local source packs added to offline app-shell precache. No new licensed source for III/VC/VCS/LCS/CTW tiles in GTADB repository: only 4/5/6 map tile directories. Keep exact-match VC/III base; continue edition-specific source review for other worlds. New browser validation pending. 


## Atlas 24.3 — regression alignment and source freshness check
Exact comparison against GTADB revision d406fea099e1df2bce42fd6b87eed04bce646629: all 2,650 IV and 2,337 V landmark row arrays match the current upstream snapshot, zero added, removed or changed rows. VI manifest already records that revision. No needless reimport or identity changes. Atlas 24.1 full browser output reported obsolete SA guide-only assertions on both engines; focused Chromium/Edge, cross-product and Cayo passed. Updated the full-site test to require all five actual marker counts and source links instead of expecting tags/jumps to be unmapped. Exact-head rerun required.


## Atlas 24.4 — separate Definitive Edition Vice City references
ISC-licensed source https://github.com/mateusz-korbut/GTA-DE-Cheat-Menu/tree/577530924ad52473d48a57047e1d064840dc41af/cheat-menu/modules/vc/data/teleports/. All 171 records checked for finite XYZ and native extent; 100 packages, 35 rampages, 36 jump approaches. Comparison against classic jump references: all 36 have a nearest classic reference within 36 XY units (mean 34.74), which does not establish equivalence or guide numbering. Preserve all 51 classic pins. A separate reference panel provides category/search, selectable start, geometric ordered route preview and coordinate export. No classic overlay or progress migration. Credits and offline assets added. GTA III mod provider specifically requires permission for asset use, so it was not copied. Continue independent game-data research. Browser checks pending.


## Atlas 24.5 — GTA III source-backed interactive inventory
Pinned factual source https://github.com/Lighnat0r-pers/GTA-III-SCM-Converted/tree/aa120220618c4c1314d319bc6210071437d14662. Extracted 100 distinct package XYZ triples; 20 numbered rampage objectives, each with an initial and alternate pickup position (40 distinct per-objective source rows); 20 numbered jump triggers, 14 of which specify XY only. Never fabricate altitude. No source code or assets copied, no license asserted for script conversion. Existing exact-match 1024px original III radar uses documented ±2000 extent. All positions within bounds and projected; shared classic overlay filters, route preview and source details enabled for GTA III. These 160 positions represent 140 objectives, not 160 collectibles. Preserve source order and existing unrelated checklist progress. Not individually gameplay verified. Browser validation pending.


## Atlas 24.6 — objective-aware classic route and validation repair
Previous exact 24.3 Chromium full QA reported only SA base-art timeout. Inspected redundant legacy smoke block: it still waited for 150 total and required zero tag pins after the 320-point expansion. Consolidated coverage by retaining the earlier five-set real marker count checks; second block now checks image, attribution, approximate disclaimer and individual tracking only. Focused Chromium/Edge, Cayo and cross-product had passed on 24.3. Classic III/VC source planner now uses shared bounded 2-opt only for strictly shorter orders, preserves selected origin, and treats two rampage spawns as alternatives for one numbered objective, not two mandatory visits. All 40 candidates remain searchable and visible; user confirms active spawn. Browser regression requires 20 unique objective route stops and chosen alternate start. No production approval implied.
