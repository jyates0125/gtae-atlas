import importlib.util
from pathlib import Path
from struct import unpack
import tempfile
import unittest

spec=importlib.util.spec_from_file_location('conv',Path(__file__).with_name('convert_atlas359_leonida_heightfield.py'))
conv=importlib.util.module_from_spec(spec);spec.loader.exec_module(conv)

class Matrix:
 def __getitem__(self, k):
  x,y=k
  return 28150+x*100+y*200

class Tests(unittest.TestCase):
 def setUp(self):
  self.grid=dict(width=4,height=4,scale_xy=1,zero_x=0,zero_y=3,scale_z=46.51,offset_z=0)
 def test_world_orientation_and_linear_interpolation(self):
  payload,meta=conv.convert(Matrix(),5,5,(1,-1,0,3),28150,46.51,self.grid)
  rows=unpack('<16H',payload)
  self.assertEqual(rows[0],0)
  self.assertEqual(rows[3],300)
  self.assertEqual(rows[12],600)
  self.assertEqual(rows[-1],900)
  self.assertEqual(meta['edge_clamped_pixels'],0)
 def test_coverage_rejects_unrelated_raster(self):
  with self.assertRaisesRegex(ValueError,'does not cover'):
   conv.convert(Matrix(),5,5,(1,-1,5000,5000),28150,46.51,self.grid)
 def test_clip_tracking(self):
  payload,meta=conv.convert(Matrix(),5,5,(1,-1,0,3),28150,46.51,
                            {**self.grid,'offset_z':1000})
  self.assertEqual(meta['clipped_low_pixels'],16)
 def test_parse_world_file(self):
  with tempfile.TemporaryDirectory() as d:
   p=Path(d)/'test.pgw';p.write_text('1\n0\n0\n-1\n0\n3\n')
   self.assertEqual(conv.read_world_file(p),(1,-1,0,3))
   p.write_text('1\n1\n0\n-1\n0\n3\n')
   with self.assertRaisesRegex(ValueError,'rotated'):
    conv.read_world_file(p)

if __name__=='__main__': unittest.main()
