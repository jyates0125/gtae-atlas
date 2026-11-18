import importlib.util
from pathlib import Path
p=Path(__file__).with_name('sync_gtadb_vi.py');s=importlib.util.spec_from_file_location('gta_sync',p);m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
records={f'L{i}':[f'Example #{i}',[i/10.,-i/10.],[], '',[],[],[], 'abcd12'] for i in range(1,801)}
valid,mapped,search_only,rejected=m.validate(records)
assert len(valid)==800 and mapped==800 and search_only==0 and rejected==0
try:m.validate({'L1':records['L1']})
except ValueError:pass
else:raise AssertionError('Too-small dataset accepted')
records['malicious']=[]
valid,mapped,search_only,rejected=m.validate(records)
assert len(valid)==800 and mapped==800 and rejected==1
print('GTADB VI snapshot validation tests PASS')


# Protected-main safeguard adopted for schema-2: preserve search-only research
# and refuse mass removal before touching either output file.
from tempfile import TemporaryDirectory
import json
with TemporaryDirectory() as directory:
    m.OUTPUT=Path(directory)/'gtadb-6.json'
    m.MANIFEST=Path(directory)/'gtadb-6-manifest.json'
    initial,_=m.build_snapshot(records,now='2026-11-18T00:00:00Z')
    assert m.write_snapshot(initial,0) is True
    assert m.OUTPUT.is_file() and m.MANIFEST.is_file()
    original=m.OUTPUT.read_bytes()
    reduced={k:v for k,v in records.items() if int(k[1:])<=500}
    smaller,_=m.build_snapshot(reduced,now='2026-11-18T02:00:00Z')
    try:m.write_snapshot(smaller,0)
    except ValueError as exc:assert 'Suspicious upstream removal' in str(exc)
    else:raise AssertionError('Mass removal was wrongly allowed')
    assert m.OUTPUT.read_bytes()==original, 'Rejected update replaced licensed snapshot'
    assert m.write_snapshot(initial,0) is False, 'Unchanged source must not trigger a rewrite'
    with_unknown=dict(records)
    with_unknown['L1']=['Unknown position',[],[], '',[],[],[], 'abcd12']
    preserved,_=m.build_snapshot(with_unknown)
    assert preserved['count']==800 and preserved['mappedCount']==799
    assert preserved['searchOnlyCount']==1 and preserved['records']['L1'][1]==[]
print('GTA VI schema-2 retention and protected-main mass-removal guards PASS')
