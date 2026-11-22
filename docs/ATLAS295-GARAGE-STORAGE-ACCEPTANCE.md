# Atlas 29.5 — Guest Garage preservation and multi-tab acceptance

**Status:** staged code and focused tests; release is blocked pending real-browser proof and owner approval. **Baseline:** integrated PR #98 at `ce68cdb`. This work is staged separately so routine changes do not repeat unrelated Cayo, character, world-map, full Edge or ZIP validation.

## User-visible behavior
- **Ownership:** The `Owned` checkbox and vehicle-card button update only the official guest ownership registry key `team-jura-atlas90-collection-v1`. They read the latest record before changing one model's mark, preserving other models, notes and wishlist entries; they do not rewrite Garage paint, studio concepts or bays.
- **Garage locations:** Adding or removing a garage reads the current `team-jura-atlas93-garage-v1` record and updates its location-name list without writing the ownership key. Deleting a location is rejected if a vehicle was assigned to it in a different tab after the original page rendered.
- **Garage builds:** Existing Forge↔Garage selected-model save continues to reread and update only the chosen vehicle, with vehicle ownership remaining independent.
- **Backups:** Export reads current Garage/collection local storage at click time, not old page state. Import refuses to overwrite malformed existing data instead of silently falling back to an older in-memory copy. All privacy remains device-local, with no sign-in or server upload.

## Scoped acceptance gates
Run `python scripts/test_atlas295_garage_safety.py`, `node --check atlas93-garage.js`, then `node scripts/build-cloudflare.cjs` and `python scripts/audit_published.py`. Run Chromium on the **built** payload for `scripts/test_atlas295_garage_multitab_browser.py` and the existing `scripts/test_atlas293_garage_forge_browser.py`.

The new browser test uses a 390px phone viewport to simulate a Forge update that lands before a Garage tab's storage event; it verifies ownership does not overwrite the updated vehicle metadata; a saved backup captures that update; a garage name does not alter collection marks; occupied-garage deletion refuses stale information; concurrent registry notes survive removing one owned mark; and malformed backup targets are never overwritten.

**Not yet certified:** Actual Safari/iPhone use, simultaneous localStorage writes in the same millisecond (browser localStorage has no multi-record transactions), owner visual acceptance or production deployment. Keep manual full Chromium/Edge/ZIP gate before approved release.

## Release routing
Target feature branch `feature/atlas294-integrated-staging-20261122` / PR #98 **only after focused tests pass**. Never merge directly into `development` or `main` without the Standing Project Charter's release approval.
