import {DESIGN_GROUPS,DESIGN_DEFAULTS,DITHER_SETTING_KEYS,validateDesign,editModeValue,undoModeValue,designForModeApply,modeSetting,settingHistoryKey,reconcileSavedDesign,randomizeDither,restoreDitherRandomization,loadInitialDesign} from './design.js';
export async function connectDesignEditor({preview,apply,mode}){
 const editing=location.pathname==='/customize';
 let selectedMode='live';
 const fieldValue=(design,key)=>modeSetting(design,selectedMode,key);
 let applied={...DESIGN_DEFAULTS},draft={...DESIGN_DEFAULTS},history={},revision=0,owner=false,loading=true,saving=false,signature='';
 const accept=settings=>{const next=JSON.stringify(settings);if(next!==signature){signature=next;apply(settings);}};
 const status=document.createElement('p');status.className='editor-status';status.setAttribute('role','status');
 const notify=message=>{status.textContent=message;};
 const button=(label,action,cls='')=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.className=cls;b.addEventListener('click',action);return b;};
 const controls=new Map(),outputs=new Map(),undos=new Map(),applies=new Map(),rows=new Map();
 let accessNotice=null,modeHint=null,randomButton=null,undoRandomButton=null,applyRandomButton=null,randomHistory={};
 const refresh=()=>{
  if(modeHint)modeHint.textContent=({live:'LIVE',work:'WORK',surf:'PLAY',sleep:'SLEEP'})[selectedMode]+' settings · Eyes, finish, shape and motion save separately for each mode.';
  for(const group of DESIGN_GROUPS)for(const f of group.fields){const input=controls.get(f.key);if(!input)continue;
   if(f.type==='checkbox')input.checked=fieldValue(draft,f.key);else input.value=fieldValue(draft,f.key);
   if(outputs.has(f.key))outputs.get(f.key).textContent=String(fieldValue(draft,f.key));
   if(f.key.startsWith('ditherPalette')&&f.key!=='ditherPalette')rows.get(f.key).hidden=fieldValue(draft,'ditherPalette')!=='custom'||/^ditherPalette\d+$/.test(f.key)&&Number(f.key.slice(13))>fieldValue(draft,'ditherPaletteCount');
   input.disabled=(['ditherWaveColor','ditherBackground','ditherColors'].includes(f.key)&&fieldValue(draft,'ditherPalette')!=='none')||(['ditherMouseRadius','ditherMouseStrength','ditherTrail','ditherMouseEffect'].includes(f.key)&&!fieldValue(draft,'ditherMouse'))||(f.key==='ditherSpeed'&&fieldValue(draft,'ditherDisableAnimation'))||(f.key==='ditherBackground'&&fieldValue(draft,'ditherTransparent'));
   undos.get(f.key).disabled=!history[settingHistoryKey(selectedMode,f.key)]?.length;
   applies.get(f.key).disabled=loading||saving||!owner||fieldValue(draft,f.key)===fieldValue(applied,f.key);
   applies.get(f.key).title=loading?'Loading your design':!owner?'Sign in with the owner account to save':saving?'Saving…':fieldValue(draft,f.key)===fieldValue(applied,f.key)?'Change this setting to activate Apply':'Save this setting across devices';
  }
  if(saveButton)saveButton.disabled=loading||saving||!owner;
  if(randomButton)randomButton.disabled=loading||saving;
  if(undoRandomButton)undoRandomButton.disabled=loading||saving||!randomHistory[selectedMode]?.length;
  if(applyRandomButton)applyRandomButton.disabled=loading||saving||!owner||!['colorMode',...DITHER_SETTING_KEYS].some(key=>fieldValue(draft,key)!==fieldValue(applied,key));
 };
 let saveButton=null;
 async function saveDesign(key=null){
  if(saving||!owner||loading)return;
  const submitted=designForModeApply(applied,draft,selectedMode,key),draftAtSubmit=structuredClone(draft);
  const selection=key===null?null:{mode:selectedMode,key,keys:[...(key.startsWith('dither')&&fieldValue(draft,'colorMode')==='dither'?['colorMode']:[]),...(key==='ditherPreset'?DITHER_SETTING_KEYS:[key])]};
  saving=true;refresh();notify('Saving '+(key?'this setting':'your design')+'…');
  try{
   const response=await fetch('/api/design',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({settings:submitted,revision})});
   const body=await response.json();if(!response.ok)throw Error(body.error||'Could not save. Your preview is still here.');
   revision=body.revision;applied=validateDesign(body.settings);
   // Keep unrelated drafts and edits made while the save was in flight.
   draft=reconcileSavedDesign(applied,draftAtSubmit,draft,selection);
   try{localStorage.setItem('mascot-confirmed-design',JSON.stringify({settings:applied,revision}));}catch{}
   preview(draft);
   const pending=JSON.stringify(draft)!==JSON.stringify(applied);
   notify(key?(pending?'Setting saved across devices. Other preview changes are still pending.':'Setting saved across devices.'):pending?'Submitted changes saved. Newer preview changes are still pending.':'Saved. Your mascot will use this design on every device.');
  }catch(error){notify(error.message);}finally{saving=false;refresh();}
 }
 if(editing){
  document.documentElement.classList.add('customizing');
  const shell=document.createElement('section');shell.className='editor-shell';shell.setAttribute('aria-label','Mascot design editor');
  const header=document.createElement('header');header.className='editor-heading';
  const title=document.createElement('h1');title.textContent='Make it yours.';header.append(title);
  const copy=document.createElement('p');copy.textContent='A little companion. Your personality.';header.append(copy);
  const close=document.createElement('a');close.href='/app';close.textContent='Open Mascot ↗';header.append(close);shell.append(header);
  accessNotice=document.createElement('div');accessNotice.className='editor-access';accessNotice.setAttribute('role','status');accessNotice.textContent='Connecting to your saved design…';header.append(accessNotice);
  const modes=document.createElement('div');modes.className='editor-mode-picker';
  for(const [value,label]of [['live','LIVE'],['work','WORK'],['surf','PLAY'],['sleep','SLEEP']])modes.append(button(label,()=>{if(loading)return;selectedMode=value;mode(value);preview(draft);refresh();modes.querySelectorAll('button').forEach(b=>b.classList.toggle('selected',b.textContent===label));}));
  modes.firstChild.classList.add('selected');shell.append(modes);
  document.addEventListener('mascot-mode-change',event=>{if(!['live','work','surf','sleep'].includes(event.detail?.mode))return;selectedMode=event.detail.mode;const label=({live:'LIVE',work:'WORK',surf:'PLAY',sleep:'SLEEP'})[selectedMode];modes.querySelectorAll('button').forEach(b=>b.classList.toggle('selected',b.textContent===label));refresh();});
  modeHint=document.createElement('p');modeHint.className='editor-description';shell.append(modeHint);
  const tabs=document.createElement('nav');tabs.className='editor-tabs';tabs.setAttribute('aria-label','Customization features');shell.append(tabs);
  for(const group of DESIGN_GROUPS){
   const section=document.createElement('section');section.className='editor-group';section.id='edit-'+group.id;section.hidden=group.id!=='colors';
   const tab=button(group.label,()=>{shell.querySelectorAll('.editor-group').forEach(s=>s.hidden=s!==section);tabs.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',b===tab));});tab.setAttribute('aria-pressed',group.id==='colors');tabs.append(tab);
   const heading=document.createElement('h2');heading.textContent=group.label;const description=document.createElement('p');description.className='editor-description';description.textContent=group.description;section.append(heading,description);
   if(group.id==='dither'){
    const actions=document.createElement('div');actions.className='dither-random-actions';
    randomButton=button('Randomize Dither',()=>{const result=randomizeDither(draft,selectedMode);const stack=randomHistory[selectedMode]||=[];stack.push(result.snapshot);if(stack.length>50)stack.shift();draft=result.draft;preview(draft);refresh();notify('Random Dither look previewed for this mode. Apply Dither look to save.');});
    undoRandomButton=button('Undo randomize',()=>{const previous=randomHistory[selectedMode]?.pop();if(previous){draft=restoreDitherRandomization(draft,selectedMode,previous);preview(draft);refresh();notify('Previous Dither look restored. Apply to save.');}});
    applyRandomButton=button('Apply Dither look',()=>void saveDesign('ditherPreset'));
    actions.append(randomButton,undoRandomButton,applyRandomButton);section.append(actions);
   }
   for(const f of group.fields){
    const row=document.createElement('div');row.className='editor-setting';const label=document.createElement('label');label.htmlFor='setting-'+f.key;label.textContent=f.label;
    const input=document.createElement(f.type==='select'?'select':'input');input.id='setting-'+f.key;if(f.type!=='select')input.type=f.type;input.setAttribute('aria-label',f.label);
    if(f.type==='select')for(const value of f.options){const o=document.createElement('option');o.value=value;o.textContent=f.key==='colorMode'?({cloud:'Cloud · Original',dither:'Dither'})[value]:f.key==='ditherPattern'?({bayer:'Bayer 8×8',bayer4:'Bayer 4×4',bayer2:'Bayer 2×2',halftone:'Halftone',lines:'Lines',crosshatch:'Crosshatch',noise:'Noise',none:'None'})[value]:value==='gameboy'?'Game Boy':value.startsWith('touch-')?['Orbit','Daydream','Glee','Lilt','Prism','Ripple','Intent','Sideglance','Soft wink','Starlit'][Number(value.slice(6))]:value==='auto'?'Follow activity':value[0].toUpperCase()+value.slice(1);input.append(o);}
    if(f.type==='range'){input.min=f.min;input.max=f.max;input.step=f.step;const output=document.createElement('output');output.htmlFor=input.id;outputs.set(f.key,output);label.append(output);}
    if(f.type==='text')input.maxLength=12;
    const undo=button('Undo',()=>{draft=undoModeValue(draft,history,selectedMode,f.key);preview(draft);refresh();notify('Previous '+f.label.toLowerCase()+' restored. Apply to save.');},'setting-undo');undo.setAttribute('aria-label','Undo '+f.label);undos.set(f.key,undo);
    const applyOne=button('Apply',()=>void saveDesign(f.key),'setting-apply');applyOne.setAttribute('aria-label','Apply '+f.label);applies.set(f.key,applyOne);
    const actions=document.createElement('div');actions.className='setting-actions';actions.append(undo,applyOne);
    let dragging=false,recorded=false;
    input.addEventListener('pointerdown',()=>{dragging=true;recorded=false;});
    for(const event of ['pointerup','pointercancel','change','blur'])input.addEventListener(event,()=>{dragging=false;});
    const changedInput=()=>{if(loading)return;try{const value=f.type==='range'?Number(input.value):f.type==='checkbox'?input.checked:input.value;const changed=value!==fieldValue(draft,f.key);if(!changed)return;draft=editModeValue(draft,dragging&&recorded?{}:history,selectedMode,f.key,value);if(dragging)recorded=true;preview(draft);refresh();notify('Previewing changes. Apply to save across devices.');}catch(error){notify(error.message);}};
    input.addEventListener('input',changedInput);
    input.addEventListener('change',changedInput);
    controls.set(f.key,input);rows.set(f.key,row);row.append(label,input,actions);section.append(row);
   }shell.append(section);
  }
  const footer=document.createElement('footer');footer.className='editor-actions';
  const discard=button('Discard changes',()=>{if(loading)return;draft={...applied};history={};randomHistory={};preview(draft);refresh();notify('Back to your saved design.');});
  saveButton=button('Apply & save',()=>void saveDesign(),'editor-apply');footer.append(discard,saveButton);shell.append(status,footer);document.body.append(shell);
  notify('Loading your saved design…');refresh();
 }
 const refreshSaved=async()=>{
  const response=await fetch('/api/design',{cache:'no-store',signal:AbortSignal.timeout(12000)});if(!response.ok)throw Error('Cloud design unavailable');const data=await response.json();applied=validateDesign(data.settings);revision=data.revision;try{localStorage.setItem('mascot-confirmed-design',JSON.stringify({settings:applied,revision}));}catch{}return applied;
 };
 try{const initial=await loadInitialDesign(refreshSaved,()=>{const cached=JSON.parse(localStorage.getItem('mascot-confirmed-design'));if(!cached?.settings)throw Error('No saved design');revision=cached.revision||0;return cached.settings;});applied=initial.settings;accept(applied);if(initial.source==='cache'&&editing)notify('Showing your last saved design. Cloud is unavailable.');}catch(error){notify(error.message);if(accessNotice)accessNotice.textContent=error.message;return {loaded:false,error:error.message};}
 draft={...applied};loading=false;
 if(editing){
  try{const response=await fetch('/api/session',{cache:'no-store'});const session=await response.json();owner=session.owner===true;
   if(owner){accessNotice.textContent='Owner signed in · Saving enabled';notify('Owner signed in. Changes preview instantly; Apply saves them.');}
   else{const link=document.createElement('a');link.href='/signin-with-chatgpt?return_to=%2Fcustomize';link.target='_top';link.textContent=session.signedIn?'Sign in with your owner account':'Sign in to activate Apply';link.className='editor-signin';accessNotice.textContent='Sign in to save your changes across devices.';accessNotice.append(link);notify('Explore and preview. Only the owner can save.');}
  }catch{accessNotice.textContent='Saving is unavailable. Open the synced editor and sign in.';const link=document.createElement('a');link.href='https://studio-mascot.jesse-ech.chatgpt.site/customize';link.textContent='Open synced editor';accessNotice.append(link);notify('Preview mode. Open the live site and sign in to save.');}refresh();
 }else{
  // Refresh on return to the app, without overwriting an unsaved editor draft.
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)void refreshSaved().then(accept).catch(()=>{});});
  const poll=()=>{if(!document.hidden)void refreshSaved().then(accept).catch(()=>{});};
  let timer=setInterval(poll,20000);
  window.addEventListener('pagehide',()=>clearInterval(timer));
  window.addEventListener('pageshow',event=>{if(event.persisted){clearInterval(timer);timer=setInterval(poll,20000);poll();}});
 }
 return {loaded:true,get settings(){return draft;}};
}
