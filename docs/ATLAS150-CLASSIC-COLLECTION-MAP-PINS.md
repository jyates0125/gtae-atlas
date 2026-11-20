# Atlas 15.0 — Classic collectible slots → in-map personal pins

**Status:** staged on the combined release branch, not live. `main` and Cloudflare-connected `development` remain unchanged. One owner-approved combined merge later.

## Delivered
- Seven classic worlds retain their original game-era basemap and separate personal notebooks.
- Each numbered collection slot now has a separate locate-on-map action. First click starts pin placement on the visible game image; future clicks reopen the matching personal pin for editing. Map placement uses normalized percentages of **the player's displayed image**, not game X/Y.
- Collectibles show type-relevant map icons. A linked pin changes to the completed appearance when its checklist slot is marked collected. The state is read from the existing world-specific checklist key; no new account, sync, schema migration or hidden reset.
- The collectible number and set are exported along with each new marker. The existing JSON import optionally preserves these fields only for validated in-range same-world/same-set entries. Legacy backup formats remain valid.
- VCS now lists its existing Rampages collection inside its map sidebar; Chinatown Wars similarly lists its existing Rampages and Unique jumps sets.
- Map overlays remain **personal notes**, **not verified dataset pins**. No arbitrary external positions, scraped provider tiles, or claimed calibrated world coordinate overlays are shipped.

## Accuracy and future sources
- An image-relative position can be useful when based on the **identical map art**, even when no world-coordinate transform is known. It should not follow automatically to another basemap. Players should keep the original picture for backups and validate pin placement after changing their private image.
- GTA III, Vice City, VCS and LCS may support future calibrated world coordinates, but Atlas must establish *our own* matching image, image edition, transform anchors, error bounds, rights and per-record provenance before enabling X/Y. One competitor's calibration is not transferable without validation.
- Chinatown Wars' PDA image has no validated world X/Y transformation available to Atlas; image-percent location notes are the supported workflow.
- Current sourced map references: https://gtamap.io/gta-3-map/ ; https://gtamap.io/gta-vice-city-map/ ; https://gtamap.io/gta-vice-city-stories-map/ ; https://gtamap.io/gta-liberty-city-stories-map/ ; https://gtamap.io/gta-chinatown-wars-map/ . These are references, **not grants of license to redistribute their coordinates or cartography**.

## Verification
- Static: `python scripts/test_classic_flat_106.py`, `python scripts/test_atlas150_classic_slots.py`.
- Browser: `python scripts/browser_smoke.py` on Chromium and Microsoft Edge desktop/mobile, using generated original test-image data, for each of seven world identifiers.
- Test flow: place a regular personal marker, reload and preserve it, remove private image without deleting markers, export/import, use a numbered slot to add a second pin, mark collected and see map status, reload and see state persist.
- Cloudflare deployment checks, device screenshots, and release ZIP remain mandatory before the later merge.

## Outstanding map parity
- Source and validate actual collectible positions per original image with explicit license, edition and margin-of-error; classic completion guides and personal slots are not the same as 100 plotted source-backed points.
- Review per-image pin stability on user basemap replacement and safer migration prompts.
- Full curated per-world categories, source-per-pin provenance, sourced route order and map-aligned mission/heist overlays.
- Human mobile visual review against the approved Elario designed-brand reference.
