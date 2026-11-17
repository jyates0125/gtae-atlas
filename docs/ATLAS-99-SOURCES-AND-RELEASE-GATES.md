# Atlas 9.9 — map sources, artwork rights and release gates

## Source hierarchy

1. Rockstar Games Newswire: authoritative public weekly announcements and dates; not an official documented per-location daily API. Link to original post and attach an observation timestamp.
   Rockstar's fan-content guidance expresses general non-objection to some noncommercial, non-spoiler fan use, not a blanket license. Its scope is occasional individual in-game fan content and it explicitly excludes certain digital publishing and commercial promotion. The owner may request removal. For interactive map art, seek specific permission from copyright@take2games.com or continue using clearly licensed original art while source research proceeds. Official policy: https://support.rockstargames.com/articles/7bNaeoMFTV0iUDGhStTXvz/policy-on-posting-copyrighted-rockstar-games-material
2. GTADB.ORG (rolux): locally bundled GTA IV, V and VI CC BY 4.0 landmarks, with source-commit pinning and attribution. Use source IDs (gtadb-game-Lnumber) for deduplication. V Story/Online share geographically valid places but NOT progress or game-specific activities. VI remains community-provisional.
3. Team Jura: approved art, navigation, 2D map engines, original WebGL graphics and character artwork.
4. CreepPork/GTAV-Maps: MIT-licensed GitHub repository with GTA V atlas, road, satellite, street and UV tile collections; underlying GTA game-map artwork remains Rockstar/Take-Two copyright. Repository MIT alone does NOT grant underlying artwork reproduction rights. Do not download/re-host/re-publish these tiles without resolving rights. Keep as a technical/reference candidate.
5. GTAWeb.eu: comparison for controls and event UX; PLTytus/GTAWeb public GitHub repo is an issue tracker and is not a reusable tiles/locations API.
6. GTA VI artwork: use authorized Rockstar links and original approved Elario creations; no republishing unrelated fan artists' assets by assumption.

## Maps-first changes
- Remove UV/UV2 pseudo-layers from selectors on Story, Online and VI. They were CSS recolors over existing tiles, not accurate collector UV artworks.
- Preserve radar, satellite, terrain, road, hybrid, Scaly, Loki, Yanis, Dupzor, named layers, category filters, bookmarks and existing local-storage progress.
- Make Start Here consistently visible and point it to atlas97-journey.html; home remains the landing page.
- Route related workspaces to one another (Story → Collectibles, Online → Daily, VI → Research, Vehicles → Garage).
- Garage uses original interactive WebGL concept geometry for paint/rotation, not a Rockstar vehicle model. The existing actual model-reference image remains alongside it.
- Keep essential maps free; avoid introducing auth/paywalls during source stabilization.

## Future published-tunables adapter (GTA Online / GTA VI)
Create a normalized feed per game and activity with game, mode, sourceUrl, observedAtUtc, effectiveStartUtc, effectiveEndUtc, activityId, placeId, evidenceLevel, license. Dated, validated positions only; never infer active location from a UTC countdown or generic weekly announcement. When a documented, permitted source exists, decode on CI/server with schema checks, bounds, duplicate-ID prevention and source attribution. Stage a data-only reviewed PR; avoid browser-side unauthenticated scraping, game binaries, secret tokens and redistribution of proprietary files. VI keeps community status until real game-specific evidence is available.

## Open gates
- True illustrated GTA V UV map art: tile/illustration license and coordinate-calibration clearance.
- Rockstar daily spawn decoder: stable lawful official endpoint/schema and verification.
- Exact vehicle mesh 3D: licensed original or authorized model meshes.
- GTA VI accurate 3D terrain: ground-truth heightfields and map coordinates.
- Complete source-backed collectible/event spawn sets: separate verified datasets, not guessed from landmark tags.

References:
- https://www.rockstargames.com/newswire
- https://github.com/rolux/gtadb.org
- https://github.com/CreepPork/GTAV-Maps
- https://github.com/PLTytus/GTAWeb
- https://gtamap.io/disclaimer/
