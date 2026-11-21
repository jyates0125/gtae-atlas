# Atlas 19.5 — data-backed source label inventory, not fabricated parity
This page uses the shipped, source-attributed GTADB snapshots rather than remote polling or user local storage. It exposes per-label counts as **source labels**, not gameplay categories: the same research landmark may have several labels. GTA VI positions remain unverified. No upstream art or game assets are duplicated.

The standalone JSON is validated against each checked-in `data/gtadb-{4,5,6}.json` source pack on every static release build. Filter/source-world and CSV actions are exercised by the production browser smoke suite. Local maps and other page behavior remain unchanged.

Do not mistake research labels like `l4`, `enterable`, `unconfirmed`, `//pink` for confirmed gameplay, interiors, colors or spawns. Missing coordinates are counted as **search only**. Some relevant GTA V/Online game events need separate source-backed per-world datasets before map parity can be certified.

No live merge before owner signoff.
