#!/usr/bin/env python3
"""Atlas 36.0 Chromium DOM pointer camera smoke with stubbed GPU only.
The synthetic mock does NOT certify real WebGL output or native iPhone Safari.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True)
 for mobile in (False,True):
  width=390 if mobile else 1440
  context=browser.new_context(viewport={'width':width,'height':844 if mobile else 900},
                              is_mobile=mobile,has_touch=mobile,device_scale_factor=1)
  page=context.new_page()
  page.set_content('''<!doctype html><html><body><canvas id="c" style="width:360px;height:300px"></canvas>
    <div id="o"></div><p id="s"></p></body></html>''')
  page.add_script_tag(path=str(ROOT/'atlas-3d.js'))
  activated=page.evaluate("""async () => {
    const canvas=document.getElementById('c');
    const fake=new Proxy({}, {get:(target,key)=>{
      if(key==='isContextLost')return ()=>false;
      if(key==='getShaderParameter'||key==='getProgramParameter')return ()=>true;
      if(key==='getAttribLocation'||key==='getUniformLocation')return ()=>0;
      if(String(key).startsWith('create'))return ()=>({});
      return ()=>{};
    }});
    canvas.getContext=kind=>kind==='webgl'?fake:null;
    canvas.setPointerCapture=()=>{};
    canvas.releasePointerCapture=()=>{};
    const bridge={game:()=> '6',camera:()=>({x:-4000,y:2000,z:2}),
      places:()=>[],route:()=>[],symbol:()=>'',color:()=> '#6543a3'};
    window.terrain=window.JuraTerrain3D.create({canvas,
      overlay:document.getElementById('o'),
      status:document.getElementById('s'),bridge});
    window.pointer=(type,id,x,y,shift=false)=>{
      const event=new PointerEvent(type,{bubbles:true,cancelable:true,pointerId:id,
        pointerType:'touch',clientX:x,clientY:y,shiftKey:shift});
      canvas.dispatchEvent(event);
      return event.defaultPrevented;
    };
    // Atlas 36.6 activates genuine 3D ONLY with an installed grid. Supply
    // synthetic memory-only samples; do not fetch or package a fake DEM.
    const d=JuraTerrain3D.ELEVATIONS['6'];
    const samples=new Uint16Array(d.width*d.height);
    samples.fill(28000);samples[0]=28001;samples[samples.length-1]=28111;
    await terrain.setElevationBinary(samples.buffer,'6');
    return terrain.activate() && canvas.style.touchAction==='none';
  }""")
  assert activated, (width,page.evaluate('window.terrain.getFrameReport()'))
  camera_before=page.evaluate('window.terrain.getView()')
  page.evaluate("""() => {
    pointer('pointerdown',1,100,100);
    pointer('pointermove',1,150,80);
    pointer('pointerup',1,150,80);
  }""")
  orbit=page.evaluate('window.terrain.getView()')
  assert abs(orbit['bearing']-camera_before['bearing'])>.2,'One finger orbit did not rotate'
  assert orbit['pitch']>camera_before['pitch'],'One finger tilt did not change pitch'
  pan_before=orbit.copy()
  page.evaluate("""() => {
    pointer('pointerdown',3,100,100,true);
    pointer('pointermove',3,130,110,true);
    pointer('pointercancel',3,130,110,true);
  }""")
  pan=page.evaluate('window.terrain.getView()')
  assert pan['center']['x']!=pan_before['center']['x'],'Shift pan did not move center'
  before=pan.copy()
  page.evaluate("""() => {
    pointer('pointerdown',11,100,100);
    pointer('pointerdown',12,220,100);
    pointer('pointermove',11,75,110);
    pointer('pointermove',12,235,110);
  }""")
  pinch=page.evaluate('window.terrain.getView()')
  assert pinch['distance']<before['distance'],'Pinch-out did not zoom closer'
  assert pinch['center']['y']!=before['center']['y'],'Two-finger pan failed'
  page.evaluate("""() => {
    pointer('pointerup',12,235,110);
    pointer('pointermove',11,78,113);
    pointer('pointerup',11,78,113);
    terrain.deactivate();
  }""")
  assert page.evaluate("document.getElementById('c').style.touchAction")=='' ,'2D did not restore normal browser gestures'
  assert not page.evaluate('window.terrain.isActive()'),'3D remained active after exit'
  print(f'Atlas 36.0: {width}px Chromium pointer orbit, pan, pinch and 2D restore PASS')
  context.close()
 browser.close()
