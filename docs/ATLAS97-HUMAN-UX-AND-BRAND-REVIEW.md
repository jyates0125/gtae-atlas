# TEAM JURA ATLAS 9.7 — Human Usability, Page Coverage, and Original Designed Brand

**Development review, November 15, 2026.** Source of truth: approved Team Jura Design Reference Pack and `docs/ATLAS92-MASTER-SPEC.md` in the repository. **Development branch observed at `6f863489845a1d0447b8d55712928897a27a9b14`, before integration of 9.6/9.7.** This review is based on repository HTML/JS inspection and local fixture tests; it is **not** a successful public Cloudflare deployment or completed pixel comparison with approved screenshots.

## Recommended positioning

The project is more appealing as **one fan companion that remembers the next task**, not a list of technical demonstrations. Visitors should be able to answer in five seconds: *Which GTA world do I want? Where are its locations? How do I mark progress? Where do I return tomorrow?* The new `atlas97-journey.html` does exactly that while remaining linked to the existing real map, garage, heist and progress tools. Do not replace original map engines. Keep the approved Loki and Scaly artwork, original page hero hierarchy, Elario parent brand, violet/amber/gold palette, strong map imagery, and in-world atmosphere.

## Full page-group review (59 original HTML pages)

### 1. First impression, brand and media
- `index.html`: currently attractive and linked to the right sections, but competes with Atlas HQ. **9.7 adds a single Start Here action** in the existing homepage.
- `atlas81-hq.html`: most complete progress dashboard. Keep as power-user collection HQ, not another landing page. 9.7 adds a Start Here entry.
- `elario.html`, `team-jura.html`: retain parent hierarchy and approved character identities. Review new mural against master; do not treat new artwork as automatically approved.
- `project.html`: portfolio showcase still has 7.4 in HTML `<title>` despite 9.3 displayed chrome. Update title/version only after build verification, and show current proof links.
- `one-last-ride.html`: distinctive entertainment feature; manually verify audio playback permissions, video controls, attribution, mobile audio, and load failures. No sound autoplay promises.
- `atlas97-journey.html`: **new** practical unified entry point with four world routes, actual feature links, local-first counts, and last-workspace resume. Not a rewrite of `index.html`.

### 2. Maps and research
- `maps.html`: the main world directory remains; keep live world cards visibly different from reference gateways.
- `atlas.html`, `atlas-online.html`, `atlas-vi.html`: strong engines but 71 static buttons, ~22 inputs/selects, and 18–20 loaded JS modules each. The map control surfaces need gradual consolidation; **no disabled or hidden native controls should remain in the tab order**. 9.4 removes extra visible VI legends, 9.5 adds source-aware research / 3D control, 9.6 adds selective clustering. Test memory and pointer interaction on actual iPhone.
- `atlas-research.html`: 9.6 allows source-linked pins to cluster then separate on zoom; unmapped GTADB.org research entries remain search-only. 3D uses a perspective mesh; non-flat terrain requires supplied heightfield. All GTA VI positions are **UNVERIFIED** pending gameplay review.
- `atlas-cayo.html`: the clearest game-specific working example of category menus; review heist mission source data versus schematic assumptions.
- `atlas-sa.html`: collectibles tracker and optional map pack; do not imply all collected items have verified geographic pins.
- `atlas-iv.html`: partial Liberty City reference; provide game-specific coverage indicator.
- `map-hub.html`: references classic GTA worlds without pretending the whole GTADB/GTAWeb world collection is native.
- `leonida-hq.html`: old stand-alone launch hub—keep accessible, but clearly link current research screen.
- `explorer.html`, `online-explorer.html`, `legacy-explorer.html`: keep working legacy tools yet mark as prior workspaces and link to modern maps.

### 3. Personal tracking and catalog
- `atlas-checklist.html`, `atlas-completion.html`, `atlas81-hq.html`, `hunt-hq.html`: overlapping persistent progress; the next major data change should be a tested, versioned one-way reconciliation layer, **not** silent overwrites.
- `atlas93-garage.html`: 9.6 adds multiple parking entries for the same model, floor/bay and planned capacity, keeping 9.0 collection ownership intact. No live Rockstar sync.
- `atlas90-vehicles5.html`: 9.6 adds catalog → My Garage deep link. Confirm it works after a fresh catalog load.
- `atlas90-vehicles6.html`: source grades mandatory: GTA V render is not a GTA VI screenshot or confirmed inclusion.
- `atlas90-weapons.html`: pictured weapon catalog, incomplete archive coverage; image fallbacks must be obvious.
- `atlas-catalog.html`: an older search/reference workspace; direct links now clarify its difference from pictured catalog and My Garage.
- `atlas-passport.html`: meaningful personal history only if it does not misstate completed achievements or sync across unrelated keys.
- `atlas93-dispatch.html`: next-action cards should link to actual tools and reflect local progress; 9.7 makes it easy to discover.

### 4. Heists (15 dedicated pages plus index)
- `heists.html`: retain all actual mission choices, but clearly distinguish checklists from validated in-game navigation.
- Original crew: `heist-fleeca.html`, `heist-prison-break.html`, `heist-humane-labs.html`, `heist-series-a.html`, `heist-pacific-standard.html`.
- Doomsday: `heist-doomsday-act-1.html`, `heist-doomsday-act-2.html`, `heist-doomsday-act-3.html`.
- Complex/modern: `heist-diamond-casino.html`, `heist-cayo-perico.html`, `heist-auto-shop.html`, `heist-salvage-yard.html`, `heist-agency-vip.html`, `heist-cluckin-bell.html`.
- Research-only: `heist-kortz-center.html`.
- All 15 source files were inspected for page headings, checklists, scripts and evidence-linked map behavior. Their existing map panels are often **schematic**. **Next serious effort:** one validated real map overlay for Cayo and Casino, not speculative markers for every heist.

### 5. Dailies, source verification, technical tools
- `atlas87-daily.html`: static reset labels and date-validated snapshot import; unknown current positions must never be presented as live.
- `atlas-activities.html`: game-scoped activity conditions are valuable if rules and dates are source-linked.
- `atlas-coverage.html`: source coverage ≠ actual positioned pins; explain this clearly.
- `atlas-verification.html`: central transparency page is important; keep an evidence type, source URL and review date for each claimed verification.
- `atlas-feature-audit.html`: historical implementation matrix; preserve historic data but surface actual current release gate instead of stale '7.x' claims.
- `atlas-test-center.html`: needed, but tests are only meaningful with a visible browser console/network failure log.
- `atlas-toolkit.html`: remove ambiguous hidden/offline switches only after behavioral regression checks.
- `atlas-calibration.html`, `atlas-credits.html`, `atlas-pack-format.html`: establish provenance and machine-readable coordinate schema; not a substitute for licensing all third-party media.
- `guides.html`: combine clear task links with source references; avoid redirect loops back to another menu.

### 6. Legacy/discovery pages and older preview
- `atlas8-preview.html`, `directory.html`, `discovery.html`: retain previous reference/educational UI but mark as legacy and route visitors to the new Start Here page.
- `hunt-hq.html`: many features in an old inline implementation, no reliable shared progress bridge; preserve existing data; do not promote as authoritative HQ.
- `leonida-hq.html`: archived marketing/landing route; funnel to current GTA VI research and evidence rather than further duplicate controls.
- `legacy-explorer.html`, `online-explorer.html`, `explorer.html`: earlier engines, still preserved for safety and compatibility. Add obvious "current workspace" notices rather than removing them.

## Priority after this cumulative build

1. **Live deployment and designed-brand screenshot acceptance** on desktop and iPhone before new feature work. Compare home/HQ, GTA VI map, Research, My Garage, Cayo, heist, and the 9.7 Journey with the master reference. Verify visually: Elario → Team Jura → Atlas, Scaly/Loki identities, navigation position, color contrast, in-game map art uncluttered, no duplicate legend, no blank 3D claims.
2. **Visitor task success**: start on index, launch Story, open an actual collection, mark one item, resume through new Journey; repeat for VI research and My Garage. Measure failed clicks and show visible errors.
3. **Shared progress state**: introduce a versioned adapter with export/restore and tests; do not instantly migrate or discard legacy progress. A visitor should have consistent collection counts, saved pins and garage ownership.
4. **Data freshness and permissions**: finish traceable GTADB.org sync, source hash, changed positions, attribution. Keep GTADB.net references separate and avoid bulk copying its proprietary imagery/content. Game release confirmation is an external gate.
5. **Gameplay depth, not more empty menus**: verify Cayo and Casino map overlays, track Online source-dated rotations, complete 9.6 garage slot browser tests, implement individual collection-to-route actions where actual positions exist.

## Deployment and acceptance gates

The package includes complete 9.4–9.7 source files and one `atlas97-one-upload-apply.yml` workflow, to run on `development` only. GitHub write access was denied in prior assistant tests. Therefore no deployment, production merge, actual live Cloudflare QA or user visual approval is claimed. Static tests, isolated browser fixture and full hosted tests are three distinct things. The generated `docs/ATLAS97-HUMAN-UX-AUDIT.generated.json` is a static per-page audit, **not** proof all pages were rendered, clicked and approved.

**Proposed art** `art/atlas97-proposed-loki-scaly-hero.webp` is newly generated original scene art. The existing `art/atlas86-loki-approved.webp` and `art/atlas86-scaly-approved.webp` are untouched, and brand masters remain the final authority. Reuse third-party copyrighted source data only when the relevant dataset/media license actually grants permissions; attribution alone does not grant otherwise-restricted copying.
