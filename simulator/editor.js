import {DESIGN_GROUPS,DESIGN_DEFAULTS,DESIGN_MODES,FAVORITE_KEYS,captureFavoriteLook,applyFavoriteLook,DITHER_SETTING_KEYS,validateDesign,editModeValue,undoModeValue,designForModeApply,modeSetting,settingHistoryKey,reconcileSavedDesign,randomizeDither,restoreDitherRandomization,loadInitialDesign,cloudSettingKeys,randomizeCloud,restoreCloudRandomization,defaultSettingKeys,restoreCloudDefault} from './design.js';
import {editDitherSpectrum,resolveModeDesign,designSignature,groupSettingKeys,groupSnapshot,restoreGroupSettings,designForGroupApply,DITHER_SPECTRUM_KEYS,ditherEditorKeys,designForDitherEditorApply} from './design.js';
import {createDitherEditor} from './dither-editor.js';
import {EYE_SETTING_KEYS,resetEyes,randomizeEyes} from './design.js';
export async function connectDesignEditor({preview,apply,mode}){
 const editing=location.pathname==='/customize';
 let selectedMode='live';
 const fieldValue=(design,key)=>modeSetting(design,selectedMode,key);
 let applied={...DESIGN_DEFAULTS},draft={...DESIGN_DEFAULTS},history={},revision=0,owner=false,loading=true,saving=false,signature='',saveFeedback=null;
 const accept=settings=>{const next=designSignature(settings);if(next!==signature){signature=next;apply(settings);}};
 const status=document.createElement('p');status.className='editor-status';status.setAttribute('role','status');
 const notify=message=>{status.textContent=message;};
 const button=(label,action,cls='')=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.className=cls;b.addEventListener('click',action);return b;};
 const controls=new Map(),outputs=new Map(),undos=new Map(),applies=new Map(),rows=new Map();
 let accessNotice=null,modeHint=null,randomButton=null,undoRandomButton=null,applyRandomButton=null,randomHistory={},cloudRandomButton=null,cloudUndoButton=null,cloudApplyButton=null,cloudHistory={},defaultDesign=null,defaultButton=null,defaultPending={};
 const labels={live:'LIVE',work:'WORK',surf:'PLAY',sleep:'SLEEP'};
 let favorites={revision:0,items:[]},favoritesLoaded=false,favoritesBusy=false,favoriteList=null,favoriteName=null,favoriteSave=null,favoriteReload=null,undoFavorite=null,favoriteSnapshot=null,activeGroup='colors',targetsTouched=false;
 const favoriteTargets=new Map(),panels=new Map(),tabButtons=new Map();
 let ditherEditor=null,ditherHistory={},pendingDitherStart=null;
 const parameterEditors=new Map();let parameterHistory={},pendingParameterStart={};
 let eyePaused=false,eyeComparing=false,eyePauseButton=null,eyeCompareButton=null;
 const eyePreviewButtons=[];
 const eyePreview=action=>document.dispatchEvent(new CustomEvent('mascot-eye-preview',{detail:{action}}));
 const endEyeCompare=()=>{if(eyeComparing){eyeComparing=false;eyePreview('compare-end');}};
 const parameterStack=id=>parameterHistory[(id==='alarm'?'shared':selectedMode)+'/'+id]||=({undo:[],redo:[]});
 function previewEyes(next,message){
  if(loading||saving)return;endEyeCompare();
  if(designSignature(next)!==designSignature(draft)){
   const stack=parameterStack('face');stack.undo.push(groupSnapshot(draft,selectedMode,'face'));if(stack.undo.length>50)stack.undo.shift();stack.redo=[];delete pendingParameterStart.face;
   for(const key of EYE_SETTING_KEYS)if(fieldValue(next,key)!==fieldValue(draft,key))draft=editModeValue(draft,history,selectedMode,key,fieldValue(next,key));
  }
  preview(draft);refresh();notify(message);
 }
 function changeParameter(group,key,value,newStep=true){
  if(loading||saving)return;try{
   if(group.id==='face')endEyeCompare();
   if(newStep)pendingParameterStart[group.id]={mode:selectedMode,snapshot:groupSnapshot(draft,selectedMode,group.id)};
   const next=editModeValue(draft,pendingParameterStart[group.id]?.mode===selectedMode?history:{},selectedMode,key,value);if(designSignature(next)===designSignature(draft))return;
   if(pendingParameterStart[group.id]?.mode===selectedMode){const stack=parameterStack(group.id);stack.undo.push(pendingParameterStart[group.id].snapshot);if(stack.undo.length>50)stack.undo.shift();stack.redo=[];delete pendingParameterStart[group.id];}
   draft=next;preview(draft);refresh();notify('Previewing '+group.label.toLowerCase()+' changes. Apply this panel to save.');
  }catch(error){notify(error.message);}
 }
 function stepParameter(group,direction){const stack=parameterStack(group.id),snapshot=stack[direction].pop();if(!snapshot)return;if(group.id==='face')endEyeCompare();stack[direction==='undo'?'redo':'undo'].push(groupSnapshot(draft,selectedMode,group.id));draft=restoreGroupSettings(draft,selectedMode,group.id,snapshot);delete pendingParameterStart[group.id];preview(draft);refresh();notify((direction==='undo'?'Previous':'Next')+' '+group.label.toLowerCase()+' settings restored. Apply to save.');}
 const isSpectrumKey=key=>/^ditherPalette(?:Count|\d+)?$/.test(key);
 const fieldState=key=>{const changed=(isSpectrumKey(key)?DITHER_SPECTRUM_KEYS.filter(k=>!['colorMode','ditherPreset'].includes(k)):[key]).some(k=>fieldValue(draft,k)!==fieldValue(applied,k)),feedback=saveFeedback?.mode===selectedMode&&(saveFeedback.key===key||saveFeedback.key==='ditherSpectrum'&&isSpectrumKey(key))?saveFeedback:null;return {canUndo:!!history[settingHistoryKey(selectedMode,key)]?.length,canApply:!loading&&!saving&&owner&&changed,savePhase:feedback?.phase==='saved'&&changed||feedback?.phase==='error'&&!changed?null:feedback?.phase,error:feedback?.error};};
 function undoField(group,key){if(loading||saving||!history[settingHistoryKey(selectedMode,key)]?.length)return;if(group.id==='face')endEyeCompare();if(group.id==='dither')recordDither();else{const stack=parameterStack(group.id);stack.undo.push(groupSnapshot(draft,selectedMode,group.id));if(stack.undo.length>50)stack.undo.shift();stack.redo=[];}draft=undoModeValue(draft,history,selectedMode,key);preview(draft);refresh();notify('Previous parameter value restored. Apply to save.');}
 const applyField=key=>void saveDesign(isSpectrumKey(key)?'ditherSpectrum':key);
 const ditherSnapshot=()=>Object.fromEntries(ditherEditorKeys(selectedMode).map(key=>[key,fieldValue(draft,key)]));
 const restoreDitherEditor=snapshot=>{let next=restoreDitherRandomization(draft,selectedMode,snapshot);if(Object.hasOwn(snapshot,selectedMode+'Background'))next=editModeValue(next,{},selectedMode,selectedMode+'Background',snapshot[selectedMode+'Background']);return next;};
 const ditherStack=()=>ditherHistory[selectedMode]||=( {undo:[],redo:[]} );
 const recordDither=()=>{const stack=ditherStack();stack.undo.push(ditherSnapshot());if(stack.undo.length>50)stack.undo.shift();stack.redo=[];};
 function changeDither(key,value,newStep=true){
  if(loading||saving)return;if(newStep)pendingDitherStart={mode:selectedMode,snapshot:ditherSnapshot()};
  const inputHistory=pendingDitherStart?.mode===selectedMode?history:{};
  let next=isSpectrumKey(key)?editDitherSpectrum(draft,inputHistory,selectedMode,key,value):editModeValue(draft,inputHistory,selectedMode,key,value);
  if(key.startsWith('dither')){next=editModeValue(next,{},selectedMode,'colorMode','dither');if(key!=='ditherPreset')next=editModeValue(next,{},selectedMode,'ditherPreset','custom');}
  if(designSignature(next)===designSignature(draft))return;
  if(pendingDitherStart?.mode===selectedMode){const stack=ditherStack();stack.undo.push(pendingDitherStart.snapshot);if(stack.undo.length>50)stack.undo.shift();stack.redo=[];pendingDitherStart=null;}
  draft=next;preview(draft);refresh();notify('Previewing '+labels[selectedMode]+' Dither changes. Apply Dither look to save.');
 }
 function stepDither(direction){const stack=ditherStack(),previous=stack[direction].pop();if(!previous)return;stack[direction==='undo'?'redo':'undo'].push(ditherSnapshot());draft=restoreDitherEditor(previous);pendingDitherStart=null;preview(draft);refresh();notify((direction==='undo'?'Previous':'Next')+' Dither look restored. Apply Dither look to save.');}
 const targets=()=>[...favoriteTargets].filter(([,input])=>input.checked).map(([value])=>value);
 const showGroup=id=>{if(id!=='face')endEyeCompare();activeGroup=id;for(const [key,panel]of panels)panel.hidden=key!==id;for(const [key,tab]of tabButtons){tab.setAttribute('aria-selected',String(key===id));tab.tabIndex=key===id?0:-1;}refresh();};
 const favoriteSelection=mode=>({mode,keys:[...FAVORITE_KEYS,mode+'Color',mode+'Background',mode+'Eye']});
 function favoriteThumbnail(){try{const source=document.getElementById('pet-canvas'),canvas=document.createElement('canvas');canvas.width=96;canvas.height=118;canvas.getContext('2d').drawImage(source,0,0,96,118);const result=canvas.toDataURL('image/jpeg',.7);return result.length<=20000?result:undefined;}catch{return undefined;}}
 async function loadFavorites(){
  if(!owner)return;favoritesBusy=true;refresh();
  try{const response=await fetch('/api/favorites',{cache:'no-store',signal:AbortSignal.timeout(12000)});const body=await response.json();if(!response.ok)throw Error(body.error||'Could not load favorites');favorites=body;favoritesLoaded=true;renderFavorites();}
  catch(error){notify(error.message);}finally{favoritesBusy=false;refresh();}
 }
 async function writeFavorite(action,payload){
  if(!owner||favoritesBusy||!favoritesLoaded)return;favoritesBusy=true;refresh();
  try{const response=await fetch('/api/favorites',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({revision:favorites.revision,action,...payload}),signal:AbortSignal.timeout(12000)});const body=await response.json();if(!response.ok){if(response.status===409)favoritesLoaded=false;throw Error(body.error||'Could not save favorite');}favorites=body;renderFavorites();notify(action==='save'?'Favorite saved across your devices. Your active pages have not changed.':'Favorite removed. Your active pages have not changed.');if(action==='save')favoriteName.value='';}
  catch(error){notify(error.message);}finally{favoritesBusy=false;refresh();}
 }
 function previewFavorite(item){
  const modes=targets();if(!modes.length){notify('Choose at least one destination page.');return false;}
  favoriteSnapshot={design:structuredClone(draft),modes};draft=applyFavoriteLook(draft,item.look,modes);defaultPending={};preview(draft);refresh();notify('Previewing '+item.name+' on '+modes.map(m=>labels[m]).join(', ')+'. Apply favorite to save, or Undo favorite preview.');return true;
 }
 function renderFavorites(){
  if(!favoriteList)return;favoriteList.replaceChildren();
  if(!favorites.items.length){const empty=document.createElement('p');empty.className='editor-description';empty.textContent='No favorites yet. Generate or edit a look, then save the current preview here.';favoriteList.append(empty);}
  for(const item of favorites.items){
   const card=document.createElement('article');card.className='favorite-card';
   const swatch=document.createElement('div');swatch.className='favorite-swatch';swatch.style.setProperty('--favorite-color',item.look.color);swatch.style.background=item.look.background;swatch.setAttribute('aria-hidden','true');if(item.thumbnail){const image=document.createElement('img');image.src=item.thumbnail;image.alt='';swatch.classList.add('has-thumbnail');swatch.append(image);}
   const info=document.createElement('div'),name=document.createElement('h3'),detail=document.createElement('p');name.textContent=item.name;detail.textContent=labels[item.sourceMode]+' · '+(item.look.values.colorMode==='dither'?'Dither':'Cloud')+' · '+(item.look.values.expression==='auto'?'Activity eyes':item.look.values.expression);info.append(name,detail);
   const actions=document.createElement('div');actions.className='favorite-actions';
   const previewButton=button('Preview',()=>previewFavorite(item));previewButton.dataset.favoriteAction='preview';
   const applyButton=button('Apply favorite',()=>{if(previewFavorite(item))void saveDesign('favoriteLook',{look:item.look,modes:targets()});});applyButton.dataset.ownerAction='true';applyButton.dataset.favoriteAction='apply';
   const remove=button('Remove',()=>{if(confirm('Remove “'+item.name+'” from Favorites? This does not change any page.'))void writeFavorite('remove',{id:item.id});});remove.dataset.ownerAction='true';
   actions.append(previewButton,applyButton,remove);card.append(swatch,info,actions);favoriteList.append(card);
  }refresh();
 }
 const refresh=()=>{
  const dirty=designSignature(draft)!==designSignature(applied);
  if(modeHint)modeHint.textContent='Editing '+labels[selectedMode]+' · Changes preview here. Apply saves across devices.';
  for(const control of eyePreviewButtons)control.disabled=loading||saving;
  if(eyePauseButton){eyePauseButton.textContent=eyePaused?'Play eyes':'Pause eyes';eyePauseButton.setAttribute('aria-pressed',String(eyePaused));}
  if(eyeCompareButton){eyeCompareButton.textContent=eyeComparing?'Back to edited eyes':'Compare approved default';eyeCompareButton.setAttribute('aria-pressed',String(eyeComparing));}
  if(ditherEditor&&activeGroup==='dither')ditherEditor.refresh(resolveModeDesign(draft,selectedMode),{mode:selectedMode,fieldState,canEdit:!loading&&!saving,canUndo:!!ditherStack().undo.length,canRedo:!!ditherStack().redo.length});
  for(const [id,editor]of parameterEditors){if(id!==activeGroup)continue;const stack=parameterStack(id),changed=groupSettingKeys(id,selectedMode).some(key=>fieldValue(draft,key)!==fieldValue(applied,key)),feedback=saveFeedback?.mode===selectedMode&&saveFeedback.key==='group:'+id?saveFeedback:null;editor.refresh(resolveModeDesign(draft,selectedMode),{fieldState,mode:selectedMode,canEdit:!loading&&!saving,canUndo:!!stack.undo.length,canRedo:!!stack.redo.length,canApply:!loading&&!saving&&owner&&changed,savePhase:changed&&feedback?.phase==='saved'?null:feedback?.phase});}
  if(!targetsTouched)for(const [value,input]of favoriteTargets)input.checked=value===selectedMode;
  for(const group of DESIGN_GROUPS)for(const f of group.fields){const input=controls.get(f.key);if(!input)continue;
   if(f.type==='checkbox')input.checked=fieldValue(draft,f.key);else input.value=fieldValue(draft,f.key);
   if(outputs.has(f.key))outputs.get(f.key).textContent=String(fieldValue(draft,f.key));
   const pageColor=/^(live|work|surf|sleep)(Color|Background|Eye)$/.test(f.key);
   rows.get(f.key).hidden=pageColor&&!f.key.startsWith(selectedMode)||(['colorCycle','cycleSeconds','cycle2','cycle3','cycle4','cycle5'].includes(f.key)&&selectedMode!=='live')||(f.key.startsWith('ditherPalette')&&f.key!=='ditherPalette'&&(fieldValue(draft,'ditherPalette')!=='custom'||/^ditherPalette\d+$/.test(f.key)&&Number(f.key.slice(13))>fieldValue(draft,'ditherPaletteCount')));
   input.disabled=loading||(['ditherWaveColor','ditherBackground','ditherColors'].includes(f.key)&&fieldValue(draft,'ditherPalette')!=='none')||(['ditherMouseRadius','ditherMouseStrength','ditherTrail','ditherMouseEffect'].includes(f.key)&&!fieldValue(draft,'ditherMouse'))||(f.key==='ditherSpeed'&&fieldValue(draft,'ditherDisableAnimation'))||(f.key==='ditherBackground'&&fieldValue(draft,'ditherTransparent'));
   input.title=input.disabled&&!loading?'Controlled by the palette or interaction options above.':'';
   undos.get(f.key).disabled=loading||saving||!history[settingHistoryKey(selectedMode,f.key)]?.length;
   applies.get(f.key).disabled=loading||saving||!owner||fieldValue(draft,f.key)===fieldValue(applied,f.key);
   applies.get(f.key).title=loading?'Loading your design':!owner?'Sign in with the owner account to save':saving?'Saving…':fieldValue(draft,f.key)===fieldValue(applied,f.key)?'Change this setting to activate Apply':'Save this setting across devices';
  }
  if(saveButton){saveButton.disabled=loading||saving||!owner||!dirty;saveButton.textContent=saving?'Saving…':'Save all changes';}
  if(saveFooter)saveFooter.hidden=!dirty&&!saving;
  if(discardButton)discardButton.disabled=loading||saving||!dirty;
  if(favoriteSave)favoriteSave.disabled=loading||saving||favoritesBusy||!owner||!favoritesLoaded||!favoriteName.value.trim()||favorites.items.length>=30;
  if(favoriteReload)favoriteReload.disabled=loading||favoritesBusy||!owner;
  if(undoFavorite)undoFavorite.disabled=loading||saving||!favoriteSnapshot;
  if(favoriteList)for(const control of favoriteList.querySelectorAll('button')){control.disabled=loading||saving||favoritesBusy||!favoritesLoaded||(control.dataset.ownerAction==='true'&&!owner)||(control.dataset.favoriteAction&&!targets().length);if(control.dataset.favoriteAction)control.title=targets().length?'':'Choose at least one destination page above';}
  for(const input of favoriteTargets.values())input.disabled=loading||saving;
  if(randomButton)randomButton.disabled=loading||saving;
  if(cloudRandomButton)cloudRandomButton.disabled=loading||saving;
  if(cloudUndoButton)cloudUndoButton.disabled=loading||saving||!cloudHistory[selectedMode]?.length;
  if(cloudApplyButton)cloudApplyButton.disabled=loading||saving||!owner||!(defaultPending[selectedMode]?defaultSettingKeys(selectedMode):cloudSettingKeys(selectedMode)).some(key=>fieldValue(draft,key)!==fieldValue(applied,key));
  if(cloudApplyButton)cloudApplyButton.textContent=defaultPending[selectedMode]?'Apply default':'Apply Cloud look';
  if(defaultButton)defaultButton.disabled=loading||saving||!defaultDesign;
  if(undoRandomButton)undoRandomButton.disabled=loading||saving||!randomHistory[selectedMode]?.length;
  if(applyRandomButton)applyRandomButton.disabled=loading||saving||!owner||!ditherEditorKeys(selectedMode).some(key=>fieldValue(draft,key)!==fieldValue(applied,key));
 };
 let saveButton=null,saveFooter=null,discardButton=null;
 async function saveDesign(key=null,favorite=null){
  if(saving||!owner||loading)return;
  const groupId=key?.startsWith('group:')?key.slice(6):null;
  const submitted=favorite?applyFavoriteLook(applied,favorite.look,favorite.modes):groupId?designForGroupApply(applied,draft,selectedMode,groupId):key==='ditherLook'?designForDitherEditorApply(applied,draft,selectedMode):designForModeApply(applied,draft,selectedMode,key),draftAtSubmit=structuredClone(draft);
  const selection=key===null||favorite?null:{mode:selectedMode,key,keys:groupId?groupSettingKeys(groupId,selectedMode):key==='ditherLook'?ditherEditorKeys(selectedMode):key==='ditherSpectrum'?DITHER_SPECTRUM_KEYS:key==='modeDefault'?defaultSettingKeys(selectedMode):key==='cloudLook'?cloudSettingKeys(selectedMode):[...(key.startsWith('dither')&&fieldValue(draft,'colorMode')==='dither'?['colorMode','ditherPreset']:[]),...(key==='ditherPreset'?DITHER_SETTING_KEYS:[key])]};
  saving=true;saveFeedback={mode:selectedMode,key,phase:'saving'};refresh();notify('Saving '+(key?'this setting':'your design')+'…');
  try{
   const response=await fetch('/api/design',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({settings:submitted,revision}),signal:AbortSignal.timeout(12000)});
   const body=await response.json();if(!response.ok)throw Error(body.error||'Could not save. Your preview is still here.');
   revision=body.revision;applied=validateDesign(body.settings);if(key==='modeDefault')defaultPending[selection.mode]=false;else if(key===null)defaultPending={};
   // Keep unrelated drafts and edits made while the save was in flight.
   if(favorite){for(const target of favorite.modes)draft=reconcileSavedDesign(applied,draftAtSubmit,draft,favoriteSelection(target));favoriteSnapshot=null;}
   else draft=reconcileSavedDesign(applied,draftAtSubmit,draft,selection);
   try{localStorage.setItem('mascot-confirmed-design',JSON.stringify({settings:applied,revision}));}catch{}
   preview(draft);
   saveFeedback={...saveFeedback,phase:'saved'};
   const pending=designSignature(draft)!==designSignature(applied);
   notify(key?(pending?'Setting saved across devices. Other preview changes are still pending.':'Setting saved across devices.'):pending?'Submitted changes saved. Newer preview changes are still pending.':'Saved. Your mascot will use this design on every device.');
  }catch(error){saveFeedback={...saveFeedback,phase:'error',error:error.message};notify(error.message);}finally{saving=false;refresh();}
 }
 if(editing){
  document.documentElement.classList.add('customizing');
  const shell=document.createElement('section');shell.className='editor-shell';shell.setAttribute('aria-label','Mascot design editor');
  const header=document.createElement('header');header.className='editor-heading';
  const title=document.createElement('h1');title.textContent='Mascot Studio';header.append(title);
  const copy=document.createElement('p');copy.textContent='Choose a page. Create a look. Keep your favorites.';header.append(copy);
  const close=document.createElement('a');close.href='/app';close.target='_blank';close.rel='noopener';close.textContent='Open Mascot ↗';header.append(close);shell.append(header);
  accessNotice=document.createElement('div');accessNotice.className='editor-access';accessNotice.setAttribute('role','status');accessNotice.textContent='Connecting to your saved design…';header.append(accessNotice);
  const modes=document.createElement('div');modes.className='editor-mode-picker';modes.setAttribute('aria-label','Page to edit');
  for(const [value,label]of Object.entries(labels)){const b=button(label,()=>{if(loading)return;endEyeCompare();selectedMode=value;mode(value);preview(draft);refresh();modes.querySelectorAll('button').forEach(b=>{b.classList.toggle('selected',b.textContent===label);b.setAttribute('aria-pressed',String(b.textContent===label));});});b.setAttribute('aria-pressed',String(value==='live'));modes.append(b);}
  modes.firstChild.classList.add('selected');shell.append(modes);
  document.addEventListener('mascot-mode-change',event=>{if(!DESIGN_MODES.includes(event.detail?.mode))return;endEyeCompare();selectedMode=event.detail.mode;modes.querySelectorAll('button').forEach(b=>{b.classList.toggle('selected',b.textContent===labels[selectedMode]);b.setAttribute('aria-pressed',String(b.textContent===labels[selectedMode]));});refresh();});
  modeHint=document.createElement('p');modeHint.className='editor-description';shell.append(modeHint);
  const tabs=document.createElement('nav');tabs.className='editor-tabs';tabs.setAttribute('aria-label','Customization features');tabs.setAttribute('role','tablist');shell.append(tabs);
  tabs.addEventListener('keydown',event=>{if(!['ArrowRight','ArrowLeft','Home','End'].includes(event.key))return;const buttons=[...tabButtons.values()],index=buttons.indexOf(document.activeElement);if(index<0)return;event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+(event.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;buttons[next].click();buttons[next].focus();});
  const registerTab=(id,label,section)=>{panels.set(id,section);section.setAttribute('role','tabpanel');section.setAttribute('aria-labelledby','tab-'+id);const tab=button(label,()=>showGroup(id));tab.id='tab-'+id;tab.setAttribute('role','tab');tab.setAttribute('aria-controls',section.id);tab.setAttribute('aria-selected',String(id==='colors'));tab.tabIndex=id==='colors'?0:-1;tabButtons.set(id,tab);tabs.append(tab);};
  for(const group of [...DESIGN_GROUPS].sort((a,b)=>(a.id==='alarm'?1:0)-(b.id==='alarm'?1:0))){
   const section=document.createElement('section');section.className='editor-group';section.id='edit-'+group.id;section.hidden=group.id!=='colors';
   registerTab(group.id,group.label,section);
   const heading=document.createElement('h2');heading.textContent=group.label;const description=document.createElement('p');description.className='editor-description';description.textContent=group.description;section.append(heading,description);
   if(group.id==='colors'){
    const actions=document.createElement('div');actions.className='dither-random-actions';
    cloudRandomButton=button('Randomize Cloud',()=>{const result=randomizeCloud(draft,selectedMode);const stack=cloudHistory[selectedMode]||=[];stack.push(result.snapshot);if(stack.length>50)stack.shift();draft=result.draft;defaultPending[selectedMode]=false;preview(draft);refresh();notify('Random Cloud look previewed for this mode. Apply Cloud look to save.');});
    cloudUndoButton=button('Undo Cloud randomize',()=>{const previous=cloudHistory[selectedMode]?.pop();if(previous){draft=restoreCloudRandomization(draft,selectedMode,previous);preview(draft);refresh();notify('Previous Cloud look restored. Apply to save.');}});
    cloudApplyButton=button('Apply Cloud look',()=>void saveDesign(defaultPending[selectedMode]?'modeDefault':'cloudLook'));
    defaultButton=button('Return to Default',()=>{if(!defaultDesign)return;draft=restoreCloudDefault(draft,selectedMode,defaultDesign);defaultPending[selectedMode]=true;preview(draft);refresh();notify('Your saved Cloud Original design is previewed for this mode. Apply default to save, or Discard changes to cancel.');});
    actions.append(cloudRandomButton,cloudUndoButton,cloudApplyButton,defaultButton,button('Save to Favorites',()=>{showGroup('favorites');favoriteName.focus();}));section.append(actions);
   }
   if(group.id==='dither'){
    const actions=document.createElement('div');actions.className='dither-random-actions';
    randomButton=button('Randomize Dither',()=>{recordDither();const result=randomizeDither(draft,selectedMode);const stack=randomHistory[selectedMode]||=[];stack.push(result.snapshot);if(stack.length>50)stack.shift();draft=result.draft;preview(draft);refresh();notify('Random Dither look previewed for this mode. Apply Dither look to save.');});
    undoRandomButton=button('Undo randomize',()=>{const previous=randomHistory[selectedMode]?.pop();if(previous){draft=restoreDitherRandomization(draft,selectedMode,previous);preview(draft);refresh();notify('Previous Dither look restored. Apply to save.');}});
    applyRandomButton=button('Apply Dither look',()=>void saveDesign('ditherLook'));
    actions.append(randomButton,applyRandomButton,button('Save to Favorites',()=>{showGroup('favorites');favoriteName.focus();}));section.append(actions);
    description.textContent='App background colors the page. Effect background and the palette color the mascot. Apply saves this page’s complete look.';
    ditherEditor=createDitherEditor({edit:changeDither,undoField:key=>undoField(group,key),applyField,undo:()=>stepDither('undo'),redo:()=>stepDither('redo'),reset:()=>{if(loading||saving)return;recordDither();draft=restoreDitherEditor(Object.fromEntries(ditherEditorKeys(selectedMode).map(key=>[key,key==='colorMode'?'dither':DESIGN_DEFAULTS[key]])));preview(draft);refresh();notify('Default Dither settings previewed. Undo restores your previous look.');}});
    section.append(ditherEditor.element);shell.append(section);continue;
   }
   const resetParameters=()=>{if(loading||saving)return;if(group.id==='face')endEyeCompare();const stack=parameterStack(group.id);stack.undo.push(groupSnapshot(draft,selectedMode,group.id));if(stack.undo.length>50)stack.undo.shift();stack.redo=[];delete pendingParameterStart[group.id];draft=restoreGroupSettings(draft,selectedMode,group.id,groupSnapshot(DESIGN_DEFAULTS,selectedMode,group.id));preview(draft);refresh();notify(group.id==='face'?'Approved default eyes previewed. Apply Face settings to save; Undo restores your edited eyes.':group.label+' defaults previewed for this page. Undo restores your previous settings.');};
   if(group.id==='face'){
    const eyeSection=document.createElement('section');eyeSection.className='editor-eye-preview';eyeSection.setAttribute('aria-labelledby','editor-eyes-heading');
    const eyeHeading=document.createElement('h3');eyeHeading.id='editor-eyes-heading';eyeHeading.textContent='Eyes';
    const eyeNote=document.createElement('p');eyeNote.className='editor-description';eyeNote.textContent='Shared eye style across all pages. Drag Eye Style Generator to explore; 0 restores the approved geometry. Preview controls do not change your saved design.';
    const actions=document.createElement('div');actions.className='editor-eye-actions';
    const randomEyes=button('Randomize Eyes',()=>{if(loading||saving)return;let next=randomizeEyes(draft);if(next.eyeStyle===fieldValue(draft,'eyeStyle'))next=editModeValue(next,{},selectedMode,'eyeStyle',(next.eyeStyle+11)%101);previewEyes(next,'New eyes previewed across all pages. Apply Face settings to save.');});
    const resetEyeButton=button('Reset Eyes',()=>previewEyes(resetEyes(draft),'Approved default eyes previewed. Apply Face settings to save; Undo restores your edited eyes.'));
    eyePauseButton=button('Pause eyes',()=>{eyePaused=!eyePaused;eyePreview(eyePaused?'pause':'play');refresh();});eyePauseButton.setAttribute('aria-pressed','false');
    const blink=button('Blink',()=>eyePreview('blink'));
    eyeCompareButton=button('Compare approved default',()=>{eyeComparing=!eyeComparing;eyePreview(eyeComparing?'compare-start':'compare-end');refresh();});eyeCompareButton.setAttribute('aria-pressed','false');
    eyePreviewButtons.push(randomEyes,resetEyeButton,eyePauseButton,blink,eyeCompareButton);actions.append(...eyePreviewButtons);eyeSection.append(eyeHeading,eyeNote,actions);section.append(eyeSection);
   }
   const parameterEditor=createDitherEditor({group:{...group,fields:group.fields.filter(field=>!field.hidden)},edit:(key,value,newStep)=>changeParameter(group,key,value,newStep),undoField:key=>undoField(group,key),applyField,undo:()=>stepParameter(group,'undo'),redo:()=>stepParameter(group,'redo'),apply:()=>void saveDesign('group:'+group.id),reset:resetParameters});
   parameterEditors.set(group.id,parameterEditor);section.append(parameterEditor.element);shell.append(section);continue;

  }
  const favoritePanel=document.createElement('section');favoritePanel.className='editor-group';favoritePanel.id='edit-favorites';favoritePanel.hidden=true;registerTab('favorites','Favorites',favoritePanel);
  const favoriteHeading=document.createElement('h2');favoriteHeading.textContent='Your favorite looks';
  const favoriteCopy=document.createElement('p');favoriteCopy.className='editor-description';favoriteCopy.textContent='Save the current page’s preview, including generated looks. Reuse it on any page. Favorites sync with your owner account.';
  const favoriteForm=document.createElement('form');favoriteForm.className='favorite-save-form';
  const nameLabel=document.createElement('label');nameLabel.htmlFor='favorite-name';nameLabel.textContent='Name this look';favoriteName=document.createElement('input');favoriteName.id='favorite-name';favoriteName.type='text';favoriteName.maxLength=60;favoriteName.placeholder='e.g. Blue Cloud';favoriteName.addEventListener('input',refresh);
  favoriteSave=button('Save current look',()=>{});favoriteSave.type='submit';favoriteForm.append(nameLabel,favoriteName,favoriteSave);favoriteForm.addEventListener('submit',event=>{event.preventDefault();if(favoriteSave.disabled)return;void writeFavorite('save',{favorite:{id:crypto.randomUUID(),name:favoriteName.value.trim(),sourceMode:selectedMode,look:captureFavoriteLook(draft,selectedMode),thumbnail:favoriteThumbnail()}});});
  const targetBox=document.createElement('fieldset');targetBox.className='favorite-targets';const legend=document.createElement('legend');legend.textContent='Apply to these pages';targetBox.append(legend);
  for(const [value,label]of Object.entries(labels)){const wrap=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.value=value;input.checked=value==='live';input.addEventListener('change',()=>{targetsTouched=true;refresh();});favoriteTargets.set(value,input);wrap.append(input,document.createTextNode(label));targetBox.append(wrap);}
  const note=document.createElement('p');note.className='editor-description';note.textContent='Copies the complete look to checked pages. Alarm, sensor and STUDIO settings stay as they are.';
  const favoriteTools=document.createElement('div');favoriteTools.className='favorite-actions';favoriteReload=button('Reload favorites',()=>void loadFavorites());undoFavorite=button('Undo favorite preview',()=>{if(!favoriteSnapshot)return;for(const target of favoriteSnapshot.modes)draft=applyFavoriteLook(draft,captureFavoriteLook(favoriteSnapshot.design,target),[target]);favoriteSnapshot=null;preview(draft);refresh();notify('Favorite preview undone. Apply to save any remaining edits.');});favoriteTools.append(favoriteReload,undoFavorite);
  favoriteList=document.createElement('div');favoriteList.className='favorite-list';favoriteList.textContent='Sign in as owner to load and save your favorites.';favoritePanel.append(favoriteHeading,favoriteCopy,favoriteForm,targetBox,note,favoriteTools,favoriteList);shell.append(favoritePanel);
  const footer=document.createElement('footer');footer.className='editor-actions';saveFooter=footer;
  const discard=button('Discard previews',()=>{if(loading||saving)return;endEyeCompare();draft=structuredClone(applied);history={};randomHistory={};cloudHistory={};defaultPending={};favoriteSnapshot=null;ditherHistory={};pendingDitherStart=null;parameterHistory={};pendingParameterStart={};saveFeedback=null;ditherEditor?.closePicker();for(const editor of parameterEditors.values())editor.closePicker();preview(draft);refresh();notify('Back to your saved design.');});
  discardButton=discard;
  saveButton=button('Save all changes',()=>void saveDesign(),'editor-apply');footer.append(discard,saveButton);header.append(status);shell.append(footer);document.body.append(shell);
  window.addEventListener('beforeunload',event=>{if(!loading&&designSignature(draft)!==designSignature(applied)){event.preventDefault();event.returnValue='';}});
  notify('Loading your saved design…');refresh();
  void fetch('/character/cloud-default-design.json',{cache:'no-store'}).then(response=>{if(!response.ok)throw Error('Restore point unavailable');return response.json();}).then(data=>{defaultDesign=validateDesign(data.settings);refresh();}).catch(()=>{if(defaultButton)defaultButton.title='Saved restore point could not load. Reload to try again.';});
 }
 const refreshSaved=async()=>{
  const response=await fetch('/api/design',{cache:'no-store',signal:AbortSignal.timeout(12000)});if(!response.ok)throw Error('Cloud design unavailable');const data=await response.json();applied=validateDesign(data.settings);revision=data.revision;try{localStorage.setItem('mascot-confirmed-design',JSON.stringify({settings:applied,revision}));}catch{}return applied;
 };
 try{const initial=await loadInitialDesign(refreshSaved,()=>{const cached=JSON.parse(localStorage.getItem('mascot-confirmed-design'));if(!cached?.settings)throw Error('No saved design');revision=cached.revision||0;return cached.settings;});applied=initial.settings;accept(applied);if(initial.source==='cache'&&editing)notify('Showing your last saved design. Cloud is unavailable.');}catch(error){notify(error.message);if(accessNotice)accessNotice.textContent=error.message;return {loaded:false,error:error.message};}
 draft={...applied};loading=false;
 if(editing){
  try{const response=await fetch('/api/session',{cache:'no-store'});const session=await response.json();owner=session.owner===true;
   if(owner){accessNotice.textContent='Owner signed in · Design and Favorites sync enabled';notify('Choose a page above. Changes preview instantly; Apply saves them.');void loadFavorites();}
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
