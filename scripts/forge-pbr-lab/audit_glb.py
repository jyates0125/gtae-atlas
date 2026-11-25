"""Read a pinned local GLB's metadata only. No external URIs or code execution."""
import hashlib, json, struct, sys
from pathlib import Path
data=Path(sys.argv[1]).read_bytes()
magic,version,total=struct.unpack_from('<4sII',data,0)
assert magic==b'glTF' and version==2 and total==len(data)
length,kind=struct.unpack_from('<II',data,12)
assert kind==0x4e4f534a and length+20<=len(data)
j=json.loads(data[20:20+length])
for entry in j.get('images',[])+j.get('buffers',[]):
    assert 'uri' not in entry, 'External dependency in binary asset'
# Resolve only the actual default scene, not unused names in the source file.
nodes=j.get('nodes',[])
meshes=j.get('meshes',[])
materials=j.get('materials',[])
scenes=j.get('scenes',[])
scene=j.get('scene',0)
assert isinstance(scene,int) and 0<=scene<len(scenes), 'Missing default scene'
seen=set()
stack=list(scenes[scene].get('nodes',[]))
while stack:
    index=stack.pop()
    assert isinstance(index,int) and 0<=index<len(nodes), 'Invalid node reference'
    assert index not in seen, 'Duplicate or cyclic scene node'
    seen.add(index)
    stack.extend(nodes[index].get('children',[]))
mesh_ids=set()
for i in seen:
    if 'mesh' in nodes[i]:
        mesh=nodes[i]['mesh']
        assert isinstance(mesh,int) and 0<=mesh<len(meshes), 'Invalid mesh reference'
        mesh_ids.add(mesh)
material_ids=set()
for i in mesh_ids:
    for primitive in meshes[i].get('primitives',[]):
        if 'material' in primitive:
            material=primitive['material']
            assert isinstance(material,int) and 0<=material<len(materials), 'Invalid material reference'
            material_ids.add(material)
out={'sha256':hashlib.sha256(data).hexdigest(), 'selfContained':True,
 'activeMeshCount':len(mesh_ids),
 'activeNodeNames':[nodes[i].get('name') for i in sorted(seen)],
 'usedMaterialNames':[materials[i].get('name') for i in sorted(material_ids)],
 'asset':j.get('asset'), 'extensionsUsed':j.get('extensionsUsed',[]),
 'materials':[{'name':m.get('name'), 'baseColorTexture':m.get('pbrMetallicRoughness',{}).get('baseColorTexture'),
 'baseColorFactor':m.get('pbrMetallicRoughness',{}).get('baseColorFactor'),
 'extensions':list(m.get('extensions',{}))} for m in j.get('materials',[])],
 'nodes':[{'name':n.get('name'), 'mesh':n.get('mesh'), 'children':n.get('children',[]), 'rotation':n.get('rotation'), 'translation':n.get('translation')} for n in j.get('nodes',[])],
 'meshes':[{'name':m.get('name'), 'materials':[p.get('material') for p in m.get('primitives',[])]} for m in j.get('meshes',[])]}
print(json.dumps(out,indent=2,ensure_ascii=False))
