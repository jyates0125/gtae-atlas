# Atlas 29.8 — fourteen non-Cayo heist maps and portable mission briefings

**Date:** 2026-11-22 · **Status:** staged source with scoped automated acceptance pending. Builds on draft integration PR #98. Public `development` and protected `main` remain unchanged.

## Functional upgrade
- Every one of the 14 **non-Cayo** dedicated heist pages inherits mission-specific, one-tap **All mission points / Recon & setup / Finale & escape** map phases. These use the original source-described POI categories and existing Elario overhead artwork, real selectable pointed pins, route builder, zoom, pan and named details.
- Phase selection changes only the existing category-filter controls. It does **not** rewrite map progress, route order, checklist, awards or free-text mission notes. Switching to the schematic "Enhanced map" is intentional and does not assert exact geography.
- The map briefing shows live POI visibility/route counts, respects a visitor's text search and recognizes manually customized category filters. Touch controls have minimum 44px targets and support keyboard focus and screen readers.
- Visitors can **export only their current mission's map plan** (POI IDs, scoped marks, ordered route and personal challenge marks) to JSON. The file intentionally excludes private free-text notes, user credentials, in-game world positions and real travel metrics.
- **Restore missing points** accepts only a versioned, same-heist backup (under 128 KB). It rereads the latest save after file I/O, adds only recognized missing POI IDs/award codes, preserves old historical IDs, retains existing route order and unrelated metadata, refuses corrupt local storage and never touches a different heist.
- After a successful import, a clearly labeled **Show restored map** control refreshes the existing POI/route UI. The existing mission notes and checklist backup systems remain independent. No sign-in, upload or new server-side data store is introduced.
- The **Kortz Center** schematic now distinguishes released art-heist and Art Studio preparation research from provisional room locations, and cites Rockstar's official [Kortz Center Heist launch announcement](https://www.rockstargames.com/newswire/article/2525o93834o413/the-kortz-center-heist-now-available-in-gta-online). Original IDs `m0`..`m4` and their approximate schematic positions are preserved so past route saves still resolve.

## Honesty and source boundaries
Rockstar confirms the modern GTA Online heist planning-board structure; third-party source guides vary in completeness. The existing fourteen illustrations remain **original editorial mission maps** with schematic, not GPS/in-game-calibrated, marker positions. No external proprietary map pixels, unsupported location coordinates, fixed rotating loot or exact interior floorplans were copied. Cayo keeps its independent original island map and all established category, route, chest and focused test behavior.

## Focused acceptance and full release hold
- `tests/atlas298-heist-map-kit.test.cjs`: all 15 world/mission configs intact; read-only map point manifests for the 14 non-Cayo pages; phase group membership; source provenance; JSON identity/version validation, corrupt-data failure and non-destructive import behavior.
- `scripts/test_atlas298_heist_map_kit_browser.py`: actual built-site Chromium at 390px and 1440px across all 14 non-Cayo mission maps, phase/pin/search/saved-state isolation, no horizontal overflow; Fleeca export, wrong-mission rejection, route/mark merge, reload and retained notes/checklists.
- `.github/workflows/atlas298-heist-map-kit.yml`: scoped mission-only build, source test, real browser proof, 3 mission screenshots at each width. **No routine full-site/Edge/ZIP test or unrelated Cayo run** is added by this workflow.
- Full exact-head Chromium + Edge, validated ZIP, source/rights audit, real Safari/iPhone controls, owner visual acceptance and explicit release approval remain mandatory before any public merge. This is meaningful heist functionality, **not charter completion**.
