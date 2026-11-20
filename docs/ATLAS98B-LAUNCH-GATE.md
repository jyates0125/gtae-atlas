# Team Jura Atlas 9.8B · Launch gate and functional parity

**Release target:** publicly share around November 17–19, 2026 ahead of / with GTA VI release November 19. **Current Cloudflare Production = development 9.7. This package has not been deployed.** GitHub `main` is preserved and GitHub Pages publishing is disabled. Do not upload this entire cumulative overlay onto old `main`.

## P0 — blockers before a public URL is shared

1. **Correct brand:** Homepage at `/` must render approved Loki/Scaly identity; 4 big clickable flagship world cards, 13-map directory, Elario→Team Jura→Atlas hierarchy. Compare a 1440×900 desktop screenshot and a 390×844 mobile screenshot against `APPROVED-REFERENCE-DASHBOARD(1).png` / `docs/APPROVED-DESIGNED-BRAND-MASTER.png`. Character variants are concepts unless approved. The exported PNG mockup is not a real website.
2. **Actual map controls:** Open `atlas.html`, `atlas-online.html`, `atlas-vi.html` and `atlas-cayo.html`; verify visible in-game/illustrated/terrain/satellite views where promised, pan/zoom/reset, marker search, category show/hide, selected marker details, saved/found progress and route actions. Map engines are preserved from 9.7 and MUST be manually smoke-tested on the deployed Preview before merging.
3. **Navigation:** Header, bottom quick menu and All 13 page should lead where the labels promise. With the updated `map-hub.html` `?game`/`?world` compatibility, no classic link should revert to generic default. Search for 'Vice City Stories'; verify it enters its own notebook and the breadcrumb returns to the directory.
4. **Persistent saves:** Make a temporary collectible entry; refresh; confirm it is still there. Export/restore and check per-world separation. Never clear other game storage while testing. Test route with two personal pins and marked item in each of 7 classics.
5. **Source truth:** Cayo is schematic, GTA VI community research unverified, Classic personal image pins are not game XY. No generic 'live now' feed, false completed % or fake Google Maps GPS claims.
6. **Asset quality:** All approved character imagery, icons and linked images load without 404 or accidental homepage fallback; no huge horizontal scroll on a 390px phone. Verify readable contrast and keyboard focus.
7. **Automated passive audit:** On Cloudflare Preview open `/atlas98b-test.html`; press **Audit all pages**; resolve broken internal links and missing files, export report. Also check browser Console/Network on game pages. A passive audit does not certify maps.
8. **Data sync:** On `atlas98-preview`, run `Atlas 9.8B — Preview source data and quality` workflow, get GTA IV/V landmarks under `data/gtadb-{4,5}.json` with separate manifests and attribution. The VI snapshot exists on development. Verify source licenses/data counts and no leaked key/user data.

## P1 — improve within available research, without blocking truthful launch

- Sync collectible per-item pins from verified sources where game-coordinate transforms are known; preserve native map engines and avoid duplicate overlays.
- Better GTA V/Online 100-item collection UI: selecting a collection filters actual pins, hide-found and route-ready filters; no fabricated markers.
- San Andreas: evaluate Toliak Apache-2.0 vector map and Ian Albert reference layer for a permission-safe baseline; pin-level coordinates require independent confirmation and projection.
- GTA IV partial map: merge attributed GTADB landmark research with its existing map only if X/Y conversion matches.
- Seven classic worlds: build real in-game coordinate basemaps from clearly licensed upstream sets, not direct competitor tiles; current personal notebook/checklist is a useful interim.
- Live Online: add dated, source-verified weekly/daily activity records and expiry dates; no unconditional “open now” indicators.
- Full post-release GTA VI research verified after November 19; keep imported pre-release research sources separated from game-confirmed items.

## P2 — film / long-term features

- **One Last Ride**: preserve existing story/characters and approved poster; finish shots, footage rights, audio/video and mobile playback in separate review. The map-site launch must not falsely claim a finished film.
- True shared-progress adapter across `jura3-progress`, HQ, checklist and garage saves with versioned non-destructive migration + export/restore tests.
- User content/community and external-account integrations require security/privacy design and active hosting controls.

## Reality check for all 63 HTML pages

**Source inventory from last examined GitHub `development` tree:** 60 pre-existing HTML pages. This cumulative package adds 3 standalone pages (`atlas98-style-lab.html`, `atlas98-landmarks.html`, `atlas98b-test.html`), while replacing the current `index.html`, `maps.html`, `map-hub.html` only on preview. The passive browser audit enumerates 63 pages. Large legacy pages may still carry older version labels or broken UI. The test must be run against a full checkout / real Cloudflare Preview; this ZIP is an additive overlay, **not** a complete 63-page repository.

### Map and utility page groups to test one by one

- **P0 world routes:** index, maps, atlas (V Story), atlas-online, atlas-vi (Leonida), atlas-cayo, atlas-research, atlas-sa, atlas-iv, map-hub, atlas98-landmarks, atlas98-style-lab.
- **P0 tracking / tool spine:** atlas81-hq, atlas-completion, atlas-checklist, atlas-catalog, atlas93-garage, atlas90-vehicles5, atlas90-vehicles6, atlas90-weapons, atlas-toolkit, atlas-activities, atlas87-daily, atlas-passport, atlas93-dispatch.
- **P1 15 heist pages:** heists, heist-fleeca, heist-prison-break, heist-humane-labs, heist-series-a, heist-pacific-standard, heist-doomsday-act-1/2/3, heist-diamond-casino, heist-cayo-perico, heist-auto-shop, heist-salvage-yard, heist-agency-vip, heist-cluckin-bell, heist-kortz-center (research-only). Count matches current file inventory, not a claim of tested mechanics.
- **P1 research / project:** atlas-verification, atlas-coverage, atlas-test-center, atlas-feature-audit, atlas-calibration, atlas-pack-format, atlas-credits, guides, team-jura, elario, project, one-last-ride.
- **P2 legacy (preserve / mark old):** atlas8-preview, atlas97-journey, directory, discovery, explorer, legacy-explorer, online-explorer, hunt-hq, leonida-hq.

**QA evidence already in package:** Playwright in-memory DOM fixtures desktop/mobile: 58/58 passed; offline GTADB sync validators: 6/6 passed. All 63-page hosted browser/link audit and original 9.7 game-engine click tests remain pending. There is no honest 100% parity claim yet.
