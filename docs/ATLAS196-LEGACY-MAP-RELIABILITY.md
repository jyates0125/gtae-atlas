# Atlas 19.6 — legacy explorer canvas performance, no live data dependency

The Atlas 19.5 full-browser smoke was 183 / 186 on Chromium (remaining: retired Cayo briefing figcaption in desktop + phone, heavy historic Leonida desktop page). The revised 19.6 code:

- Shares **one** Leaflet Canvas renderer among all visible markers, not one brand-new renderer per marker. This addresses the historic Leonida grid's heavy painter load; no marker location, save key or route ID is deleted.
- Reads the **included 3,425-record GTADB GTA VI research snapshot** from same-origin `data/gtadb-6.json`, not a live upstream fetch. Supports the original `raw.records` envelope and preserves original CC BY 4.0/source labeling. 91 search-only records remain absent from the geospatial layer, not invented onto the map.
- Keeps GTA Online alternate on game 5; Leonida legacy starts on game 6.
- Cayo release smoke now verifies its actual newer island+route controls rather than a hidden retired 10.4 briefing visual; all Cayo original artwork and mission-specific tests remain in dedicated focused acceptance.
- The occasional legacy screenshot receives an extended capture allowance; the photo still must actually capture to count as verified.
- **Staging only; do not merge** without current-head Chromium/Edge test success, source ledger and owner visual approval.
