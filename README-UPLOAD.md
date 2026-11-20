# Team Jura Atlas 9.7 — One cumulative upload, 9.4 → 9.7

**Contains all files from Atlas 9.6 plus the new Atlas 9.7 work**. Do not upload earlier ZIPs. The approved master design files and artwork already in your development repository are preserved, NOT replaced.

1. Open `jyates0125/team-jura-atlas-preview` in GitHub and select `development`.
2. Extract this ZIP on your laptop. Upload its contents to the repository root, keeping `.github/`, `art/`, `docs/`, `scripts/`, `tools/` folders and root files. The only intentional existing-source replacement is `scripts/sync_gtadb_vi.py` from 9.6; when prompted by GitHub, replace that file on **development**.
3. Commit as `feat: stage Atlas 9.7 cumulative Designed Brand and visitor journey`.
4. Open Actions → **Apply Team Jura Atlas 9.7 one-upload designed-brand release** → Run workflow on `development`. Enter `development` as confirmation.
5. The workflow integrates 9.4, 9.5, 9.6 and 9.7, refreshes the licensed GTADB.org community source, generates human-readable site audit JSON, checks repeat-safety and commits the actual existing-page updates to **development only**.
6. Open your development Cloudflare preview. Check `atlas97-journey.html`, `index.html`, `atlas81-hq.html`, `atlas-research.html`, `atlas-vi.html`, `atlas93-garage.html`, `atlas90-vehicles5.html`, `heists.html` and one legacy page on laptop and iPhone. No merge to `main` until approved brand comparison and live interaction pass.

## What is installed

- **9.4** Clean duplicate map legend, collapse trailer evidence, clarify WebGL and restore Loki selection.
- **9.5** GTA VI research source and local elevation 3D deck, source labels, verified-vs-unverified status, local progress backup; keep no-coordinate records searchable.
- **9.6** Scalable marker clustering with clickable zoom, accessible research keyboard controls, duplicate vehicle parking and garage slots, category → vehicle garage bridge, static page audit.
- **9.7** A complete new human-first Start Here screen, one clear navigation entry across pages, quick route into each major tool, contextual notices on archived pages, current catalog → personal garage bridge and read-only progress overview. Includes new proposed cinematic Scaly + Loki team hero art, **while preserving both approved character images**.

## Brand safety

Brand authority remains `docs/APPROVED-DESIGNED-BRAND-MASTER.png`, `docs/ATLAS92-MASTER-SPEC.md`, and `art/atlas86-{loki,scaly}-approved.webp`. New image `art/atlas97-proposed-loki-scaly-hero.webp` is a *proposed creative extension*, not a replacement or a claim of exact character likeness fidelity. Match brand visual parity by comparing actual browser screenshots to the master design; approve new artwork only after review. This package does not assert that approval has happened.

## Important limits

- GTA VI locations remain **UNVERIFIED community research**; never claim they are official gameplay pins. GTADB.org CC BY 4.0 source records are different from GTADB.net; public pages are not permission for bulk media copying.
- Browser local progress is not a Rockstar sync, and counts may overlap across legacy trackers. Imported heightfield is required for non-flat terrain; rendering a 3D perspective is not a verified 3D landform.
- This ZIP has not been deployed or verified against Cloudflare production. GitHub integration write access was previously denied; use your signed-in GitHub interface. Site-wide audit is structural rather than a claim all 59 pages were clicked in a browser.
- `main` remains unchanged until separate review and acceptance.

See `docs/ATLAS97-HUMAN-UX-AND-BRAND-REVIEW.md` for the 59-page grouping, feature priorities, risks and acceptance gates.
