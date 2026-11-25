"""Optional Blender-only adapter; exports a synthetic envelope, never a game asset.
Run: blender --background --factory-startup --python scripts/forge-pbr-lab/reconstruction/blender_export.py
"""
import json
from pathlib import Path
import bpy

root = Path(__file__).resolve().parents[3]
folder = root / "qa-evidence" / "forge-reconstruction"
candidate = json.loads((folder / "synthetic-candidate.json").read_text(encoding="utf-8"))
if (candidate.get("kind") != "synthetic-mesh-candidate" or candidate.get("releaseEligible") is not False
        or candidate.get("model") is not None or candidate.get("world") is not None):
    raise ValueError("Expected unpublished synthetic study")
mesh_data = candidate["mesh"]
if not (0 < len(mesh_data["vertices"]) <= 1536 and 0 < len(mesh_data["faces"]) <= 1538):
    raise ValueError("Mesh budget exceeded")
bpy.ops.wm.read_factory_settings(use_empty=True)
mesh = bpy.data.meshes.new("Synthetic body envelope")
mesh.from_pydata(mesh_data["vertices"], [], mesh_data["faces"])
if mesh.validate():
    raise ValueError("Mesh required repairs")
mesh.update()
obj = bpy.data.objects.new("Synthetic body envelope - NOT a game model", mesh)
bpy.context.collection.objects.link(obj)
mat = bpy.data.materials.new("Research automotive paint")
mat.diffuse_color = (0.18, 0.04, 0.28, 1)
mat.use_nodes = True
bsdf = mat.node_tree.nodes.get("Principled BSDF")
bsdf.inputs["Base Color"].default_value = mat.diffuse_color
bsdf.inputs["Metallic"].default_value = 0.65
bsdf.inputs["Roughness"].default_value = 0.26
obj.data.materials.append(mat)
for poly in mesh.polygons:
    poly.use_smooth = len(poly.vertices) == 4
obj["releaseEligible"] = False
obj["study"] = candidate["study"]
bpy.ops.export_scene.gltf(filepath=str(folder / "synthetic-envelope.glb"), export_format="GLB", export_extras=True)
print("Exported unpublished synthetic envelope")
