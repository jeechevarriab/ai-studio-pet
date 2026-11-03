import {DESIGN_GROUPS,DITHER_PALETTES,DITHER_PRESETS,activeDitherSpectrum,groupSettingKeys} from './design.js';

export function hexToHsv(hex){
 const [r,g,b]=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255),max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;
 const h=d===0?0:((max===r?(g-b)/d+(g<b?6:0):max===g?(b-r)/d+2:(r-g)/d+4)*60);
 return {h,s:max===0?0:d/max,v:max};
}
export function hsvToHex({h,s,v}){
 const c=v*s,x=c*(1-Math.abs((h/60)%2-1)),m=v-c;
 const rgb=h<60?[c,x,0]:h<120?[x,c,0]:h<180?[0,c,x]:h<240?[0,x,c]:h<300?[x,0,c]:[c,0,x];
 return '#'+rgb.map(n=>Math.round((n+m)*255).toString(16).padStart(2,'0')).join('');
}
const named={gameboy:'Game Boy',bayer:'Bayer 8×8',bayer4:'Bayer 4×4',bayer2:'Bayer 2×2',none:'None'};
const label=value=>named[value]||value[0].toUpperCase()+value.slice(1);

export function createDitherEditor({edit,undo,redo,reset,group=null,apply=null,undoField=null,applyField=null}){
 const isDither=!group;
 const el=(tag,cls,text)=>{const e=document.createElement(tag);e.className=cls||'';if(text)e.textContent=text;return e;};
 const button=(text,action,title)=>{const e=el('button','',text);e.type='button';e.addEventListener('click',action);if(title){e.title=title;e.setAttribute('aria-label',title);}return e;};
 const root=el('div','dither-studio'),presetBox=el('section','dither-box'),custom=el('section','dither-box'),presets=el('div','dither-presets');
 presetBox.append(el('h3','','Presets'),presets);
 const presetButtons=new Map();
 for(const [key,preset]of Object.entries(isDither?DITHER_PRESETS:{})){
  const b=button(label(key),()=>edit('ditherPreset',key,true));const colors=DITHER_PALETTES[preset.ditherPalette]||[preset.ditherBackground,preset.ditherWaveColor];
  const dots=el('span','dither-preset-dots');dots.setAttribute('aria-hidden','true');for(const color of [colors[0],colors.at(-1)]){const dot=el('i');dot.style.background=color;dots.append(dot);}b.prepend(dots);presets.append(b);presetButtons.set(key,b);
 }
 const header=el('header','dither-box-heading'),title=el('h3','','Customize'),tools=el('div','dither-history');
 const sectionName=group?.label||'Dither';
 const resetButton=button('↺ Reset',reset,'Reset '+sectionName+' settings'),undoButton=button('↶',undo,'Undo '+sectionName+' change'),redoButton=button('↷',redo,'Redo '+sectionName+' change');tools.append(resetButton,undoButton,redoButton);let applyButton=null;if(apply){applyButton=button('Apply',apply,'Apply '+sectionName+' settings');applyButton.className='parameter-apply';tools.append(applyButton);}header.append(title,tools);custom.append(header);
 const rows=new Map(),inputs=new Map(),outputs=new Map(),fieldActions=new Map();let settings=null,currentKey=null,currentLabel='',hsv={h:0,s:0,v:0},canEdit=false;
 const actionKey=key=>isDither&&settings?.ditherPalette!=='none'?(key==='ditherWaveColor'?'ditherPalette'+activeDitherSpectrum(settings,'live').length:key==='ditherBackground'?'ditherPalette1':key==='ditherColors'?'ditherPaletteCount':key):key;
 const spectrum=el('div','dither-spectrum-chips'),spectrumWrap=el('div','dither-spectrum-wrap');spectrumWrap.append(el('span','','Color spectrum · dark → light'),spectrum);
 const picker=el('section','dither-color-picker');picker.hidden=true;picker.setAttribute('aria-label','Color picker');
 const pickerHeader=el('header'),pickerTitle=el('strong');pickerHeader.append(pickerTitle,button('×',()=>{picker.hidden=true;currentKey=null;},'Close color picker'));
 const plane=el('div','dither-color-plane'),cursor=el('i','dither-color-cursor');plane.append(cursor);plane.tabIndex=0;plane.setAttribute('role','slider');plane.setAttribute('aria-label','Saturation and brightness. Left and right change saturation; up and down change brightness.');plane.setAttribute('aria-valuemin','0');plane.setAttribute('aria-valuemax','100');
 const hue=el('input','dither-hue');hue.type='range';hue.min=0;hue.max=359.99;hue.step=.1;hue.setAttribute('aria-label','Color hue');
 const hexRow=el('div','dither-hex-row'),hexLabel=el('label','','Hex'),hex=el('input');hex.id=(group?.id||'dither')+'-picker-hex';hexLabel.htmlFor=hex.id;hex.type='text';hex.maxLength=7;hex.spellcheck=false;hex.setAttribute('aria-label','Hex color');
 const copy=button('⧉',async()=>{try{await navigator.clipboard.writeText(hex.value);copy.textContent='✓';}catch{copy.title='Select and copy the hex value.';}},'Copy hex color');hexRow.append(hexLabel,hex,copy);
 const suggestions=el('div','dither-color-suggestions'),recentBox=el('div','dither-recent');let recent=[];try{recent=JSON.parse(localStorage.getItem('mascot-recent-colors')||'[]').filter(v=>/^#[0-9a-f]{6}$/i.test(v)).slice(0,8);}catch{}
 const paintPicker=()=>{plane.style.backgroundColor=hsvToHex({h:hsv.h,s:1,v:1});cursor.style.left=(hsv.s*100)+'%';cursor.style.top=((1-hsv.v)*100)+'%';hue.value=hsv.h;hex.value=hsvToHex(hsv);plane.setAttribute('aria-valuenow',String(Math.round(hsv.s*100)));plane.setAttribute('aria-valuetext',Math.round(hsv.s*100)+'% saturation, '+Math.round(hsv.v*100)+'% brightness');};
 const remember=color=>{recent=[color,...recent.filter(c=>c!==color)].slice(0,8);try{localStorage.setItem('mascot-recent-colors',JSON.stringify(recent));}catch{}renderRecent();};
 const setColor=(color,newStep)=>{if(!canEdit||!currentKey||!/^#[0-9a-f]{6}$/i.test(color))return;edit(currentKey,color.toLowerCase(),newStep);};
 const colorChip=(color,action)=>{const b=button('',action,color);b.style.background=color;b.className='dither-color-chip';return b;};
 function renderRecent(){recentBox.replaceChildren(el('span','','Recent'));const chips=el('div','dither-color-suggestions');for(const color of recent)chips.append(colorChip(color,()=>{setColor(color,true);remember(color);}));recentBox.append(chips);}
 for(const color of ['#a855f7','#7c3aed','#6366f1','#3b82f6','#06b6d4','#10b981','#84cc16','#eab308','#f97316','#ef4444','#ec4899','#f43f5e','#ffffff','#94a3b8','#000000'])suggestions.append(colorChip(color,()=>{setColor(color,true);remember(color);}));renderRecent();
 let planeDragging=false,planeFirst=true;
 const movePlane=event=>{if(!planeDragging)return;const rect=plane.getBoundingClientRect();hsv.s=Math.max(0,Math.min(1,(event.clientX-rect.left)/rect.width));hsv.v=1-Math.max(0,Math.min(1,(event.clientY-rect.top)/rect.height));const color=hsvToHex(hsv);paintPicker();setColor(color,planeFirst);planeFirst=false;};
 plane.addEventListener('pointerdown',event=>{if(!canEdit)return;planeDragging=true;planeFirst=true;plane.setPointerCapture(event.pointerId);movePlane(event);});plane.addEventListener('pointermove',movePlane);
 const endPlane=()=>{if(planeDragging)remember(hsvToHex(hsv));planeDragging=false;};plane.addEventListener('pointerup',endPlane);plane.addEventListener('pointercancel',endPlane);
 plane.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;event.preventDefault();if(event.key==='ArrowLeft')hsv.s=Math.max(0,hsv.s-.01);if(event.key==='ArrowRight')hsv.s=Math.min(1,hsv.s+.01);if(event.key==='ArrowUp')hsv.v=Math.min(1,hsv.v+.01);if(event.key==='ArrowDown')hsv.v=Math.max(0,hsv.v-.01);paintPicker();setColor(hsvToHex(hsv),true);});
 let hueFirst=true;hue.addEventListener('pointerdown',()=>hueFirst=true);hue.addEventListener('keydown',()=>hueFirst=true);hue.addEventListener('input',()=>{hsv.h=Number(hue.value);paintPicker();setColor(hsvToHex(hsv),hueFirst);hueFirst=false;});hue.addEventListener('change',()=>{hueFirst=true;remember(hsvToHex(hsv));});
 let hexFirst=true;hex.autocomplete='off';hex.setAttribute('autocapitalize','off');hex.addEventListener('focus',()=>hexFirst=true);
 hex.addEventListener('input',()=>{hex.setCustomValidity('');if(/^#[0-9a-f]{6}$/i.test(hex.value)){const color=hex.value.toLowerCase();hsv=hexToHsv(color);paintPicker();setColor(color,hexFirst);hexFirst=false;}});hex.addEventListener('change',()=>{if(!/^#[0-9a-f]{6}$/i.test(hex.value)){hex.setCustomValidity('Use a six-digit hex color, such as #8b5cf6.');hex.reportValidity();}else remember(hex.value.toLowerCase());hexFirst=true;});
 hex.addEventListener('blur',()=>{if(/^#[0-9a-f]{6}$/i.test(hex.value))remember(hex.value.toLowerCase());hexFirst=true;});
 picker.addEventListener('keydown',event=>{if(event.key==='Escape'){picker.hidden=true;currentKey=null;}});
 const hueRow=el('div','dither-hue-row');
 const eyedropper=button('⌕',async()=>{try{const result=await new window.EyeDropper().open();setColor(result.sRGBHex,true);remember(result.sRGBHex);}catch(error){if(error.name!=='AbortError')eyedropper.title='Screen color picking is unavailable.';}},'Pick a screen color');eyedropper.className='dither-eyedropper';eyedropper.disabled=typeof window.EyeDropper!=='function';eyedropper.dataset.unsupported=String(eyedropper.disabled);if(eyedropper.disabled)eyedropper.title='Screen color picking is unavailable in this browser.';hueRow.append(eyedropper,hue);
 picker.append(pickerHeader,plane,hueRow,hexRow,suggestions,recentBox);
 function openPicker(key,name,color){currentKey=key;currentLabel=name;picker.hidden=false;pickerTitle.textContent=name;copy.textContent='⧉';try{recent=JSON.parse(localStorage.getItem('mascot-recent-colors')||'[]').filter(v=>/^#[0-9a-f]{6}$/i.test(v)).slice(0,8);renderRecent();}catch{}hsv=hexToHsv(color);paintPicker();const row=rows.get(key)||spectrumWrap;(row.closest('.parameter-line')||row).after(picker);}
 const appBackgroundKey=key=>/^(live|work|surf|sleep)Background$/.test(key);
 const effectColor=key=>['ditherWaveColor','ditherBackground'].includes(key);
 const fields=group?.fields||[...DESIGN_GROUPS.find(g=>g.id==='colors').fields.filter(f=>appBackgroundKey(f.key)).map(f=>({...f,label:'App background'})),...DESIGN_GROUPS.find(g=>g.id==='dither').fields.map(f=>f.key==='ditherBackground'?{...f,label:'Effect background'}:f)];
 const colorRows=new Map();
 for(const f of fields){
  if(f.key==='menuSeconds'||isDither&&(f.key==='ditherPreset'||f.key==='ditherPaletteCount'||/^ditherPalette\d+$/.test(f.key)))continue;
  const inputId=(isDither&&appBackgroundKey(f.key)?'setting-dither-app-':'setting-')+f.key;
  const row=el('div','dither-control'),text=el('label','',f.key==='ditherPalette'?'Palette':f.label);text.htmlFor=inputId;row.append(text);rows.set(f.key,row);
  let input;
  if(f.type==='color'){
   input=button('',()=>{const colors=isDither?activeDitherSpectrum(settings,'live'):[],palette=isDither&&effectColor(f.key)&&settings.ditherPalette!=='none';const key=palette?(f.key==='ditherWaveColor'?'ditherPalette'+colors.length:'ditherPalette1'):f.key;openPicker(key,f.label,palette?(f.key==='ditherWaveColor'?colors.at(-1):colors[0]):settings[f.key]);},'Edit '+f.label);input.className='dither-color-value';const swatch=el('i'),code=el('span');input.append(swatch,code);colorRows.set(f.key,{swatch,code});
  }else if(f.type==='select'){
   input=el('select');for(const value of f.options){const text=f.key==='colorMode'?({cloud:'Cloud · Original',dither:'Dither'})[value]:value.startsWith('touch-')?['Orbit','Daydream','Glee','Lilt','Prism','Ripple','Intent','Sideglance','Soft wink','Starlit'][Number(value.slice(6))]:value==='auto'?'Follow activity':label(value);const o=el('option','',text);o.value=value;input.append(o);}input.addEventListener('change',()=>edit(f.key,input.value,true));
  }else if(f.type==='range'){
   const rangeKey=()=>f.key==='ditherColors'&&settings?.ditherPalette!=='none'?'ditherPaletteCount':f.key;
   input=el('input');input.type='range';input.min=f.min;input.max=f.max;input.step=f.step;input.className='dither-row-range';let first=true;input.addEventListener('pointerdown',()=>first=true);input.addEventListener('keydown',()=>first=true);input.addEventListener('input',()=>{edit(rangeKey(),Number(input.value),first);first=false;});input.addEventListener('change',()=>first=true);
   const number=el('input','dither-number');number.type='number';number.min=f.min;number.max=f.max;number.step=f.step;number.setAttribute('aria-label',f.label+' value');let numberFirst=true;number.addEventListener('focus',()=>numberFirst=true);const numberInput=()=>{if(number.value!==''&&number.checkValidity()){edit(rangeKey(),Number(number.value),numberFirst);numberFirst=false;}};number.addEventListener('input',numberInput);number.addEventListener('change',()=>{numberInput();if(!number.checkValidity())number.reportValidity();numberFirst=true;});outputs.set(f.key,number);row.append(number);row.classList.add('dither-range-row');
  }else if(f.type==='text'){input=el('input','parameter-text');input.type='text';input.maxLength=12;input.spellcheck=false;let first=true;input.addEventListener('focus',()=>first=true);input.addEventListener('input',()=>{if(/^[\x21-\x7e]{1,12}$/.test(input.value)){edit(f.key,input.value,first);first=false;}});}
  else{input=el('input','dither-toggle');input.type='checkbox';input.addEventListener('change',()=>edit(f.key,input.checked,true));}
  input.id=inputId;input.setAttribute('aria-label',f.label);inputs.set(f.key,input);row.append(input);
  if(undoField&&applyField){const actions=el('div','parameter-field-actions'),u=button('Undo',()=>undoField(actionKey(f.key)),'Undo '+f.label),a=button('Apply',()=>applyField(actionKey(f.key)),'Apply '+f.label),error=el('p','parameter-field-error');error.hidden=true;error.setAttribute('role','status');actions.append(u,a);const line=el('div','parameter-line');line.append(row,actions,error);fieldActions.set(f.key,{line,undo:u,apply:a,error});}
 }
 const appendRow=(parent,key)=>parent.append(fieldActions.get(key)?.line||rows.get(key));
 const order=['liveBackground','workBackground','surfBackground','sleepBackground','ditherWaveColor','ditherBackground','ditherPalette','ditherPattern','ditherPixelSize','ditherColors','ditherScale','ditherSpeed','ditherFrequency','ditherAmplitude','ditherContrast','ditherBrightness','ditherMouse','ditherMouseEffect','ditherMouseRadius','ditherMouseStrength','ditherTrail','ditherClickRipple'];
 if(isDither){for(const key of order){appendRow(custom,key);if(key==='ditherPalette')custom.append(spectrumWrap);}const more=el('details','dither-more');more.append(el('summary','','More options'));for(const f of fields)if(rows.has(f.key)&&!order.includes(f.key))appendRow(more,f.key);custom.append(more);root.append(presetBox,custom);}
 else{for(const f of fields)if(rows.has(f.key))appendRow(custom,f.key);root.append(custom);}
 return {element:root,refresh(s,state){
  settings=s;canEdit=state.canEdit;undoButton.disabled=!canEdit||!state.canUndo;redoButton.disabled=!canEdit||!state.canRedo;resetButton.disabled=!canEdit;
  if(applyButton){applyButton.disabled=!state.canApply;applyButton.textContent=state.savePhase==='saving'?'Saving…':state.savePhase==='saved'?'Saved':state.savePhase==='error'?'Retry':'Apply';}
  for(const [key,b]of presetButtons){b.disabled=!canEdit;b.setAttribute('aria-pressed',String(s.ditherPreset===key));}
  const colors=isDither?activeDitherSpectrum(s,'live'):[],paletted=isDither&&s.ditherPalette!=='none',visible=group?new Set(groupSettingKeys(group.id,state.mode)):null;
  for(const f of fields){const input=inputs.get(f.key);if(!input)continue;let disabled=!canEdit;
   if(f.type==='color'){const color=paletted&&effectColor(f.key)?(f.key==='ditherWaveColor'?colors.at(-1):colors[0]):s[f.key];colorRows.get(f.key).swatch.style.background=color;colorRows.get(f.key).code.textContent=color;disabled||=f.key==='ditherBackground'&&s.ditherTransparent&&!paletted;}
   else if(f.type==='checkbox')input.checked=s[f.key];else input.value=f.key==='ditherColors'&&paletted?colors.length:s[f.key];
   if(outputs.has(f.key)){const max=f.key==='ditherColors'&&paletted?8:f.max,value=f.key==='ditherColors'&&paletted?colors.length:s[f.key];input.max=max;input.value=value;outputs.get(f.key).max=max;outputs.get(f.key).value=value;outputs.get(f.key).disabled=!canEdit;rows.get(f.key).style.setProperty('--range-progress',((value-f.min)/(max-f.min)*100)+'%');}
   disabled||=['ditherMouseEffect','ditherMouseRadius','ditherMouseStrength','ditherTrail'].includes(f.key)&&!s.ditherMouse||f.key==='ditherSpeed'&&s.ditherDisableAnimation||f.key==='ditherTransparent'&&paletted;
   input.disabled=disabled;if(outputs.has(f.key))outputs.get(f.key).disabled=disabled;
   rows.get(f.key).hidden=visible?!visible.has(f.key):appBackgroundKey(f.key)?f.key!==(state.mode||'live')+'Background':f.key==='ditherPaletteCount'&&!paletted;
   const actions=fieldActions.get(f.key);if(actions){actions.line.hidden=rows.get(f.key).hidden;const field=state.fieldState?.(actionKey(f.key))||{};actions.undo.disabled=!canEdit||!field.canUndo;actions.apply.disabled=!field.canApply;actions.apply.textContent=field.savePhase==='saving'?'Saving…':field.savePhase==='saved'?'Saved':field.savePhase==='error'?'Retry':'Apply';actions.apply.classList.toggle('parameter-saved',field.savePhase==='saved');actions.error.hidden=field.savePhase!=='error';actions.error.textContent=field.error||'';}
  }
  spectrum.replaceChildren();spectrumWrap.hidden=!paletted;
  if(paletted)for(const [index,color]of colors.entries()){const b=colorChip(color,()=>openPicker('ditherPalette'+(index+1),'Spectrum color '+(index+1),color));b.disabled=!canEdit;b.textContent=String(index+1);b.style.color=hexToHsv(color).v>.65?'#121212':'#fff';spectrum.append(b);}
  if(currentKey&&visible&&!visible.has(currentKey)){picker.hidden=true;currentKey=null;}
  if(currentKey&&isDither&&appBackgroundKey(currentKey)&&currentKey!==(state.mode||'live')+'Background'){picker.hidden=true;currentKey=null;}
  if(currentKey){if(isDither&&/^ditherPalette\d+$/.test(currentKey)){const index=Number(currentKey.slice(13))-1;if(index>=colors.length||!paletted){picker.hidden=true;currentKey=null;}else if(!planeDragging&&document.activeElement!==hue&&document.activeElement!==hex){hsv=hexToHsv(colors[index]);paintPicker();}}
   else if(!planeDragging&&document.activeElement!==hue&&document.activeElement!==hex){hsv=hexToHsv(s[currentKey]);paintPicker();}}
  for(const input of picker.querySelectorAll('input,button'))input.disabled=!canEdit||input.dataset.unsupported==='true';plane.tabIndex=canEdit?0:-1;
 },closePicker(){picker.hidden=true;currentKey=null;}};
}
