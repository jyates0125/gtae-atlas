"""Read a pinned local GLB's metadata only. No external URIs or code execution."""
import json, struct, sys
from pathlib import Path
data=Path(sys.argv[1]).read_bytes()
magic,version,total=struct.unpack_from('<4sII',data,0)
assert magic==b'glTF' and version==2 and total==len(data)
length,kind=struct.unpack_from('<II',data,12)
assert kind==0x4e4f534a and length+20<=len(data)
j=json.loads(data[20:20+length])
for entry in j.get('images',[])+j.get('buffers',[]):
    assert 'uri' not in entry, 'External dependency in binary asset'
out={'asset':j.get('asset'), 'extensionsUsed':j.get('extensionsUsed',[]),
 'materials':[{'name':m.get('name'), 'baseColorTexture':m.get('pbrMetallicRoughness',{}).get('baseColorTexture'),
 'baseColorFactor':m.get('pbrMetallicRoughness',{}).get('baseColorFactor'),
 'extensions':list(m.get('extensions',{}))} for m in j.get('materials',[])],
 'nodes':[{'name':n.get('name'), 'mesh':n.get('mesh'), 'children':n.get('children',[]), 'rotation':n.get('rotation'), 'translation':n.get('translation')} for n in j.get('nodes',[])],
 'meshes':[{'name':m.get('name'), 'materials':[p.get('material') for p in m.get('primitives',[])]} for m in j.get('meshes',[])]}
print(json.dumps(out,indent=2,ensure_ascii=False))
