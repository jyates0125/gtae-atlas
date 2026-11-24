#!/usr/bin/env python3
"""Atlas 36.1: geometry-only preflight for an upstream Leonida elevation raster.
This does NOT read/copy the third-party PNG, test relief correctness, or
grant redistribution rights. The input metadata below is publicly documented
and pinned to an upstream Git revision for reproducible research.
"""
from __future__ import annotations
import json
from math import isfinite
from pathlib import Path

from convert_atlas359_leonida_heightfield import GRID

SOURCE = {
    "repo": "https://github.com/wpenistone/leonida_gis",
    "revision": "7e3d9b5bc4ae2b09fd60316da0001d706dba10dc",
    "path": "rasters/heightmap_16bit.png",
    "git_blob_sha": "91a73e17ed9d835bfc6b3a4fbc5092e007ccce79",
    "width": 2150,
    "height": 2736,
    "affine": (12.01652939, -12.01652939, -13318.09624072, 11265.41629079),
    "redistribution_permission": "NOT CONFIRMED",
}


def preflight(source=SOURCE, grid=GRID, tolerance_px=2.0):
    width, height = source["width"], source["height"]
    sx, sy, ox, oy = source["affine"]
    if not all(isfinite(x) for x in (sx, sy, ox, oy, tolerance_px)):
        raise ValueError("Non-finite georeference")
    if sx <= 0 or sy >= 0 or width < 2 or height < 2 or not 0 <= tolerance_px <= 3:
        raise ValueError("Invalid source transform or tolerance")
    east_west = [(column-grid["zero_x"])/grid["scale_xy"] for column in (0, grid["width"]-1)]
    north_south = [(grid["zero_y"]-row)/grid["scale_xy"] for row in (0, grid["height"]-1)]
    x_px = [(x-ox)/sx for x in east_west]
    y_px = [(y-oy)/sy for y in north_south]
    low_x, high_x=min(x_px),max(x_px)
    low_y, high_y=min(y_px),max(y_px)
    overshoot={
        "west": max(0.0,-low_x),
        "east": max(0.0,high_x-(width-1)),
        "north": max(0.0,-low_y),
        "south": max(0.0,high_y-(height-1)),
    }
    compatible=all(value <= tolerance_px for value in overshoot.values())
    return {
        "geometric_footprint_compatible": compatible,
        "target_pixels": grid["width"] * grid["height"],
        "target_bytes_uint16_le": grid["width"] * grid["height"] * 2,
        "source_width_px": width, "source_height_px": height,
        "source_pixel_x_range": [low_x, high_x],
        "source_pixel_y_range": [low_y, high_y],
        "edge_overshoot_source_pixels": overshoot,
        "edge_tolerance_px": tolerance_px,
        "requires_explicit_edge_clamping": any(value>0 for value in overshoot.values()),
        "source_git_revision": source["revision"],
        "source_git_blob": source["git_blob_sha"],
        "source_file_rights_verified": False,
        "relief_and_landmark_alignment_verified": False,
        "status": "geometry preflight only — NOT proof of game elevation, alignment or license",
    }


def main():
    report=preflight()
    print(json.dumps(report, indent=2))
    if not report["geometric_footprint_compatible"]:
        raise SystemExit("The candidate footprint does not cover Atlas's target grid")
    print("Atlas conversion input footprint is compatible within declared edge tolerance.")
    print("Do not redistribute or call terrain verified without file-specific permission and independent control points.")


if __name__ == "__main__":
    main()
