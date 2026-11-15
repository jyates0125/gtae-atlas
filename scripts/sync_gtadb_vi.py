#!/usr/bin/env python3
"""Team Jura Atlas 9.5: reproducible GTA VI community-research snapshot.
Source: rolux/gtadb.org, data CC BY 4.0 (code MIT); no gtadb.org live API scraping.
Keeps coordinate-less records searchable on Research. Never promotes VI pins to verified.
"""
from __future__ import annotations
import argparse
import datetime as dt
import hashlib
import json
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
UPSTREAM = 'https://raw.githubusercontent.com/rolux/gtadb.org/main/map/data/6/landmarks.json'
SOURCE_URL = 'https://github.com/rolux/gtadb.org/tree/main/map/data/6'
OUTPUT = ROOT / 'data' / 'gtadb-6.json'
MANIFEST = ROOT / 'data' / 'gtadb-6-manifest.json'
MAX_BYTES = 8_000_000


def fetch_source():
    req = Request(UPSTREAM, headers={'User-Agent':'Team-Jura-Atlas/9.5 (repository source snapshot; contact via GitHub)', 'Accept':'application/json'})
    with urlopen(req, timeout=40) as response:
        if response.status != 200:
            raise RuntimeError('Upstream HTTP ' + str(response.status))
        blob = response.read(MAX_BYTES + 1)
    if len(blob) > MAX_BYTES:
        raise ValueError('Upstream exceeds 8 MB')
    return json.loads(blob.decode('utf-8'))


def validate(raw):
    if not isinstance(raw, dict) or not 500 <= len(raw) <= 25_000:
        raise ValueError('Expected 500–25,000 keyed source landmarks')
    cleaned = {}
    mapped = 0
    search_only = 0
    rejected = 0
    for key, value in raw.items():
        if not isinstance(key, str) or len(key) > 48 or not (key.startswith('L') and key[1:].isdigit()):
            rejected += 1
            continue
        if not isinstance(value, list) or len(value) < 7 or not isinstance(value[0], str) or not value[0].strip() or len(value[0]) > 220:
            rejected += 1
            continue
        point = value[1] if len(value) > 1 else None
        valid_point = (isinstance(point, list) and len(point) >= 2
                       and all(isinstance(n, (int, float)) and not isinstance(n, bool)
                               and n == n and abs(n) <= 16_384 for n in point[:2]))
        if valid_point:
            mapped += 1
        elif point is None or (isinstance(point, list) and len(point) == 0):
            search_only += 1
        else:
            # Invalid or implausible positions are not silently pinned. Preserve the descriptive record for search.
            value = list(value)
            value[1] = []
            search_only += 1
        cleaned[key] = value
    if mapped < 500:
        raise ValueError(f'Too few valid source coordinates: {mapped}')
    return cleaned, mapped, search_only, rejected


def build_snapshot(raw, now=None):
    rows, mapped, search_only, rejected = validate(raw)
    checked_at = now or dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat()
    digest = hashlib.sha256(json.dumps(rows, sort_keys=True, ensure_ascii=False, separators=(',', ':')).encode('utf-8')).hexdigest()
    snapshot = {
        'schema':2, 'game':'6', 'status':'community-provisional',
        'source':'GTADB.ORG and contributors', 'sourceUrl':SOURCE_URL,
        'license':'CC BY 4.0', 'licenseUrl':'https://creativecommons.org/licenses/by/4.0/',
        'changes':'Original GTADB.org landmarks mirrored for Team Jura community research; coordinates unverified in gameplay.',
        'sourceUpdated':checked_at, 'sourceHash':digest,
        'count':len(rows), 'mappedCount':mapped, 'searchOnlyCount':search_only,
        'records':rows,
    }
    return snapshot, rejected


def write_snapshot(snapshot, rejected):
    old = {}
    if OUTPUT.is_file():
        try:
            old = json.loads(OUTPUT.read_text(encoding='utf-8'))
        except (ValueError, UnicodeDecodeError):
            old = {}
    if old.get('sourceHash') == snapshot['sourceHash'] and old.get('schema') == snapshot['schema']:
        print(f'No source changes: {snapshot["mappedCount"]} mapped, {snapshot["searchOnlyCount"]} search-only; no commit needed')
        return False
    prior = old.get('records') or {}
    if not isinstance(prior, dict):
        prior = {}
    current = snapshot['records']
    added = sorted(set(current) - set(prior))
    removed = sorted(set(prior) - set(current))
    changed = sorted(k for k in set(prior) & set(current) if prior[k] != current[k])
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    manifest = {
        'schema':2, 'game':'6', 'status':'community-provisional / unverified',
        'sourceUrl':SOURCE_URL, 'license':'CC BY 4.0',
        'lastChecked':snapshot['sourceUpdated'], 'sourceHash':snapshot['sourceHash'],
        'count':snapshot['count'], 'mappedCount':snapshot['mappedCount'],
        'searchOnlyCount':snapshot['searchOnlyCount'],
        'added':len(added), 'changed':len(changed), 'removed':len(removed), 'rejected':rejected,
        'sampleAddedIds':added[:20], 'sampleChangedIds':changed[:20],
        'note':'All GTA VI positions are community-research coordinates, not verified gameplay. Unknown positions remain search-only.',
    }
    OUTPUT.write_text(json.dumps(snapshot, ensure_ascii=False, separators=(',', ':')) + '\n', encoding='utf-8')
    MANIFEST.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    print(f'Wrote {snapshot["count"]} records ({snapshot["mappedCount"]} mapped / {snapshot["searchOnlyCount"]} search-only), +{len(added)} / ~{len(changed)} / -{len(removed)}; rejected={rejected}')
    return True


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--input-json', type=Path, help='Test/airgapped input in GTADB.org source format. Omit to fetch the canonical GitHub source.')
    parser.add_argument('--dry-run', action='store_true')
    args = parser.parse_args()
    source = json.loads(args.input_json.read_text(encoding='utf-8')) if args.input_json else fetch_source()
    snapshot, rejected = build_snapshot(source)
    if args.dry_run:
        print(f'PASS schema={snapshot["schema"]} count={snapshot["count"]} mapped={snapshot["mappedCount"]} searchOnly={snapshot["searchOnlyCount"]} rejected={rejected}')
        return
    write_snapshot(snapshot, rejected)


if __name__ == '__main__':
    main()
