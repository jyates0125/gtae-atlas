# Atlas 31.0 — Game-separated source coverage matrix

**Draft staging only. Not the public development branch or a release.**

The Coverage workspace now shows a 54-row evidence matrix spanning all 13 GTA destinations. These rows come from 16 existing local source files: the attached configuration names each source and its counting rules, and the source acceptance script independently recalculates every category count from the actual source file.

The columns deliberately separate source record counts, finite numeric source positions, distinguishable objectives, and named checklist slots. None is a guarantee of visible pins or verified gameplay coordinates. In particular: GTA V Story map-space references are not exact game spawn coordinates; GTA V/Online shared landscape landmarks are not Story collectible spawns; GTA Online nine checklist rows are reference slots without individual positioned entries in that index; GTA VI's 3,754 source landmarks (3,663 positioned) remain provisional and unverified; Cayo's 19 possible treasure sites are not today's confirmed active pair and its 20 schematic locations are not game XYZ; GTA IV 200 birds and separate TLAD/TBOGT 50+50 seagulls remain independently scoped; San Andreas 320 sourced approximate records retain the 61/39 tag confidence split and airborne jump zone disclaimer; GTA III's 40 rampage positions represent only 20 objectives; Vice City classic 51 and Definitive 171 records are edition-separated; LCS/VCS PSP teleport presets are neither map-calibrated nor collectible spawns; Chinatown Wars lacks a calibrated collectible source pack in this inventory (unknown, not zero).

The user-facing page includes a 13-world selector, evidence-class filtering, category search, shareable filter query state and CSV download of currently visible rows, with spreadsheet-formula injection safeguards. The table is horizontally scrollable at phone widths; its data is bundled, and it neither writes personal storage nor calls third-party websites in the background. Links to existing workspace/source attribution remain explicit. If the matrix is missing, malformed or unavailable, the page withholds numeric claims.

Automated acceptance files:
- scripts/test_atlas310_source_coverage.py — recomputes every category and its coordinate, objective and slot evidence; checks source provenance and scope.
- scripts/test_atlas310_source_coverage_browser.py — built Chromium tests at 375×667, 390×844, 844×390 and 1440×900. Tests world isolation, GTA III alternate spawn semantics, provisional VI, Cayo gap, search, reset, share URL, CSV and absent-file behavior. Captures 390px and 1440px evidence.
- .github/workflows/atlas310-source-coverage.yml — only this coverage slice and public build audit, no Cayo heist regression loop.

**Not yet certified:** complete collectible location parity, licensed exact maps and 3D, source-use rights beyond retained original notices, all-world artwork acceptance, actual iPhone Safari, full manual Chromium + Edge + ZIP final release test and owner's explicit deployment approval.
