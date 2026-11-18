"""Atlas 9.9 integrated source-data contracts; no network needed.
Data tests never promote community landmarks to verified collectible spawns.
"""
from pathlib import Path
import json
import math
import unittest

ROOT = Path(__file__).resolve().parents[1]

class MapDataContracts(unittest.TestCase):
    def test_locally_bundled_attributed_snapshots(self):
        for game, minimum in [('4', 2500), ('5', 2200), ('6', 3000)]:
            with self.subTest(game=game):
                snap = json.loads((ROOT / f'data/gtadb-{game}.json').read_text(encoding='utf-8'))
                self.assertEqual(snap['game'], game)
                self.assertEqual(snap['license'], 'CC BY 4.0')
                self.assertEqual(snap['licenseUrl'], 'https://creativecommons.org/licenses/by/4.0/')
                self.assertIn('github.com/rolux/gtadb.org', snap['sourceUrl'])
                rows = snap['records']
                self.assertIsInstance(rows, dict)
                self.assertGreaterEqual(len(rows), minimum)
                self.assertEqual(snap['count'], len(rows))
                mapped = 0
                for key, record in rows.items():
                    self.assertRegex(key, r'^L\d+$')
                    self.assertIsInstance(record, list)
                    self.assertGreaterEqual(len(record), 7)
                    self.assertIsInstance(record[0], str)
                    point = record[1]
                    if isinstance(point, list) and len(point) == 2 and all(
                        isinstance(n, (int, float)) and not isinstance(n, bool) and math.isfinite(n)
                        for n in point
                    ):
                        mapped += 1
                self.assertGreaterEqual(mapped, minimum - 200)
                if game in {'4', '5'}:
                    self.assertEqual(snap['schema'], 2)
                    self.assertEqual(mapped, snap['mappedCount'])
                    self.assertEqual(len(rows) - mapped, snap['searchOnlyCount'])
                    self.assertRegex(snap['sourceCommit'], r'^[0-9a-f]{40}$')
                    meta = json.loads((ROOT / f'data/gtadb-{game}-manifest.json').read_text())
                    self.assertEqual(meta['sourceCommit'], snap['sourceCommit'])
                    self.assertEqual(meta['count'], snap['count'])
                    self.assertIn('community', snap['status'].lower())

    def test_same_map_research_visibility_and_gta_mode_isolation(self):
        engine = (ROOT / 'atlas.js').read_text(encoding='utf-8')
        self.assertIn("jura99-research-overlays", engine)
        self.assertIn("...(researchOn()?datasets[game]:[])", engine)
        self.assertIn("filterScope()", engine)
        for page in ['atlas.html', 'atlas-online.html', 'atlas-vi.html']:
            page_text = (ROOT / page).read_text(encoding='utf-8')
            self.assertIn('id="showCommunityResearch"', page_text)
            self.assertIn('id="showUnverified"', page_text)
        gta4 = (ROOT / 'atlas-iv.js').read_text(encoding='utf-8')
        self.assertIn("fetch('./data/gtadb-4.json'", gta4)
        self.assertIn("Array.isArray(v[6])", gta4)
        self.assertIn('jura-iv-favorites', gta4)
        self.assertIn('jura3-progress', engine)

    def test_integrated_research_and_existing_map_routing(self):
        directory = (ROOT / 'maps.html').read_text(encoding='utf-8')
        for game in '456':
            self.assertIn(f'atlas98-landmarks.html?game={game}', directory)
        self.assertIn('MANY CREWS', directory)
        library = (ROOT / 'atlas98-landmarks.js').read_text(encoding='utf-8')
        self.assertIn('landmark-map-link', library)
        self.assertIn('initialGame', library)
        self.assertIn('mapLinks[current]', library)
        event_js = (ROOT / 'atlas88-events.js').read_text(encoding='utf-8')
        self.assertIn('JuraAtlasEventLocations', event_js)
        self.assertIn('will not invent pins', event_js)
        self.assertIn('eventFocusIds', (ROOT / 'atlas.js').read_text(encoding='utf-8'))

if __name__ == '__main__':
    unittest.main()

