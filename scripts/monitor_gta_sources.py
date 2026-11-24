#!/usr/bin/env python3
"""Daily official-source availability snapshot. Research links only; no scraped assets."""
from datetime import datetime, timezone
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError
import json
import sys

SOURCES = {
    "rockstar_gta_vi": "https://www.rockstargames.com/VI",
    "rockstar_gta_vi_newswire": "https://www.rockstargames.com/newswire?tag=vi",
    "rockstar_gta_online_newswire": "https://www.rockstargames.com/newswire?tag=online",
    "rockstar_gta_vi_media": "https://www.rockstargames.com/VI/media",
    "gtadb_open_source": "https://github.com/rolux/gtadb.org",
}
results = []
for name, url in SOURCES.items():
    entry = {"source": name, "url": url, "reachable": False}
    try:
        req = Request(url, headers={"User-Agent": "TeamJuraSourceMonitor/1.0"})
        with urlopen(req, timeout=20) as response:
            entry["status"] = response.status
            entry["reachable"] = response.status == 200
            entry["final_url"] = response.geturl()
    except (URLError, HTTPError, TimeoutError, OSError) as exc:
        entry["error"] = type(exc).__name__
    results.append(entry)
print(json.dumps({"checked_at": datetime.now(timezone.utc).isoformat(),
                  "policy": "Link availability only; no claims, copying, or automatic map imports",
                  "sources": results}, indent=2))
# A temporary blocked upstream source is a research alert, not a site outage.
sys.exit(0)
