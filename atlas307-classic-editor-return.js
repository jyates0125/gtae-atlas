/* Atlas 30.7 · safe return from the seven private classic map notebooks.
   Reuse native markerCancel; never touch source coordinates, saves or history. */
(()=>{'use strict';
function init(){
 const editor=document.getElementById('classicEditor'),cancel=document.getElementById('markerCancel');
 const map=document.getElementById('classicViewport'),name=document.getElementById('markerName');
 const cat=document.getElementById('markerCategory'),note=document.getElementById('markerNote');
 const add=document.getElementById('classicAddPin'),status=document.getElementById('classicMessage');
 if(!editor||!cancel||!map||!name||!cat||!note||!add||document.getElementById('j307-back-map'))return;
 const bar=document.createElement('div');bar.className='j307-editor-toolbar';
 const label=document.createElement('strong');label.textContent='PERSONAL MARKER EDITOR';
 const back=document.createElement('button');back.type='button';back.id='j307-back-map';
 back.textContent='← Back to map';back.setAttribute('aria-label','Return to classic map; confirm if changes are unsaved');
 bar.append(label,back);editor.prepend(bar);
 let baseline=null;
 const fingerprint=()=>JSON.stringify([name.value,cat.value,note.value]);
 const capture=()=>{if(!editor.hidden)baseline=fingerprint()};
 const sync=()=>{
  back.hidden=editor.hidden;
  if(editor.hidden)baseline=null;
  else if(baseline===null)capture();
 };
 new MutationObserver(sync).observe(editor,{attributes:true,attributeFilter:['hidden']});
 name.addEventListener('focus',capture);
 sync();
 const finish=()=>{
  cancel.click();
  if(!editor.hidden)return;
  map.scrollIntoView({block:'center',behavior:'instant'});
  map.focus({preventScroll:true});
  if(status)status.textContent='Back on this map. Saved personal pins and progress are unchanged.';
 };
 function exit(){
  if(editor.hidden)return;
  if(baseline!==null&&fingerprint()!==baseline){
   if(!confirm('Discard unsaved changes to this personal marker? Your saved pins and progress will stay unchanged.')){
    name.focus({preventScroll:true});
    if(status)status.textContent='Unsaved changes kept open.';
    return;
   }
  }
  finish();
 }
 back.addEventListener('click',exit);
 document.addEventListener('keydown',event=>{
  if(event.key!=='Escape'||event.isComposing||event.defaultPrevented||
     document.querySelector('dialog[open], [role="dialog"][aria-modal="true"]'))return;
  if(!editor.hidden){event.preventDefault();exit()}
  else if(add.getAttribute('aria-pressed')==='true'){
   event.preventDefault();add.click();map.focus({preventScroll:true});
   if(status)status.textContent='Marker placement canceled. Map view unchanged.';
  }
 });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();