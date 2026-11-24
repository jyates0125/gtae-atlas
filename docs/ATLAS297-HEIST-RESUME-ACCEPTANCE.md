# Atlas 29.7 — Heist HQ guest resume and 14 non-Cayo acceptance

## Scope
- The Heist HQ directory now recognizes meaningful local progress from three **existing** key families: `teamjura-heist-<id>` checklist booleans, `teamjura-heist-plan-v1:<id>` mission notes, and `teamjura-heist-focus-v1:<id>` scoped points/routes/challenges.
- Displays up to five resumable mission shortcuts (most recently saved plans first, otherwise stable mission name), with honest counts. The **Saved progress** filter now includes notes/routes as well as checklists.
- No signup, telemetry, storage migration, new private keys, made-up heist points, mission coordinates or external data access.
- Invalid/corrupt backups are ignored by the directory **without overwriting them**.
- Existing heist hero images, 15 individual pages, schematic notices and mission-specific map links stay intact.

## Test contract
- Source audit checks all 15 unique heist links and that Heist HQ makes **no localStorage writes**.
- Real Chromium browser tests run at 390px and 1440px: resume fixture/search/filter/isolation, all 14 **non-Cayo** mission pages, named original Elario cover-image decoding, mission-specific map/pin/detail/guide availability and no unrequested embedded map loading.
- Deeper functional journeys for Fleeca, Doomsday Act III, Diamond Casino and Kortz Center test scoped point selection, personal route, checklist, local notes and reload, objective map view and lazy wider map open/close.
- Cayo flagship remains governed by its existing dedicated acceptance; no unrelated Cayo suites added to this workflow.

## Release hold
- Exact-head CI must pass before calling this tested. Full release-level Chromium/Edge/ZIP, iPhone Safari, visual design/asset rights inspection and owner approval remain required.
- Leonida's owner-approved multiple legend pins, click-to-zoom, landmark info and photos must not be removed to address screenshot density. Neither `atlas.js` nor Leonida pin coordinates/styles are touched.
