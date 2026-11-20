# Atlas 16.3 — post-merge staged improvements

This branch was created from **production `development` commit `afe334fe6fd721b4c49a364c0af84996794f7966`** after owner approval and deployment on November 20, 2026. Protected `main` remains separate.

## What is protected
The owner-approved premium public poster, homepage, 13 distinct world covers, Vice City Stories real map workspace, 15 individual cinematic heist scenes and Heist HQ, 33-artwork review gallery, maps and zoom controls, source-qualified research, guest local progress, garage and collectibles all remain intact. No return to generic/legacy SVG main-page artwork or unrelated shared crew covers.

## New implemented guard
`scripts/test_atlas163_premium_asset_ledger.py` now validates 34 distinct WebP files covering 13 worlds, 15 heists, Heist HQ and five major subject sections, including file integrity, actual pixel dimensions, unique image content, connected page/CSS references, and retained owner release metadata. Produces a machine-readable QA inventory. This is a regression check, **not** evidence that all content or image licensing is complete.

## Next code and media work
1. Subject-specific image, verified specifications and consent-based 3D model sources for each vehicle, weapon and character.
2. GTAWeb / GTADB / GTAMap.io / Rockstar feature-parity comparison with **actual** sourced markers, heist flat maps, route geometry, collectible coverage, game-edition coordinate alignment and clear confidence flags. No fabricated verified positions.
3. Real-device iPhone full-scroll tests, image fetch/decoding, cross-browser navigation, accessible keyboard/touch zoom, and source/license review.
4. Finish the authentic **One Last Ride** 3–5 minute film with permitted character depictions, original music, approvals and a validated playable deliverable. Teaser is not the film.
5. **Separate post-merge secure signup** release using HTTPS, real provider/session verification, user-controlled guest progress transfer, privacy and account recovery. No forced login.

All changes stage in feature branches, new draft PR, full QA and owner review. Neither the existing Preview Builder nor another scheduled automation may auto-merge without separate owner permission.

## Atlas 16.4 — heist map and launch cadence
- Fixed legacy runtime mission image replacement and generic schematic downgrade; original WebP assets remain primary.
- Added an optional embedded real game map on all fifteen individual mission pages and independent, saved/exportable, guest-only personal operation notes.
- Changed Cloudflare framing only for two map pages to SAMEORIGIN, backed by CSP frame-ancestors 'self'; unrelated pages retain DENY.
- Static contracts and new Chromium/Edge heist interaction tests are staged; completed CI and actual preview verification remain separate pending evidence.
- Hourly merge-review alerts are paused. Builder reports only major outcomes or actionable owner needs. Signup remains deferred.
- Relevant reference categories: https://gtamap.io/gta-online-map/ and https://gtadb.net/gta-online-map/interactive/. These help identify data/parity gaps but do not license cloning.
