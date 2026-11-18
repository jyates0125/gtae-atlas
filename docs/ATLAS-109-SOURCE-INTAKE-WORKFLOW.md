# Atlas 10.9 · source intake & map release workflow

Reviewed 18 November 2026 · Owner: Elario Studios / Team Jura Atlas

## Provenance architecture

**One public source of truth:** `atlas-credits.html` is the canonical human-readable creator, map, wiki, imagery, license, accuracy, and rights notice. `data/atlas98-source-rights.json` is the internal inventory for publisher, reuse state and per-game coverage. `atlas-source-registry.html` is a research directory linked back to the canonical credits.

### Step-by-step asset intake

1. Identify **original** author, source page, license file and a stable upstream commit or download ID. Avoid mirroring another aggregator's composite when its contributors can be accessed directly.
2. Record the **specific portion** to use: code, vector tracing, source coordinate points, map tiles, video, or game screenshots. A repository-level MIT license for scripts may not extend to images embedded in that repository.
3. Decide `original`, `allowed-with-terms`, `external-reference-only`, `individual-rights-review`, or `blocked`. **Blocked** for an explicit no-reuse restriction without permission; other ambiguities are source-only until clarified.
4. If upstream metadata or relevant game art is not cleared, **link** to its source and implement a source-agnostic Elario adapter or original image. Do not publish a copied file on the theory that a later takedown can fix it.
5. For allowed-source imports, preserve original author, URL, applicable license text/URL, source revision, retrieval date, and any changed/derived fields. Count and hash the records; retain the previous snapshot before replacement.
6. Record `game`, `mode`, `category`, `coordinateSystem`, `source`, `confidence` and `lastChecked`. No cross-mode mixing and no guessing missing coordinates. Use approximate markers and source-facing notes for uncertain places.
7. **Manually review** the proposed map cover, image or marker batch against the designed-brand pack and visible mobile/desktop previews. Avoid reworking Scaly, Loki or the proven GTA V maps while improving other pages.
8. Run `python scripts/test_atlas_static.py`, `node scripts/build-cloudflare.cjs`, `python scripts/audit_published.py`, Chromium and Edge browser smoke tests. Only merge the exact commit that passed all checks. Verify the merged Cloudflare deployment separately.

### Useful upstream techniques we're adopting

- **GTADB.ORG**: Git-backed snapshots, CC BY 4.0 landmark provenance, contributor credits, a versioned tile/source coordinate scheme, MIT map-code ideas. Use **repository files and explicit license notices**, not a repeated high-load live service scraper. Preserve the exact GTADB MIT notice on the credits page.
- **Toliak + Flentric**: file-level Apache-2.0/MIT provenance, separation between map imagery and actual world-coordinate points, explicit projection accuracy disclaimers.
- **Ian Albert**: high-resolution map art and original stitched screenshot methodologies with an author permission statement. Public rehosting of copyrighted Rockstar game screenshots remains separately assessed. Individual visitors can install locally obtained lawful images.
- **GTAMap.io**: independent per-map source list, accurate game/era selection, distinct layers and provenance visible near the feature, clear pre-release labels; these are techniques, not a grant to download its own tile server or proprietary annotations.
- **Rockstar**: link to the official policy and official image pages; its January 10, 2025 policy generally tolerates occasional noncommercial fan content without deliberate story spoilers, but reserves takedown rights, bans distributing pre-release leaked footage, and does not apply automatically to films or studio/advertising use.

### Existing repository jobs

- `.github/workflows/team-jura-data-review.yml` already performs **manual** GTADB IV/V license-based source import and uploads a **review artifact**, not a direct production push. Maintain this review boundary; no silent automerge or live scrapes.
- `.github/workflows/team-jura-release.yml` already validates source, static map regressions, browser interactions and the publishable `public/` artifact in Chromium, Microsoft Edge and zip packaging.
- `scripts/test_credits_109.py` now guards the central credits source list, Rockstar note, full preserved upstream MIT notice, actual map statuses and correct links, and runs from `scripts/test_atlas_static.py`.
- The credits page is included in the same 1440px/390px Chromium and Edge browser smoke cycle as the interactive maps.

## Not shipped by this change

No new GTA Wiki game map raster, GTAMap.io satellite layer, third-party portrait, leaked-game screenshot or copyrighted Rockstar texture is imported. GTA VI reconstructions remain clearly provisional. GTADB code/data licenses are preserved for eligible contributions only.

## Operational note

Attribution and responsible correction procedures do not guarantee a court would find every fair-use or fan-content claim lawful. Keep Elario Studios' original brand, separate commercial plans and family content distinct from this unofficial gaming reference companion.
