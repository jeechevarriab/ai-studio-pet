import {DESIGN_GROUPS,DESIGN_DEFAULTS,DESIGN_MODES,FAVORITE_KEYS,captureFavoriteLook,applyFavoriteLook,DITHER_SETTING_KEYS,validateDesign,editModeValue,undoModeValue,designForModeApply,modeSetting,settingHistoryKey,reconcileSavedDesign,randomizeDither,restoreDitherRandomization,loadInitialDesign,cloudSettingKeys,randomizeCloud,restoreCloudRandomization,defaultSettingKeys,restoreCloudDefault} from './design.js';
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
 let accessNotice=null,modeHint=null,randomButton=null,undoRandomButton=null,applyRandomButton=null,randomHistory={},cloudRandomButton=null,cloudUndoButton=null,cloudApplyButton=null,cloudHistory={},defaultDesign=null,defaultButton=null,defaultPending={};
 const labels={live:'LIVE',work:'WORK',surf:'PLAY',sleep:'SLEEP'};
 let favorites={revision:0,items:[]},favoritesLoaded=false,favoritesBusy=false,favoriteList=null,favoriteName=null,favoriteSave=null,favoriteReload=null,undoFavorite=null,favoriteSnapshot=null,activeGroup='colors',targetsTouched=false;
 const favoriteTargets=new Map(),panels=new Map(),tabButtons=new Map();
 const targets=()=>[...favoriteTargets].filter(([,input])=>input.checked).map(([value])=>value);
 const showGroup=id=>{activeGroup=id;for(const [key,panel]of panels)panel.hidden=key!==id;for(const [key,tab]of tabButtons){tab.setAttribute('aria-selected',String(key===id));tab.tabIndex=key===id?0:-1;}refresh();};
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
   const previewButton=button('Preview',()=>previewFavorite(item));
   const applyButton=button('Apply favorite',()=>{if(previewFavorite(item))void saveDesign('favoriteLook',{look:item.look,modes:targets()});});applyButton.dataset.ownerAction='true';
   const remove=button('Remove',()=>{if(confirm('Remove “'+item.name+'” from Favorites? This does not change any page.'))void writeFavorite('remove',{id:item.id});});remove.dataset.ownerAction='true';
   actions.append(previewButton,applyButton,remove);card.append(swatch,info,actions);favoriteList.append(card);
  }refresh();
 }
 const refresh=()=>{
  const dirty=JSON.stringify(draft)!==JSON.stringify(applied);
  if(modeHint)modeHint.textContent='Editing '+labels[selectedMode]+' · Changes preview here. Apply saves across devices.';
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
  if(saveButton){saveButton.disabled=loading||saving||!owner||!dirty;saveButton.textContent=saving?'Saving…':dirty?'Save all changes':'All changes saved';}
  if(favoriteSave)favoriteSave.disabled=loading||saving||favoritesBusy||!owner||!favoritesLoaded||!favoriteName.value.trim()||favorites.items.length>=30;
  if(favoriteReload)favoriteReload.disabled=loading||favoritesBusy||!owner;
  if(undoFavorite)undoFavorite.disabled=loading||saving||!favoriteSnapshot;
  if(favoriteList)for(const control of favoriteList.querySelectorAll('button'))control.disabled=loading||saving||favoritesBusy||!favoritesLoaded||(control.dataset.ownerAction==='true'&&!owner);
  for(const input of favoriteTargets.values())input.disabled=loading||saving;
  if(randomButton)randomButton.disabled=loading||saving;
  if(cloudRandomButton)cloudRandomButton.disabled=loading||saving;
  if(cloudUndoButton)cloudUndoButton.disabled=loading||saving||!cloudHistory[selectedMode]?.length;
  if(cloudApplyButton)cloudApplyButton.disabled=loading||saving||!owner||!(defaultPending[selectedMode]?defaultSettingKeys(selectedMode):cloudSettingKeys(selectedMode)).some(key=>fieldValue(draft,key)!==fieldValue(applied,key));
  if(cloudApplyButton)cloudApplyButton.textContent=defaultPending[selectedMode]?'Apply default':'Apply Cloud look';
  if(defaultButton)defaultButton.disabled=loading||saving||!defaultDesign;
  if(undoRandomButton)undoRandomButton.disabled=loading||saving||!randomHistory[selectedMode]?.length;
  if(applyRandomButton)applyRandomButton.disabled=loading||saving||!owner||!['colorMode',...DITHER_SETTING_KEYS].some(key=>fieldValue(draft,key)!==fieldValue(applied,key));
 };
 let saveButton=null;
 async function saveDesign(key=null,favorite=null){
  if(saving||!owner||loading)return;
  const submitted=favorite?applyFavoriteLook(applied,favorite.look,favorite.modes):designForModeApply(applied,draft,selectedMode,key),draftAtSubmit=structuredClone(draft);
  const selection=key===null||favorite?null:{mode:selectedMode,key,keys:key==='modeDefault'?defaultSettingKeys(selectedMode):key==='cloudLook'?cloudSettingKeys(selectedMode):[...(key.startsWith('dither')&&fieldValue(draft,'colorMode')==='dither'?['colorMode']:[]),...(key==='ditherPreset'?DITHER_SETTING_KEYS:[key])]};
  saving=true;refresh();notify('Saving '+(key?'this setting':'your design')+'…');
  try{
   const response=await fetch('/api/design',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({settings:submitted,revision}),signal:AbortSignal.timeout(12000)});
   const body=await response.json();if(!response.ok)throw Error(body.error||'Could not save. Your preview is still here.');
   revision=body.revision;applied=validateDesign(body.settings);if(key==='modeDefault')defaultPending[selection.mode]=false;else if(key===null)defaultPending={};
   // Keep unrelated drafts and edits made while the save was in flight.
   if(favorite){for(const target of favorite.modes)draft=reconcileSavedDesign(applied,draftAtSubmit,draft,favoriteSelection(target));favoriteSnapshot=null;}
   else draft=reconcileSavedDesign(applied,draftAtSubmit,draft,selection);
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
  const title=document.createElement('h1');title.textContent='Mascot Studio';header.append(title);
  const copy=document.createElement('p');copy.textContent='Choose a page. Create a look. Keep your favorites.';header.append(copy);
  const close=document.createElement('a');close.href='/app';close.target='_blank';close.rel='noopener';close.textContent='Open Mascot ↗';header.append(close);shell.append(header);
  accessNotice=document.createElement('div');accessNotice.className='editor-access';accessNotice.setAttribute('role','status');accessNotice.textContent='Connecting to your saved design…';header.append(accessNotice);
  const modes=document.createElement('div');modes.className='editor-mode-picker';modes.setAttribute('aria-label','Page to edit');
  for(const [value,label]of Object.entries(labels)){const b=button(label,()=>{if(loading)return;selectedMode=value;mode(value);preview(draft);refresh();modes.querySelectorAll('button').forEach(b=>{b.classList.toggle('selected',b.textContent===label);b.setAttribute('aria-pressed',String(b.textContent===label));});});b.setAttribute('aria-pressed',String(value==='live'));modes.append(b);}
  modes.firstChild.classList.add('selected');shell.append(modes);
  document.addEventListener('mascot-mode-change',event=>{if(!DESIGN_MODES.includes(event.detail?.mode))return;selectedMode=event.detail.mode;modes.querySelectorAll('button').forEach(b=>{b.classList.toggle('selected',b.textContent===labels[selectedMode]);b.setAttribute('aria-pressed',String(b.textContent===labels[selectedMode]));});refresh();});
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
    randomButton=button('Randomize Dither',()=>{const result=randomizeDither(draft,selectedMode);const stack=randomHistory[selectedMode]||=[];stack.push(result.snapshot);if(stack.length>50)stack.shift();draft=result.draft;preview(draft);refresh();notify('Random Dither look previewed for this mode. Apply Dither look to save.');});
    undoRandomButton=button('Undo randomize',()=>{const previous=randomHistory[selectedMode]?.pop();if(previous){draft=restoreDitherRandomization(draft,selectedMode,previous);preview(draft);refresh();notify('Previous Dither look restored. Apply to save.');}});
    applyRandomButton=button('Apply Dither look',()=>void saveDesign('ditherPreset'));
    actions.append(randomButton,undoRandomButton,applyRandomButton,button('Save to Favorites',()=>{showGroup('favorites');favoriteName.focus();}));section.append(actions);
    const enable=button('Preview Dither finish',()=>{if(loading)return;draft=editModeValue(draft,history,selectedMode,'colorMode','dither');preview(draft);refresh();notify('Dither finish previewed. Apply Color finish or Apply Dither look to save.');});actions.prepend(enable);
    description.textContent='Use Preview Dither finish to see these controls on the selected page. Randomize also switches to Dither.';
   }
   for(const f of group.fields){
    if(f.key==='menuSeconds')continue;
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
    const changedInput=()=>{if(loading)return;try{const value=f.type==='range'?Number(input.value):f.type==='checkbox'?input.checked:input.value;const changed=value!==fieldValue(draft,f.key);if(!changed)return;if(f.key.startsWith('dither'))draft=editModeValue(draft,history,selectedMode,'colorMode','dither');draft=editModeValue(draft,dragging&&recorded?{}:history,selectedMode,f.key,value);if(dragging)recorded=true;preview(draft);refresh();notify('Previewing '+labels[selectedMode]+' changes. Apply to save across devices.');}catch(error){notify(error.message);}};
    input.addEventListener('input',changedInput);
    input.addEventListener('change',changedInput);
    controls.set(f.key,input);rows.set(f.key,row);row.append(label,input,actions);section.append(row);
   }shell.append(section);
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
  const footer=document.createElement('footer');footer.className='editor-actions';
  const discard=button('Discard previews',()=>{if(loading||saving)return;draft=structuredClone(applied);history={};randomHistory={};cloudHistory={};defaultPending={};favoriteSnapshot=null;preview(draft);refresh();notify('Back to your saved design.');});
  saveButton=button('Save all changes',()=>void saveDesign(),'editor-apply');footer.append(status,discard,saveButton);shell.append(footer);document.body.append(shell);
  window.addEventListener('beforeunload',event=>{if(!loading&&JSON.stringify(draft)!==JSON.stringify(applied)){event.preventDefault();event.returnValue='';}});
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
