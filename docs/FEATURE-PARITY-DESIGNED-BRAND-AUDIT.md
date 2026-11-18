# Team Jura Atlas 8.3 · Feature parity and Designed Brand audit

## Release state
**Integrated overlay packaged; not deployed.** The existing `development` branch currently uses Atlas 8.1 and the shared map engine. This release is deliberately **not called finished** until live Cloudflare validation and outstanding location coverage work pass.

## Approved master reference
The approved 20-page Team Jura dashboard image is bundled under `docs/DESIGNED-BRAND-REFERENCE.png`. Its design standard is **ELARIO STUDIOS → TEAM JURA → ATLAS**, with cinematic purple/orange/gold styling, original Loki and Scaly artwork, world selector, featured content, three-panel interactive map, heists, vehicles, collectible tracker, challenges, databases, community/memories, research, tools, progress, and One Last Ride.

The Atlas 8.3 local screenshot and side-by-side comparison are under `docs/`. The current HQ preview loads a cropped original approved dashboard scene and gives real working navigation. However, its typography, character crop, density, 3-panel hero/map arrangement, multi-module panels, and graphic effects are **not a pixel match**. No generic character artwork is substituted for the missing exact assets.

## Implemented in this package
- Integrates with **the map pages that already exist** (`atlas.html`, `atlas-online.html`, `atlas-vi.html`) using the shared `site-unified.js` already loaded on those pages; no manual HTML script tags are needed.
- Adds **Atlas HQ** to the map header and changes utility-page Home to Atlas HQ. HQ itself already has a Home tab.
- Makes the map mode buttons dedicated to their pages rather than allowing confusing embedded switching across Story, Online, VI; a clear three-link switch remains.
- Adds a left-sidebar collectible section, with category selector, per-item checklist, totals, search, sourced-map status, direct map location link, and source guide.
- **Show set pins** filters the existing map using its native map-search event, not a duplicate renderer. **Hide collected** drives the existing native map filter.
- Completion changes are copied to the existing map progress key `jura3-progress`, Atlas HQ key `team-jura-atlas81-hq-v1`, and legacy checklist key `team-jura-checklist-v54`. Map-side mapped checkbox changes refresh once because the existing canvas engine reads its private progress snapshot on initialization; note this UX limitation. Source-native map pin Found buttons remain the more fluid choice.
- **No new coordinates are fabricated.** Story records link to real existing community source records when they have item IDs/slots; unmapped Online categories show guides rather than false exact map pins. GTA VI remains explicitly provisional.
- No `main` branch or GitHub Pages setting changes.

## 20-page design scope / functional parity
| Feature or destination | Current foundation | Atlas 8.3 effect | Remaining |
|---|---|---|---|
| Command Center Home | Atlas 8.1 `atlas81-hq.html` | Header Home and visible map HQ links | Cinematic layout pixel parity |
| GTA V Story explorer | `atlas.html` | Dedicated Story mode, left collectible legend | More item-level pins and native subcategory API |
| GTA Online explorer | `atlas-online.html` | Dedicated Online mode; set metadata and tracking | 100% individual Online coordinates and marker integration |
| GTA VI explorer | `atlas-vi.html` | Dedicated VI research context | No confirmed release-grade data |
| Cayo Perico | `atlas-cayo.html` | Existing route preserved | Schematic only, not calibrated terrain |
| GTA IV | `atlas-iv.html` | Existing destination preserved | Coverage expansion |
| Interactive layered maps | `atlas.js`, views | Preserved | Performance / UV illustration fidelity checks |
| Source/marker database | `atlas-catalog.*` | Preserved | Provenance by record, 100% locations |
| Collectibles HQ | Atlas 8.1 tracker | Shared map progress keys | Online map pin alignment, progress on native pins |
| Story mapped collection | `atlas-completion.html` | Deep links and source feed reused | Full source verification |
| Route planner | Existing map routes | Map action retained | Per-set optimized itineraries and safe persistence testing |
| Vehicles | Existing map / catalog | Preserved | Dedicated filters/complete records |
| Heists and prep | `heists.html` + heist pages | Preserved | Precise heist pins and payouts |
| Challenges | Atlas activities | Preserved | Reliable category-specific pins |
| Live and seasonal | `atlas-activities.html` | Preserved | Dated verified feed, avoid inferred live status |
| Research and verification | `atlas-research.html` etc | Preserved | More verification citations |
| Toolkit | `atlas-toolkit.html` | Preserved | Consolidate quick commands |
| Passport | `atlas-passport.html` | Preserved | Shared cross-game checklist sync |
| Community / memories | Existing One Last Ride pages | Preserved | User-submitted content/hosting concerns |
| One Last Ride | `one-last-ride.html` | Preserved | Brand-integrated showcase |
| Elario Studios | `elario.html` | Preserved | Full approved artwork and typography |
| Credits/attribution | `atlas-credits.html` | Preserved | Audit each imported content source |

**Page count:** Twenty was the design scope, **not** a mandatory count of distinct HTML screens. A smaller set of discoverable primary destinations can preserve all 20 capabilities and be easier to navigate.

## External parity research (Nov 14, 2026)
- GTADB Story map: subcategories with progress counters (Spaceship Parts 0/50 and required unlocks), filterable markers and single-marker deep links: https://gtadb.net/gta-5-map/
- GTADB Online: separate Online sets, seasonal versus daily locations, current-versus-all distinction, and source status: https://gtadb.net/gta-online-map/interactive/
- GTAMap.io: eye toggles per category/set, checklist-linked marker selection and fly-to: https://gtamap.io/gta-5-interactive-map/
- The GTA Map: hides collected, separates Story/Online, route optimizer: https://thegtamap.com/map

**Parity not yet attained:** entire collectible location index, in-place marker recoloring for all sets, individual show/hide per collection without native search, live daily rotation validation, exact approved layout. Never reproduce copyrighted or restricted basemap/graphics/data without proper permission; existing GTADB landmark attribution is not automatically a license for all other assets.

## Test evidence
- `node --check` for `site-unified.js`, `atlas83-map.js`, existing HQ JS: **passed**.
- Headless Chromium isolated DOM fixture for Story collection selector (11 Story sets), set filter forwarded to native map search, Hide collected forwarded to native filter, legacy/HQ progress keys synchronized, navigation inserted: **passed** (`docs/TEST-RESULTS.json`).
- Local HQ browser-rendered static screenshot: **captured**, compared to approved image; visual fidelity **incomplete**.
- Live website interaction and production screenshot comparison: **not executed**, because container browser local/http navigation was blocked by administrator. The fixture tests do not certify all original `atlas.js` interactions.
- ZIP CRC and JSON parse verified after packaging.

## Known limitations and release criteria
1. No complete verified per-item coordinates for the 20 collections; the native Online map cannot mark all items on-map yet. **Blocked on licensed/verified source data.**
2. The existing map renderer is a large closure. External map-panel checkbox changes force a map refresh for mapped pins; an internal map event/API should eliminate that refresh in a later refactor.
3. Map sidebar layout is improved but does not precisely recreate the 20-page 4K master dashboard.
4. The HQ artwork crop comes from the approved original dashboard, but exact full-resolution character cutouts/individual panels are not included. Other pages can still have missing artwork.
5. Live Cloudflare check, mobile map interaction, source fetch behavior, export/import regressions, accessibility and route regressions remain to be verified after upload.
6. Historical collection-count conflicts (e.g., hidden packages and evolving media sticks) need per-version definitions; do not silently change a saved user slot mapping.

**Status: development QA release, feature-parity incomplete; brand fidelity incomplete.**
