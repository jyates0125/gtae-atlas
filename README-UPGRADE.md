# Team Jura Atlas — Data Lab functional upgrade

**November 15, 2026 | Additive development candidate**

This package completes a previously unfinished Data Lab workbench. It does **not** replace Team Jura's latest approved designed brand, does not modify `main`, and does not overwrite map/route/collectible/One Last Ride files. Visual references remain the most recently approved Original Design Reference Pack and subsequent approved revisions.

## Files
- `atlas98-data-lab.html`: standalone research workbench, linked to existing Atlas pages.
- `atlas98-data-lab.css`: cinematic Elario / Team Jura visual language.
- `atlas98-data-lab.js`: real browser-local CSV, JSON, GeoJSON parsing, 10 MB input limit, 25,000 record limit, normalization, validation, duplicate checking, filters and exports.
- `tests/data-lab.test.cjs`: 8 Node.js automated tests.

## Install on development only
1. In the `jyates0125/team-jura-atlas-preview` GitHub repository switch to `development`.
2. Upload the three `atlas98-data-lab.*` files **at the repository root**. Do not replace `index.html`, the map engines, or approved art. The tests file is optional for the website; keep under `tests/` if possible.
3. Open `/atlas98-data-lab.html` on the Cloudflare development preview URL. The page will work without a separate bundler.
4. Test import, search, metadata, duplicate detection, error handling, export, mobile layout and navigation.
5. Only after verifying the page, add an Atlas navigation link to `./atlas98-data-lab.html` using the existing universal navigation owner. Do not add a second competing global nav script.

## Data / source integrity
- All file processing is local to the browser. Nothing is automatically persisted or sent to source websites.
- Unknown reuse rights block a record from the usable-candidate export; an operator's selection of a license is **not** proof the selected license applies.
- Records with missing X/Y cannot enter the usable-candidate export.
- Coordinate values are not independently checked against in-game geography; all usable records remain **research candidates**, never verified map pins.
- GeoJSON coordinates may be longitude/latitude, not game-world X/Y. Do not inject them directly into GTA maps without a verified transform.
- GTA VI entries remain provisional.
- Matching duplicates are excluded, but false positives/false negatives are possible because uniqueness uses name, category and coordinates, not authoritative source IDs.
- Existing bookmarks, saved progress and route engines are untouched.

## Sources to investigate separately
- GTADB.org (`https://github.com/rolux/gtadb.org`): inspect dataset license and notice for each source file. Use approved local copies, do not rely on repeatedly fetching the production server.
- GTAWeb / PLTytus (`https://github.com/PLTytus/GTAWeb`): issues, feature design and troubleshooting; issue tracker does not establish a license for GTAWeb map/data files or site code.
- Other GTA community sites: direct linking, documentation and original implementation are fine. Obtain a matching license or permission before bulk copying an otherwise unlicensed database or media.

## Verification performed
`node --check atlas98-data-lab.js` and `node --test tests/data-lab.test.cjs` passed locally (8/8 tests). Full browser, network tile, map coordinate calibration, visual reference comparison, user-device and Cloudflare tests remain outstanding.
