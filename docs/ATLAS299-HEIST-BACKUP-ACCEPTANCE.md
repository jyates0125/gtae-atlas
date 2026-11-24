# Atlas 29.9 — heist guest-data continuity, complete one-file backup

## Scope
All 15 heist pages can export one JSON file containing the **existing** mission checklist, five private planning notes, and selected schematic POIs/routes/challenges. The file is downloaded on the visitor's device; no account, cloud request, cross-world data or new saved key is involved.

Restore accepts only a matching mission ID and explicit `teamjura-heist-bundle-v1` schema, with a 150 KB file limit. Existing checked steps remain checked, existing nonempty notes remain unchanged, existing route order wins over imported route, and scoped/challenge progress is unioned without duplicates. Unknown checklist fields and malformed point IDs are ignored. Existing malformed local save records **block** restore rather than being silently replaced. A concurrent local save before import is detected, and failed writes attempt rollback of touched keys.

## Source references
- Checklist: `teamjura-heist-<id>`
- Notes: `teamjura-heist-plan-v1:<id>`
- Map planning: `teamjura-heist-focus-v1:<id>`

The three original key formats are kept unchanged for backward compatibility. No new geospatial data, basemap assets, map-layer changes, copied game media or ownership assumptions.

## Verification
Static checks cover all fifteen heist IDs and script syntax. Real Chromium tests at 390px and 1440px verify preserving existing checklist/notes/route, unioning missing source POIs/challenges, exported JSON, refusing wrong-heist backups, refusing corrupt preexisting state, and mobile fit. Full manual release suite, iPhone Safari and owner design approval remain release gates. Do not call the entire Site Completion Contract finished from this milestone.
