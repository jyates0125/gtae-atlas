# Team Jura Atlas — Map Completion Gates
Updated November 17, 2026. This file records **testable completion criteria**, not a claim of full feature parity.

## Master rules
- The approved **Team Jura Original Design Reference Pack** governs the visual system: **Elario Studios → Team Jura → Atlas**, original Scaly/Loki artwork, cinematic violet/amber identity, and the many-crews community vision.
- Keep GTA V Story, GTA Online and GTA VI Research datasets, locations and progress **separate**. GTA VI coordinates remain **community-provisional / unverified** until independently validated.
- Use Rockstar official information for primary claims. Only import third-party coordinates/tiles when permission/licensing and attribution are established. Never assume a publicly accessible dataset is freely reusable.
- Never import proprietary competitor collections, misrepresent approximate direct-line routes as driving directions, or create fabricated spawns.
- Do not expose visitor-editable master data or site secrets. Keep guest progress local and user-controlled.

## Map functionality gates

| Gate | Required acceptance test | Status |
|---|---|---|
| 01. Initial state | Story, Online, Scaly, Loki open with marker canvas off; category filters remain usable | Implemented in this PR; CI pending |
| 02. Category controls | Single category, Only, Show All, Hide All, Pins button and named-layer controls consistently reveal/hide pins | Changed in this PR; CI pending |
| 03. 2D/3D parity | Global marker visibility honored in 2D and VI 3D; selected place still focusable | Changed in this PR; browser QA pending |
| 04. Mobile gestures | One-finger drag, two-finger anchored pinch and taps do not interfere | Anchored pinch improved; real-device QA pending |
| 05. Data precedence | Valid local attributed snapshot outranks cached or starter data regardless of record count | Changed in this PR; CI pending |
| 06. Map artwork | All advertised licensed tiles actually render for every game/view/zoom, including offline fallback | Needs live network/device audit |
| 07. Collectible artwork | Emoji/icon matches verified category, including seasonal hearts, clovers, pumpkins and snowmen | Fallback icons expanded; category-by-category audit remains |
| 08. Source accuracy | Map pin count verified against every available licensed source and every Story/Online scope | Partial; source-by-source audit required |
| 09. Search | Text, category, district, coordinate links, filter reset and map focus work | Existing functionality; full live QA required |
| 10. Routes | Add/remove/reorder, optimized nearby straight-line stops, progress persistence and clear labeling | Existing functionality; road-graph directions not verified |
| 11. Accessibility | Keyboard zoom/pan, focus states, labels, mobile layout, no duplicate overlaid legend | Existing suite covers core checks; accessibility audit outstanding |
| 12. Deployment | Chromium, Edge, validated public build and Cloudflare live version checked after merge | CI / live publication pending |

## Website integrity gates
- Preserve the four featured world cards, all remaining map destinations, Atlas HQ, Cayo, GTA IV/San Andreas legacy maps, One Last Ride, Elario Studios, garages, heists, and community research.
- Preserve existing user saves, routes, and garage progress: no destructive localStorage key renames or migrations without backup.
- Validate JavaScript syntax, Python offline contracts, original asset paths, Cloudflare public output, and Chromium/Edge desktop/mobile smoke tests.
- Compare actual desktop/mobile screenshots to the approved design reference pack before asserting a visual match.
- Cloudflare preview success is **not** production deployment confirmation. Verify the live public URL, cache behavior and visible records separately.

## Shipping decision
Keep this PR as a draft until all automated checks pass and the Scaly/Loki no-pins behavior is visually confirmed. Merge to `development` first; do not merge unrelated `main` changes or enable automatic publication of unverified data. The unverified gates above remain open after this PR.
