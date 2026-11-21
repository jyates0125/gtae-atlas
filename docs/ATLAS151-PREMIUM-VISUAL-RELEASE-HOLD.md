# Atlas 15.1 — premium designed-brand acceptance lock (STAGING ONLY)

**Owner rejection:** 2026-11-19, iPhone screenshots of Atlas 15.0 staging. Current functional navigation/layout is a marked improvement, but the newer cover-art substitution to generic skyline/flat SVGs is **not approved** and must not be released as the finished brand. This supersedes the visual acceptance assumptions in 14.8; green browser tests do not constitute art approval.

**Authority:** `docs/TEAM-JURA-STANDING-CHARTER.md`; `docs/ATLAS92-MASTER-SPEC.md`; `docs/ATLAS-SITE-COMPLETION-CONTRACT.md`; `docs/APPROVED-DESIGNED-BRAND-MASTER.png` plus owner's later accepted original reference pack and artwork. The Elario parent identity, cinematic violet/amber/gold, Loki/Scaly only where contextually relevant, original crest, typography and navigation remain. Game pages and heist pages must express their *own* world, not replay a generic poster across unrelated destinations. Do not downgrade to dated flat placeholder scenes to solve hotlink or rights concerns.

## Exact regression cause

- In Atlas 14.8, `atlas98-portal.js` intentionally starts with `atlas140-{world}-concept.svg` for the four featured cards and `atlas93-*.svg`/`atlas106-*.svg` for other map cards. This changed cinematic/reused covers to simplistic local illustrated defaults. The change was technically reliable but visually rejected.
- Earlier remote `coverSrc` URLs in the development registry were third-party mirrors/hotlinks with unclear re-use rights; blindly restoring them is **not** an acceptable permanent fix. Instead, use the original approved artwork from our repo or new subject-specific Elario cinematic assets stored locally and documented in `atlas-credits.html`. Any official Rockstar artwork must have documented defensible fan-use grounds for that particular use, not simply online availability.
- The `atlas98-flow.css` fixed dock overlays live iPhone content on pages that already offer modern navigation. Atlas 15.1 CSS suppresses the redundant dock on modern mobile header pages and compacts it on genuine legacy shells.
- Heist HQ previously rendered text-only mission cards; all fifteen individual source-bundled `art/atlas93-heist-<id>.svg` illustrations now appear on their matching HQ cards. **These remain interim conceptual images**, not yet approved premium illustrations.

## Premium artwork acceptance matrix

| Page/section | Scene & content requirement | Acceptance |
|---|---|---|
| Entry / Start Here | Existing approved cinematic Team Jura hero + original Elario crest, visible start/account flows | Pending screenshot comparison |
| GTA V Story | Los Santos street and city/basin setting, accurate world-specific landmarks, map tools | **BLOCKED**: generic cover |
| GTA Online | Distinct Online vehicle/crew nightlife or current update-inspired context, not Story art recycled | **BLOCKED**: generic cover |
| GTA VI Leonida | Distinct Vice City/Leonida wetlands/neon skyline original cinematic art; maps official/research kept separate | **BLOCKED**: generic cover |
| Cayo Perico | Island, tropical compound, submarine and heist context, not mainland Los Santos | **BLOCKED**: generic cover |
| GTA IV | Liberty City/Alderney tone and recognizably different city silhouette | **BLOCKED**: generic cover |
| San Andreas | Three-city / countryside 1990s atmosphere and actual map workspace | **BLOCKED**: generic cover |
| Vice City | Distinct 1986 retro pastel coastal atmosphere | **BLOCKED**: generic cover |
| GTA III | Industrial 2001 Liberty atmosphere, not IV/Stories duplicate | **BLOCKED**: generic cover |
| Vice City Stories | Distinct 1984 Vice City era and scene | **BLOCKED**: generic cover |
| Liberty City Stories | Distinct 1998 Liberty City era and scene | **BLOCKED**: generic cover |
| Chinatown Wars | Handheld-era stylized modern Liberty map theme | **BLOCKED**: generic cover |
| The Lost and Damned | Specific gritty biker theme and world, not generic skyline | **BLOCKED**: generic cover |
| The Ballad of Gay Tony | Nightclub luxury/nightlife Liberty City theme, distinct from biker/IV | **BLOCKED**: generic cover |
| Heist HQ | Source-linked individual mission covers, cinematic themed header; all 15 mission cards now differentiated | Interim art assigned; **final premium art pending** |
| Individual heist planners | Correct heist-specific artwork plus checklist, operation map and provenance; no generic map substitution | **BLOCKED**: source-aligned art/real overlay inspection |
| Vehicles, garage, characters, animals, collectibles and research | Item/game-specific imagery, verified model/spec/source status; no shared crew banner used for every page | **BLOCKED** pending page review |
| iPhone layout | No dock over buttons, no horizontal overflow, no search/filter collision, overlays respect browser chrome | Partial source fix; **needs Chromium/Edge/iPhone preview QA** |

## Release verification rules — NO EXCEPTIONS

1. Preserve every functional feature and every original approved asset; change only the page-specific presentation and needed accessibility. Keep static hosting and existing local progress keys.
2. Add locally bundled **approved**, distinct cinematic cover art for 13 map worlds. Create or license source art individually with provenance; do not treat the 13 old generic SVGs as final.
3. Review screenshots at **390x844 iPhone viewport** and **1440x900 desktop** for every major section. Include scrolling, filtered results, map controls and actual asset decode, not only first fold; compare to the accepted reference.
4. Test clickable CTA links and return paths: Start Here, map cards, classic world workspaces, all fifteen heist links, game-specific map view, Garage, progress export and map load.
5. Re-run source/static audit, Chromium+Edge desktop/mobile, packaged release verification and Cloudflare branch-preview check.
6. **Do not merge PR #68 into `development` and do not change protected `main` until owner-approved brand art is visibly restored** and overlay issues resolved. The owner-authorized morning merge is conditional, not permission to release rejected artwork.
7. Maintain a dated release difference report and explicitly note what still lacks verified coordinates, official rights or imagery. No fabricated map landmarks or brand signoff.

The current task is to **restore premium art while preserving the improved layout**, not roll back the layout or gameplay work. 
