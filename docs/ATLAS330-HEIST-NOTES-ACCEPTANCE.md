# Atlas 33.0 — 15-heist guest notes recovery and concurrency

**Status:** staged for owner review; not deployed to Cloudflare-connected `development` or protected `main`. **Source scope:** all fifteen existing heist pages, including the Cayo mission-tools drawer. No game map, point, collectible, source rights, or private guest key migration.

## Implemented

- The previous notes editor silently substituted an empty object for corrupted `teamjura-heist-plan-v1:<mission>` JSON. Typing in any field could destroy the original unreadable bytes. The updated editor **fails closed**, displays an amber recovery alert, disables note modification/clear/import, and permits a byte-identical `*.txt` backup of the original saved text. A clean plan export is refused until the stored record can be validated.
- Every field edit re-reads current same-heist storage and merges only that field, including previously unknown metadata, so a stale tab does not overwrite newer work in unrelated fields. Imports re-read current storage **after** file I/O, preserve existing nonempty saved values, validate the exact mission ID, and reject corrupt/foreign keys. Clearing requires explicit confirmation and removes only the five displayed fields, preserving other metadata and all checklist/route keys.
- The fifteen-mission Heist HQ directory treats malformed checklist, notes and route saves as **recovery required**, not zero/no progress; saved-only filtering keeps these missions discoverable, and cross-tab updates for all three known progress key families refresh the directory.
- Existing Cayo workspace intentionally places Notes & strategy inside a hidden mission-tools drawer; its notes recovery is reachable **after opening that drawer**. Do not change the Cayo navigation or mistakenly treat a closed drawer as a failed recovery warning.

## Exact source and focused evidence

- Feature PR #135 at commit `a1b4c90366ecf3ce8b1141b280cc5e8aa2ea7f6d`: [new focused safety workflow](https://github.com/jyates0125/team-jura-atlas-preview/actions/runs/45129107292) **success** and [existing heist phase-map interaction workflow](https://github.com/jyates0125/team-jura-atlas-preview/actions/runs/45129107281) **success**. Chromium exercised phone portrait 390×844, landscape 844×390, desktop 1440×900, exact-byte corruption export, read-only refusal, multi-tab different-field preservation, accepted and declined restoration, unknown metadata retention, mission isolation, directory visibility and Cayo notes recovery drawer. No unnecessary full Cayo collectible suite was run by this feature PR.
- Integrated draft staging commit `6c2be2bd69de3b355dda35de80e12bae7526a1e2` automatically triggered 35 historical workflow checks. A previous Atlas 16.4 source-string test still demanded the **deleted** expression `if(t.value.trim()){preserved++;continue}`. Three staging jobs failed because of that **single stale source assertion**, not a browser data-loss defect. PR #136 updates its assertion to require the newer safer current-value merge, raw backup and concurrency protection; do not claim staging is green until the exact combined new head passes.

## Release gates still open

Full charter source/portrait/art/map parity and rights, native iPhone Safari, exact final Chromium+Edge/validated release ZIP, actual Cloudflare preview and specific owner visual approval. Keep all user voice/film teaser work separate and the approved 39-second **music-only** video master unchanged.
