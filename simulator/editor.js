import {DESIGN_GROUPS,DESIGN_DEFAULTS,validateDesign,editValue,undoValue} from './design.js';
export async function connectDesignEditor({preview,apply,mode}){
 const editing=location.pathname==='/customize';
 let applied={...DESIGN_DEFAULTS},draft={...DESIGN_DEFAULTS},history={},revision=0,owner=false,loading=true,saving=false,signature='';
 const accept=settings=>{const next=JSON.stringify(settings);if(next!==signature){signature=next;apply(settings);}};
 const status=document.createElement('p');status.className='editor-status';status.setAttribute('role','status');
 const notify=message=>{status.textContent=message;};
 const button=(label,action,cls='')=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.className=cls;b.addEventListener('click',action);return b;};
 const controls=new Map(),outputs=new Map(),undos=new Map();
 const refresh=()=>{
  for(const group of DESIGN_GROUPS)for(const f of group.fields){const input=controls.get(f.key);if(!input)continue;
   if(f.type==='checkbox')input.checked=draft[f.key];else input.value=draft[f.key];
   if(outputs.has(f.key))outputs.get(f.key).textContent=String(draft[f.key]);
   undos.get(f.key).disabled=!history[f.key]?.length;
  }
  if(saveButton)saveButton.disabled=loading||saving||!owner;
 };
 let saveButton=null;
 if(editing){
  document.documentElement.classList.add('customizing');
  const shell=document.createElement('section');shell.className='editor-shell';shell.setAttribute('aria-label','Mascot design editor');
  const header=document.createElement('header');header.className='editor-heading';
  const title=document.createElement('h1');title.textContent='Make it yours.';header.append(title);
  const copy=document.createElement('p');copy.textContent='A little companion. Your personality.';header.append(copy);
  const close=document.createElement('a');close.href='/app';close.textContent='Open Mascot ↗';header.append(close);shell.append(header);
  const modes=document.createElement('div');modes.className='editor-mode-picker';
  for(const [value,label]of [['live','LIVE'],['work','WORK'],['surf','PLAY'],['sleep','SLEEP']])modes.append(button(label,()=>{mode(value);modes.querySelectorAll('button').forEach(b=>b.classList.toggle('selected',b.textContent===label));}));
  modes.firstChild.classList.add('selected');shell.append(modes);
  const tabs=document.createElement('nav');tabs.className='editor-tabs';tabs.setAttribute('aria-label','Customization features');shell.append(tabs);
  for(const group of DESIGN_GROUPS){
   const section=document.createElement('section');section.className='editor-group';section.id='edit-'+group.id;section.hidden=group.id!=='colors';
   const tab=button(group.label,()=>{shell.querySelectorAll('.editor-group').forEach(s=>s.hidden=s!==section);tabs.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',b===tab));});tab.setAttribute('aria-pressed',group.id==='colors');tabs.append(tab);
   const heading=document.createElement('h2');heading.textContent=group.label;const description=document.createElement('p');description.className='editor-description';description.textContent=group.description;section.append(heading,description);
   for(const f of group.fields){
    const row=document.createElement('div');row.className='editor-setting';const label=document.createElement('label');label.htmlFor='setting-'+f.key;label.textContent=f.label;
    const input=document.createElement(f.type==='select'?'select':'input');input.id='setting-'+f.key;if(f.type!=='select')input.type=f.type;input.setAttribute('aria-label',f.label);
    if(f.type==='select')for(const value of f.options){const o=document.createElement('option');o.value=value;o.textContent=value.startsWith('touch-')?['Orbit','Daydream','Glee','Lilt','Prism','Ripple','Intent','Sideglance','Soft wink','Starlit'][Number(value.slice(6))]:value==='auto'?'Follow activity':value[0].toUpperCase()+value.slice(1);input.append(o);}
    if(f.type==='range'){input.min=f.min;input.max=f.max;input.step=f.step;const output=document.createElement('output');output.htmlFor=input.id;outputs.set(f.key,output);label.append(output);}
    if(f.type==='text')input.maxLength=12;
    const undo=button('Undo',()=>{draft=undoValue(draft,history,f.key);preview(draft);refresh();notify('Previous '+f.label.toLowerCase()+' restored. Apply to save.');},'setting-undo');undo.setAttribute('aria-label','Undo '+f.label);undos.set(f.key,undo);
    let dragging=false,recorded=false;
    input.addEventListener('pointerdown',()=>{dragging=true;recorded=false;});
    for(const event of ['pointerup','pointercancel','change','blur'])input.addEventListener(event,()=>{dragging=false;});
    input.addEventListener('input',()=>{if(loading)return;try{const value=f.type==='range'?Number(input.value):f.type==='checkbox'?input.checked:input.value;const changed=value!==draft[f.key];draft=editValue(draft,dragging&&recorded?{}:history,f.key,value);if(dragging&&changed)recorded=true;preview(draft);refresh();notify('Previewing changes. Apply to save across devices.');}catch(error){notify(error.message);}});
    controls.set(f.key,input);row.append(label,input,undo);section.append(row);
   }shell.append(section);
  }
  const footer=document.createElement('footer');footer.className='editor-actions';
  const discard=button('Discard changes',()=>{draft={...applied};history={};preview(draft);refresh();notify('Back to your saved design.');});
  saveButton=button('Apply & save',async()=>{
   if(saving||!owner)return;saving=true;refresh();notify('Saving your design…');
   try{const response=await fetch('/api/design',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({settings:validateDesign(draft),revision})});const body=await response.json();if(!response.ok)throw Error(body.error||'Could not save. Your preview is still here.');revision=body.revision;applied={...body.settings};draft={...applied};apply(applied);notify('Saved. Your mascot will use this design on every device.');}
   catch(error){notify(error.message);}finally{saving=false;refresh();}
  },'editor-apply');footer.append(discard,saveButton);shell.append(status,footer);document.body.append(shell);
  notify('Loading your saved design…');refresh();
 }
 const refreshSaved=async()=>{
  const response=await fetch('/api/design',{cache:'no-store'});if(!response.ok)throw Error('Cloud design unavailable');const data=await response.json();applied=validateDesign(data.settings);revision=data.revision;try{localStorage.setItem('mascot-confirmed-design',JSON.stringify({settings:applied,revision}));}catch{}return applied;
 };
 try{await refreshSaved();accept(applied);}catch{try{const cached=JSON.parse(localStorage.getItem('mascot-confirmed-design'));applied=validateDesign(cached.settings);revision=cached.revision||0;}catch{}accept(applied);if(editing)notify('Cloud save is unavailable. Preview works; saving requires the live site.');}
 draft={...applied};loading=false;
 if(editing){
  try{const response=await fetch('/api/session',{cache:'no-store'});const session=await response.json();owner=session.owner===true;
   if(owner)notify('Owner signed in. Changes preview instantly; Apply saves them.');
   else{const link=document.createElement('a');link.href='/signin-with-chatgpt?return_to=%2Fcustomize';link.target='_top';link.textContent=session.signedIn?'Sign in with your owner account':'Sign in to save your design';link.className='editor-signin';status.after(link);notify('Explore and preview. Only the owner can save.');}
  }catch{notify('Preview mode. Open the live site and sign in to save.');}refresh();
 }else{
  // Refresh on return to the app, without overwriting an unsaved editor draft.
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)void refreshSaved().then(accept).catch(()=>{});});
  const poll=()=>{if(!document.hidden)void refreshSaved().then(accept).catch(()=>{});};
  let timer=setInterval(poll,20000);
  window.addEventListener('pagehide',()=>clearInterval(timer));
  window.addEventListener('pageshow',event=>{if(event.persisted){clearInterval(timer);timer=setInterval(poll,20000);poll();}});
 }
 return {get settings(){return draft;}};
}
