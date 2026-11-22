# Atlas 30.2 — Seven classic GTA map notebook preservation

**Date:** 2026-11-22 · **Status:** staged feature; automated browser and owner gates remain. **Base:** integrated draft PR #98; not deployed.

## Why this matters
The previous classic-world notebook reader silently returned an empty notebook on malformed JSON, a wrong-world save or an unsupported record. It did not distinguish that fallback from a genuinely empty first-run notebook. A later user action could then overwrite older, recoverable bytes. The map editor also saved a stale in-memory snapshot without checking whether another tab had written newer markers.

## Functional improvements
- **Seven isolated classic maps:** GTA III (`iii`), Vice City (`vc`), Vice City Stories (`vcs`), Liberty City Stories (`lcs`), Chinatown Wars (`ctw`), TLAD (`tlad`), and TBOGT (`tbogt`) retain their existing `team-jura-atlas98-classic-<id>-v1` localStorage keys and source-specific artwork.
- **Strict read:** Accept the existing schema, correct game ID, a bounded array of valid image-relative markers and optional historical completed flags. Valid older notes do not migrate or rewrite on load. Incompatible/corrupt original records remain stored.
- **Fail closed:** Any editing action on a damaged notebook refuses to write, with a visible accessible status/recovery panel. “Export map” downloads a raw recovery JSON, not a fabricated blank notebook.
- **Deliberate recovery:** Only after triggering the raw backup download can the visitor confirm starting a fresh empty notebook. Before replacement, the browser rechecks the exact original bytes. If another tab changed the record, it refuses to erase those newer edits.
- **Stale-tab protection:** Every notebook save checks the latest raw browser value against the last known snapshot. A remote-tab storage event displays a reload action. Existing newer markers and historical metadata cannot be overwritten by a stale page in the ordinary sequential multi-tab scenario.
- **True status:** Marker create/edit/delete, checklist category marks, notebook clear, image-change controls and JSON import no longer claim successful persistence after a failed notebook save. Personal high-resolution source images continue using the original private local-image store and are not uploaded or redistributed.
- **Honest maps:** No coordinates, pins, licensing assumptions, source routes, collection datasets or original Elario art were changed; source-alignment positions remain explicitly image-relative. Cache query revisions on the classic page have been updated to ensure new code is served.

## Focused verification
- `scripts/test_atlas302_classic_safe.py` guards seven distinct game definitions, same keys, recovery, stale-state refusal, source syntax and updated asset URLs.
- `scripts/test_atlas302_classic_browser.py` uses the actual built Cloudflare payload in Chromium at 390px and 1440px: seven-world load safety, malformed-record preservation, raw JSON downloads, disabled destructive recovery before backup, intentional reset on one world, wrong-tab marker preservation and reload.
- `.github/workflows/atlas302-classic-notebook.yml` is limited to these relevant classic pages and produces two width-specific recovery screenshots. No unrelated Cayo/full-site/Edge/ZIP workflow is triggered intentionally by this test.

## Remaining release holds
This prevents a known class of guest-data loss but does not make localStorage transactional under perfectly simultaneous writes. Finish source licensing and map alignment validation, preserve collectible/episode game boundaries, perform final frozen-head Chromium/Edge/ZIP acceptance, real iPhone Safari and owner visual approval before publishing the integrated branch. Source existence alone is not a CI pass.
