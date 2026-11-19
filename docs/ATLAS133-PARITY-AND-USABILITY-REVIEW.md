# Atlas 13.3 — feature-parity and usability review
Updated 2026-11-18. Scope: non-live PR #55 review branch; production development is protected by owner approval.

## Decision: the tool is primary; sharing is secondary
- The platform-by-platform launch package has been removed from the public sharing page. It remains a direct, user-initiated share/copy page.
- Seven social controls and consistent legal/resource links now appear in a compact footer across published pages, rather than obstructing the map/workspace.
- Sharing cannot automatically post to the user's account. Facebook/Reddit use web share composers; other services use supported device share capabilities or copy-and-paste.
- Preserve search, map renderers, markers, garage and progress storage keys. The change is shared shell/build and not game data.

## Reference benchmark (capability, not asset reuse)
- GTAWeb: a game-focused interactive atlas and GTA Online map. Benchmark map controls, marker detail and practical discovery, not its proprietary images or data.
- GTA Base: filters by vehicle class, manufacturer, edition, acquisition and storage, plus side-by-side vehicle comparisons (https://www.gtabase.com/grand-theft-auto-v/vehicles/ and /vehicles/comparison/).
- GTA DB: game/class/drivetrain/price/speed/feature vehicle filters, compare and item customization workflows (https://gtadb.net/vehicles/).
- MapGenie: layers, search, progress tracker and account/device sync; user progress portability is a core usability differentiator (https://play.google.com/store/apps/details?id=io.mapgenie.gta5map).
- These are feature references, not permission to copy their code, art, coordinates, maps or databases.

## Observed status from repository + required remaining validation
| Surface | Atlas implementation observed in repository | Gap / release gate |
|---|---|---|
| Finding a world | 13 destination discovery, dashboard, search-all-pages | Verify each card, cover image, and destination on iPhone |
| GTA V Story / Online / VI Research | Distinct pages and overlays, original map runtime retained | Verify source labeling, calibration, world-specific pins, navigation & zoom |
| Vehicle database | Catalog/filters and separate vehicle research routes | Verify real vehicle class/manufacturer/price/spec provenance; comparisons vs GTA Base / GTADB are NOT asserted fully equivalent |
| Garages | Guest vehicle collection with local saved notes | Validate class-specific card specs and storage restores; cloud sync not built |
| Collectibles | Tracker and collection pages | Audit item counts, game scope, marker art and completion consistency |
| Missions / heists | Individual heist routes and HQ | Review quality of each standalone heist page and embedded maps |
| 3D | Illustrative configurator | Not an exact official licensed GTA mesh viewer |
| Account | Optional guest; manual export/import | No verified secure login or cloud account sync |
| Share | Compact global footer and a simple caption/share hub | Needs real browser verification across all pages |
| One Last Ride | Nine chapters and motion-poster preview | Not a completed full-length AI film |
| Credibility | Sources, rights, research status and disclaimers | Audit rights per asset and distinguish confirmed GTA V from speculative GTA VI |

## Quality gates — order of future work
1. **Functional parity**: verify critical map, collectible, garage, catalog, heist, progress and research flows in real browsers. Record failures precisely; do not infer completeness from counts.
2. **Mobile usability**: iPhone 390px, horizontal scroll, navigation drawer, keyboard/focus, pinned map interactions, tap targets, safe-area footer and 3D fallbacks.
3. **Premium visual consistency**: compare every active page to the approved Elario designed-brand pack. Keep archive/legacy deliberately labeled. Prefer a game-first page with contextual art to repeating the same mascot/hero across all routes.
4. **Product integrity**: eliminate unverified statistics/images, broken art, routes that lead to unrelated GTA V maps, and fake availability/login claims.
5. **Release**: CI Chromium + Edge + asset audit + owner inspection of Cloudflare feature preview before merging to live development. Main untouched.

## Truth-in-release
A passed CI asserts the checks actually run, not 1:1 data/feature parity against reference websites. Exact third-party media reuse requires appropriate rights review. The owner must review the visual preview before development merges.
