# Atlas 30.1 — Fifteen heist checklist preservation and recovery

**2026-11-22 · Stage-only.** Canonical repository `jyates0125/team-jura-atlas-preview`. Build is stacked against draft integrated PR #98; no public branch update or release approval.

## What changed

The existing heist-pages.js checklist engine runs on all **15 mission pages**. Its older startup function saved all visible checkbox values *every time a page loaded*, even if the user had done nothing. That could silently normalize corrupt JSON to empty progress and erase hidden historical or concurrently edited tasks.

This patch keeps the **same per-heist guest key** `teamjura-heist-<mission>`, without migrating it:
- On initial load or cross-tab storage event, read and display the latest stored checklist **without writing anything**.
- On an explicit checkbox change, reread and validate the latest record, change **only that step** and retain unrelated historical step keys and metadata. Sync other visible checkbox states to that latest record.
- **Reset** remains a user-confirmed, mission-only operation. It sets only current page steps to false, retains retired step names/metadata and never clears notes, routes, world progress or other mission keys.
- Corrupt JSON, unsupported shapes and storage-denied conditions stop writes, restore the visible last-good state where available and show an accessible status message.
- Export progress reads the latest saved record; on damaged JSON it can export the **raw unparsed record** to a recovery JSON without writing it back. It does not claim that damaged JSON is valid or restored.
- All content is text-only DOM insertion; no HTTP login, third-party requests, source coordinate changes, Cayo map replacement or existing 29.8/29.9 backup removal.

**Known limitation:** localStorage does not offer transactional compare-and-swap between simultaneous writes. Testing covers sequential cross-tab updates with storage events, not a guarantee of conflict-free updates for exactly simultaneous writes. Future optional encrypted cloud sync requires separate owner approval.

## Focused acceptance
- `scripts/test_atlas301_heist_checklist.py` ensures 15 mapped mission pages retain the shared script, no load-time save, two narrowly scoped write sites, an explicit corrupt recovery export, current map and full mission backup modules, and valid JavaScript.
- `scripts/test_atlas301_heist_checklist_browser.py` tests all 15 pages on the actual built Cloudflare output at 390px and 1440px; exact raw bytes survive initial load, historic fields survive an explicit step edit, two browser tabs reconcile independent steps, explicit Reset preserves retired steps and notes/routes, and corrupt data refuses edits/Reset but exports its raw bytes correctly.
- `.github/workflows/atlas301-heist-checklists.yml` runs **only** these source and browser tests plus the static payload audit. No unrelated Cayo planning or full Chromium/Edge/ZIP matrix added.

## Release hold
Exact-head green browser proof and integrated PR #98 acceptance required. Full release Chromium/Edge/ZIP, real iPhone Safari, artwork/source rights checks, owner preview review and explicit release approval still apply. This protects a charter requirement but is not full charter completion.
