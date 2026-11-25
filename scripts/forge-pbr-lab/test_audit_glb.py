"""Synthetic GLB intake regression tests; no copyrighted model data."""
import copy
import hashlib
import json
import struct
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

AUDIT = Path(__file__).with_name('audit_glb.py')
BASE = {'asset': {'version': '2.0'}, 'scene': 0,
        'scenes': [{'nodes': [0]}],
        'nodes': [{'name': 'body', 'mesh': 0}, {'name': 'unused', 'mesh': 1}],
        'meshes': [{'primitives': [{'attributes': {'POSITION': 0}, 'material': 0}]},
                   {'primitives': [{'attributes': {'POSITION': 0}, 'material': 1}]}],
        'materials': [{'name': 'bodypaint'}, {'name': 'unusedpaint'}],
        'buffers': [{'byteLength': 36}], 'bufferViews': [{'buffer': 0, 'byteLength': 36}],
        'accessors': [{'bufferView': 0, 'componentType': 5126, 'count': 3,
                       'type': 'VEC3', 'min': [0, 0, 0], 'max': [1, 1, 0]}]}
BIN = struct.pack('<9f', 0, 0, 0, 1, 0, 0, 0, 1, 0)


def encode(obj, binary=BIN):
    raw = json.dumps(obj).encode()
    raw += b' ' * (-len(raw) % 4)
    chunks = struct.pack('<II', len(raw), 0x4e4f534a) + raw
    if binary is not None:
        chunks += struct.pack('<II', len(binary), 0x004e4942) + binary
    return struct.pack('<4sII', b'glTF', 2, len(chunks) + 12) + chunks


class AuditGLBTests(unittest.TestCase):
    def run_audit(self, data):
        with tempfile.TemporaryDirectory() as temp:
            path = Path(temp) / 'fixture.glb'
            path.write_bytes(data)
            return subprocess.run([sys.executable, str(AUDIT), str(path)],
                                  capture_output=True, text=True)

    def test_active_scene_and_hash(self):
        data = encode(BASE)
        result = self.run_audit(data)
        self.assertEqual(result.returncode, 0, result.stderr)
        report = json.loads(result.stdout)
        self.assertEqual(report['sha256'], hashlib.sha256(data).hexdigest())
        self.assertEqual(report['activeNodeNames'], ['body'])
        self.assertEqual(report['usedMaterialNames'], ['bodypaint'])

    def test_malformed_assets_rejected(self):
        for case in ['external', 'cyclic', 'empty_mesh', 'missing_bin', 'short_bin', 'missing_position', 'empty_position']:
            with self.subTest(case=case):
                obj = copy.deepcopy(BASE)
                binary = BIN
                if case == 'external': obj['buffers'][0]['uri'] = 'https://example.org/data.bin'
                if case == 'cyclic': obj['nodes'][0]['children'] = [0]
                if case == 'empty_mesh': obj['meshes'][0]['primitives'] = []
                if case == 'missing_bin': binary = None
                if case == 'short_bin': binary = BIN[:12]
                if case == 'missing_position': obj['meshes'][0]['primitives'][0]['attributes'] = {}
                if case == 'empty_position': obj['accessors'][0]['count'] = 0
                self.assertNotEqual(self.run_audit(encode(obj, binary)).returncode, 0)


if __name__ == '__main__':
    unittest.main()
