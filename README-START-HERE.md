# TEAM JURA ATLAS 9.3 — CUMULATIVE FORWARD-ONLY RELEASE

**Target:** `jyates0125/team-jura-atlas-preview`, branch `development` only. **Do not upload to `main`**. No live code or data has been changed until the GitHub Action successfully applies.

## Install on laptop / GitHub web

1. Unzip this cumulative 9.3 release. It already contains the 9.2 UI/Heist/Daily upgrade. Do **not** upload your old 9.2 ZIP separately.
2. Open https://github.com/jyates0125/team-jura-atlas-preview/tree/development . Upload all release files **preserving folders**. The root has `atlas92-*.js/css`, `atlas93-*.html/js/css`; folder paths include `art/`, `tools/`, `docs/` and `.github/workflows/`. Do not move workflow YAML into the root.
3. Commit to **development** only. Use message `feat: upload Atlas 9.3 cumulative forward-only garage and intelligence`.
4. Open GitHub **Actions → Apply Atlas 9.3 cumulative Designed Brand upgrade → Run workflow** and select **development**. Wait for completed successful check. Do not merge `main` yet.
5. Test on Cloudflare preview: `/atlas93-garage.html` pictured vehicles/owned state; `/atlas93-dispatch.html` tasks; `/atlas87-daily.html` statuses; `/maps.html` artwork; `/atlas-vi.html` research layers; a heist page and Cayo. Keep existing 9.0 tests passed.
6. **OPTIONAL after 9.3 action success:** Actions → **Atlas 9.3 research-only GTADB VI licensed snapshot refresh**, branch `development`. This reads the explicitly licensed upstream GTADB.org GitHub source. If upstream data doesn't match the existing validator, job fails safely and **doesn't alter source or `main`**. Verify `data/gtadb-6-manifest.json` count after successful run. Do not confuse this with GTADB.net 2,706-marker parity.

## New features

- **My Garage:** pictured GTA V/Online vehicles, multiple garage assignments, ownership shared with 9.0 vehicle gallery, custom paint/planning colors, notes and favorites, device-local import/export.
- **Atlas Dispatch:** your personal next collectible, garage and heist tasks, with daily-local completion and export. No invented event data.
- **Daily Intelligence:** dated rotation import, validity/UTC expiration indicators, explicit warning when not current, direct links to sources. No automatic external live feed included.
- **Heist intel ledger:** preserve original checklists and schematic map-pin notebook while adding source-linked personal notes. No fabricated heist coordinates.
- **Art and brand:** original high-resolution garage/Dispatch banners; 22 unique original scalable illustrated SVG backgrounds including individual heist page scenes. Old visible 7.x display labels updated on integrated pages, without renaming source modules.
- **Navigation:** Garage and Atlas Dispatch accessible through existing universal menu; research views stay intact.

## Safety

- Existing Atlas 9.0 storage key preserved. `main` protected and untouched.
- No unlicensed GTADB.net marker bulk data or 3rd-party image database is copied into package.
- The 3840×1440 banner images are upscaled from original illustrated references, **not native high-detail 4K photos**.
- GitHub write permission was denied for automated direct edits in this session. You must upload through GitHub web, run the Action, then test Cloudflare.
- This is a substantial real release but NOT a claim of complete GTAWeb/GTADB parity or verified automatic live data. Read `docs/ATLAS93-RESEARCH-AND-PARITY.md`.
