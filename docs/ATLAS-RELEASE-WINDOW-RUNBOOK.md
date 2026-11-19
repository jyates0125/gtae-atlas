# Atlas release operations · quiet-window deployment

## Branch policy
- Feature work stays on dedicated branches. The Cloudflare Pages production branch is `development`; `main` remains protected.
- No feature branch is merged into `development` until the owner reviews and approves a complete release candidate.

## Preferred initial release window
- Tuesday–Thursday, **03:00–04:00 America/New_York** (02:00–03:00 America/Chicago), subject to actual Cloudflare traffic analytics and owner availability.
- This is a hypothesis about lower U.S. traffic, not a measured visitor-traffic result.
- If the window is missed, defer to the next suitable window; never merge an untested release merely to meet a clock.

## Preflight
1. Record the current production commit SHA and deployment URL.
2. Run automated tests and check failed steps, responsive/iPhone workflows, maps, navigation, storage migration, garage, crew, image fallbacks, security and accessibility.
3. Compare against the designed-brand references and the vehicle parity gate; document missing items.
4. Have the owner approve the full release candidate.

## Publish and verify
1. Merge approved feature branch into `development` within the window.
2. Confirm GitHub checks and Cloudflare Pages deployment succeeded.
3. Smoke-test the **live** URL on phone and desktop: home, four featured maps, GTA V Story/Online separation, GTA VI, My Garage, My Crew, search, routes, storage, fallback artwork.
4. Monitor errors and analytics. If a critical regression appears, revert the merge commit on `development` using a reviewed recovery PR, then verify the recovered deployment.

## Constraints
- No automatic timed production merge: approval, passing tests, and verified readiness are mandatory.
- Cloudflare's atomic deployment behavior reduces risk but does not guarantee zero client-side disruption, particularly with incompatible cached assets.
- Do not claim release completion without production verification.
