# Atlas 39.0.3 — scoped header refresh

Owner clarification: keep newer artwork; do not replace worlds, maps or mission imagery. Only older/repeated decorative headers need attention. Not every page needs a picture. Preserve One Last Ride.

The prior exact 39.0.2 SHA 1cb1ea39933665fdd00aae016a368d22d9828bfb passed all five release jobs, including full Chromium, Edge and validated ZIP (run 45320761740). This is a new visual candidate, not a claim of approval or release.

Updated seven existing headers: Dashboard (no duplicate Leonida cover), News and Cheats (remove identical old cinematic poster), Activities (no duplicate Dispatch image), Account (remove duplicate crew image, guest-first unchanged), Toolkit and Checklist (no shared generic poster). Distinct violet/gold-compatible CSS treatments instead of new images for these functional pages. Existing artwork files, world covers, map engines, controls, heists, primary home, film, storage and authentication remain untouched. Credits/Research metadata references are not rendered header art; no unnecessary changes there. Team Jura crew illustration is content rather than a reused slide header and is retained.

Static test enforces unique scoped treatments and no stylesheet references on other pages. Existing full browser smoke checks rendered background and bounds. Owner desktop/native Safari visual review and exact-head release validation still required.
