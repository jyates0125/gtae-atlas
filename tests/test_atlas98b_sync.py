#!/usr/bin/env python3
"""Offline data-mirror schema tests. DO NOT claim live GTADB.org mirror has run."""
import sys,pathlib,json,tempfile,unittest
ROOT=pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'scripts'))
import sync_atlas98_gtadb as sync

class SyncTest(unittest.TestCase):
 def example(self):return json.dumps({'L1':['Source Building',[10.5,-2.5],[32,32],'External address',[1.2,3.4],[40,40],['architecture'],'abc123']}).encode()
 def test_mapped_row(self):
  data,manifest=sync.normalize('4',self.example());self.assertEqual(data['count'],1);self.assertEqual(manifest['mappedCount'],1);self.assertEqual(data['license'],'CC BY 4.0');self.assertEqual(data['records']['L1'][0],'Source Building')
 def test_empty_fails(self):
  with self.assertRaises(ValueError):sync.normalize('5',b'{}')
 def test_invalid_row_rejected(self):
  with self.assertRaises(ValueError):sync.normalize('4',b'{"L1":["Missing point"]}')
 def test_invalid_json(self):
  with self.assertRaises(json.JSONDecodeError):sync.normalize('5',b'not json')
 def test_source_identity(self):
  doc,_=sync.normalize('5',self.example());self.assertEqual(doc['source'],'GTADB.ORG and contributors');self.assertTrue(doc['sourceUrl'].startswith('https://github.com/rolux/gtadb.org/'))
 def test_fixture_command_produces_two_games(self):
  with tempfile.TemporaryDirectory() as td:
   d=pathlib.Path(td);f=d/'fixtures';o=d/'out';f.mkdir()
   for g in ['4','5']:(f/(g+'.json')).write_bytes(self.example())
   sync.run(['--fixture-dir',str(f),'--output',str(o)])
   for g in ['4','5']:
    self.assertTrue((o/f'gtadb-{g}.json').is_file());self.assertTrue((o/f'gtadb-{g}-manifest.json').is_file());self.assertEqual(json.loads((o/f'gtadb-{g}.json').read_text())['count'],1)
if __name__=='__main__':unittest.main()
