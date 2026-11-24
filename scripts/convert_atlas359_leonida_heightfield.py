#!/usr/bin/env python3
"""Convert a *permitted* georeferenced uint16 grayscale elevation PNG for
local Team Jura GTA VI research terrain. Output is never marked verified.
No network or dependency outside Pillow for PNG decoding.
"""
from __future__ import annotations
import argparse
from array import array
from hashlib import sha256
from pathlib import Path
import json
import math
import sys

GRID = dict(width=1536, height=1748, scale_xy=0.083188297074,
            zero_x=1108.532445611, zero_y=938.090772693,
            scale_z=92.466616, offset_z=-303.1033271360121)


def read_world_file(path: Path):
    values = [float(v.strip()) for v in path.read_text('utf-8').splitlines() if v.strip()]
    if len(values) != 6 or not all(math.isfinite(v) for v in values):
        raise ValueError('world file must have exactly 6 finite affine values')
    a, d, b, e, c, f = values
    if abs(d) > 1e-9 or abs(b) > 1e-9 or a <= 0 or e >= 0:
        raise ValueError('rotated or flipped source not supported; expected east-positive columns, south-positive rows')
    return a, e, c, f


def convert(pixels, source_width, source_height, affine, input_sea, input_per_meter,
            grid=None, edge_tolerance_px=2.0):
    """Return uint16-le raw heights and a transparent coverage/clipping report.
    pixels must support access as pixels[x,y]. Coordinates are pixel centers.
    """
    if grid is None:
        grid = GRID
    if source_width < 2 or source_height < 2:
        raise ValueError('source grid too small')
    a, e, c, f = affine
    if not all(math.isfinite(v) for v in (a, e, c, f, input_sea, input_per_meter, edge_tolerance_px)):
        raise ValueError('affine and conversion must be finite')
    if a <= 0 or e >= 0 or input_per_meter <= 0 or not (0 <= edge_tolerance_px <= 3):
        raise ValueError('invalid source units or edge tolerance')
    if grid['scale_xy'] <= 0 or grid['scale_z'] <= 0:
        raise ValueError('invalid target grid')
    samples = array('H')
    near_edge = clipped_low = clipped_high = 0
    for row in range(grid['height']):
        y_world = (grid['zero_y'] - row) / grid['scale_xy']
        src_y = (y_world - f) / e
        for col in range(grid['width']):
            x_world = (col - grid['zero_x']) / grid['scale_xy']
            src_x = (x_world - c) / a
            if not (-edge_tolerance_px <= src_x <= source_width - 1 + edge_tolerance_px and
                    -edge_tolerance_px <= src_y <= source_height - 1 + edge_tolerance_px):
                raise ValueError(f'source does not cover GTA VI grid near target pixel ({col},{row})')
            if src_x < 0 or src_y < 0 or src_x > source_width - 1 or src_y > source_height - 1:
                near_edge += 1
            x = max(0, min(source_width - 1, src_x))
            y = max(0, min(source_height - 1, src_y))
            x0 = int(x)
            y0 = int(y)
            x1 = min(x0 + 1, source_width - 1)
            y1 = min(y0 + 1, source_height - 1)
            fx, fy = x - x0, y - y0
            p00 = pixels[x0, y0]
            p10 = pixels[x1, y0]
            p01 = pixels[x0, y1]
            p11 = pixels[x1, y1]
            value = (p00 * (1 - fx) + p10 * fx) * (1 - fy) + (p01 * (1 - fx) + p11 * fx) * fy
            z_m = (value - input_sea) / input_per_meter
            target_raw = round((z_m - grid['offset_z']) * grid['scale_z'])
            if target_raw < 0:
                clipped_low += 1
                target_raw = 0
            if target_raw > 65535:
                clipped_high += 1
                target_raw = 65535
            samples.append(target_raw)
    if sys.byteorder != 'little':
        samples.byteswap()
    data = samples.tobytes()
    report = {'target_game': 6, 'width': grid['width'], 'height': grid['height'],
              'bytes': len(data), 'sha256': sha256(data).hexdigest(),
              'edge_clamped_pixels': near_edge, 'clipped_low_pixels': clipped_low,
              'clipped_high_pixels': clipped_high,
              'source_height_units': 'raw source samples (explicit transform)',
              'output_classification': 'UNVERIFIED private reconstructed terrain'}
    return data, report


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--png', type=Path, required=True, help='User-provided permitted 16-bit grayscale PNG')
    parser.add_argument('--world-file', type=Path, required=True, help='ESRI six-line PNG world file')
    parser.add_argument('--raw-sea', required=True, type=float, help='Raw PNG value corresponding to 0m')
    parser.add_argument('--raw-per-meter', required=True, type=float, help='Raw PNG value per 1m rise')
    parser.add_argument('--out', type=Path, required=True, help='Local elevation-6.bin destination')
    parser.add_argument('--max-clipped-percent', type=float, default=5,
                        help='Fail if clipped pixel share exceeds this percentage')
    args = parser.parse_args()
    try:
        from PIL import Image
    except ImportError as exc:
        raise SystemExit('Pillow is required to read 16-bit PNG: python -m pip install Pillow') from exc
    with Image.open(args.png) as source:
        if source.mode not in ('I;16', 'I;16L', 'I;16B'):
            raise SystemExit('Input must be 16-bit monochrome PNG, not 8-bit/colour or RGB')
        source.load()
        payload, report = convert(source.load(), source.width, source.height,
                                  read_world_file(args.world_file), args.raw_sea,
                                  args.raw_per_meter)
    count = report['width'] * report['height']
    share = 100 * (report['clipped_low_pixels'] + report['clipped_high_pixels']) / count
    if not (0 <= args.max_clipped_percent <= 100) or share > args.max_clipped_percent:
        raise SystemExit(f'Rejected: {share:.2f}% of output heights clip to 16-bit limits; inspect units/datum')
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_bytes(payload)
    report['source_png'] = args.png.name
    report['source_sha256'] = sha256(args.png.read_bytes()).hexdigest()
    report['source_world_file'] = args.world_file.name
    args.out.with_suffix('.research-report.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(report, indent=2))
    print('Private local preview only. License, provenance and independent control points are still unverified.')


if __name__ == '__main__':
    main()
