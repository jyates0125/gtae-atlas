"""Synthetic geometry-only contract for the pinned public Leonida GIS source header."""
import sys
import unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
from audit_atlas361_leonida_source_footprint import SOURCE, preflight

class FootprintAcceptance(unittest.TestCase):
 def test_public_source_metadata_covers_atlas_to_one_pixel(self):
  report=preflight()
  self.assertTrue(report['geometric_footprint_compatible'])
  self.assertEqual(report['target_bytes_uint16_le'],5_369_856)
  self.assertAlmostEqual(report['edge_overshoot_source_pixels']['west'],.622927,places=4)
  self.assertAlmostEqual(report['edge_overshoot_source_pixels']['north'],.940319,places=4)
  self.assertEqual(report['edge_overshoot_source_pixels']['east'],0)
  self.assertEqual(report['edge_overshoot_source_pixels']['south'],0)
  self.assertTrue(report['requires_explicit_edge_clamping'])
  self.assertFalse(report['relief_and_landmark_alignment_verified'])
  self.assertFalse(report['source_file_rights_verified'])
 def test_strict_zero_edge_clamp_fails(self):
  self.assertFalse(preflight(tolerance_px=0)['geometric_footprint_compatible'])
 def test_one_pixel_accepts(self):
  self.assertTrue(preflight(tolerance_px=1)['geometric_footprint_compatible'])
 def test_misaligned_origin_rejected(self):
  sample=dict(SOURCE)
  a,e,c,f=sample['affine']
  sample['affine']=(a,e,c+1200,f)
  self.assertFalse(preflight(source=sample)['geometric_footprint_compatible'])
 def test_opposite_axis_rejected(self):
  sample=dict(SOURCE)
  a,e,c,f=sample['affine']
  sample['affine']=(a,-e,c,f)
  with self.assertRaisesRegex(ValueError,'Invalid source transform'):
   preflight(source=sample)

if __name__=='__main__':
 unittest.main()
