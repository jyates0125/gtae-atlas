# Team Jura Atlas source registry — development-only patch

Repository: `jyates0125/team-jura-atlas-preview`
Target branch: `development` (NOT main)
Date: 2026-11-15

1. Upload `atlas-source-registry.html` to the **root** of the development branch and commit.
2. Edit `index.html` in the development branch only. In its `<nav class="mainnav" ...>` add this navigation anchor near the existing Team Jura link:

   `<a href="./atlas-source-registry.html">Source Registry</a>`

3. Open the development Cloudflare site and visit `/atlas-source-registry.html`.
4. Check desktop/mobile display, search, status filter, all 10 external links and back links.
5. Preserve `main`, existing maps, One Last Ride assets, and original design reference pack.

This patch adds a new source registry and leaves the existing atlas untouched until the navigation edit is manually applied. No third-party data or copyrighted images are bundled.

GitHub connector write attempt returned HTTP 403 (Resource not accessible by integration). Therefore this is NOT yet committed or deployed.
