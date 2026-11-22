# Atlas 30.1 — non-destructive checklists for all 15 heists

**Scope:** guest checklist initialization/save/recovery for each of the fifteen individual heist pages. Draft staging only. All legacy `teamjura-heist-<id>` keys, original cinematic artwork, schematic mission maps, Cayo island layers and Atlas 29.9 full-mission backups are retained.

## Functional implementation
- **Read-only hydration:** Opening, reloading and navigating to a heist no longer rewrites the saved checklist or creates an empty checklist key. A saved Boolean step mark is displayed without changing unrelated or unknown entries.
- **Scoped mutation:** Toggling one checklist item re-reads the newest localStorage JSON and writes only the selected step, preserving newer marks and other saved fields; the UI refreshes to reflect those concurrent marks. Reset asks permission, then clears known checklist items only, leaving other heist data intact.
- **Accurate export:** The existing checklist export reads current storage at click time rather than the original tab's cached checkboxes.
- **Corruption recovery:** If an existing saved checklist is malformed or has an unsupported shape, the page does not overwrite it. Editing and resetting are disabled and the visitor may download **exact raw bytes** to a personal text file. Only after downloading the raw copy and separately confirming may they reset that damaged checklist. The reset first checks the original bytes have not changed. Notes, mission route, whole-mission backup and other heists are not touched.
- **Cayo exception:** Its flagship hides the old checklist layout. Only when a corrupt legacy checklist is detected, a separate visible Elario-styled recovery panel appears outside that hidden layout, preserving the modern island map/mission board. It disappears once the user completes an explicitly confirmed repair. The two-width Chromium test exercises the actual Cayo recovery download and reset controls.
- **Synchronized tabs:** Other-tab storage events refresh the checklist without writing anything. LocalStorage is device-only; it is not an atomic multi-tab database, and guest backups remain the recommended durable recovery.

## Focused evidence and release hold
- `scripts/test_atlas301_heist_checklist.py` covers all 15 page IDs, source contracts and JavaScript syntax.
- `scripts/test_atlas301_heist_checklist_browser.py` uses real Chromium over the built Cloudflare output at 390px and 1440px across all 15 heists, checking untouched page load, real save/reload, stale-tab updates, current export, malformed-storage raw rescue, explicit repair and preserved notes/routes.
- `scripts/test_atlas299_heist_backup_browser.py` is included because the checklist writer is shared with the full per-heist backup journey.
- Only these checks and Cloudflare payload audit run in `atlas301-heist-checklist.yml`. No repeat of unrelated Cayo map testing, GTA VI checks, Edge/full-site suite or ZIP during routine development.

**Status:** source implemented; do not claim exact-head CI/device or owner approval until GitHub checks finish. After passes, merge only into draft PR #98; before public release run final manual full Chromium/Edge/ZIP, phone Safari, source rights/visual review and obtain explicit owner approval.
