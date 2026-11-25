#!/usr/bin/env python3
"""Inspect a pinned upstream source in private QA; never copy raw records into public."""
import hashlib
import json
import sys
from pathlib import Path
PINS = {
    'vehicleModKits.json': '2c83148f677e4410758e4309c199456b8eb33414',
    'vehicles.json': '954baff7a7d6511d013518aeadfdc7e88ef3a56a',
}
REVISION = 'b65684e00f689fdec405c5f1055322c802d3c895'
def audit(root):
    reports = {}
    for name, pin in PINS.items():
        raw = (root / name).read_bytes()
        if not 0 < len(raw) <= 100_000_000:
            raise ValueError(f'{name}: unexpected size')
        git_blob = hashlib.sha1(f'blob {len(raw)}\0'.encode() + raw).hexdigest()
        if git_blob != pin:
            raise ValueError(f'{name}: Git blob mismatch')
        data = json.loads(raw)
        if not isinstance(data, (list, dict)):
            raise ValueError(f'{name}: unexpected JSON root')
        rows = data if isinstance(data, list) else list(data.values())
        keys = sorted({key for row in rows if isinstance(row, dict) for key in row})
        reports[name] = {'bytes': len(raw), 'gitBlob': git_blob, 'sha256': hashlib.sha256(raw).hexdigest(),
                         'rootType': type(data).__name__, 'rootEntries': len(rows), 'recordKeys': keys}
        print(f'{name}: verified Git blob; {len(rows)} root entries', flush=True)
    return {'revision': REVISION, 'publication': 'private schema audit only; no import approval', 'files': reports}
if __name__ == '__main__':
    if len(sys.argv) != 3:
        raise SystemExit('usage: audit_durtyfree_vehicle_sources.py SOURCE_DIR REPORT_JSON')
    result = audit(Path(sys.argv[1]))
    Path(sys.argv[2]).write_text(json.dumps(result, indent=2) + '\n', encoding='utf-8')
