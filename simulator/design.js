const range=(key,label,value,min,max,step=1)=>({key,label,value,min,max,step,type:'range'});
const color=(key,label,value)=>({key,label,value,type:'color'});
const toggle=(key,label,value)=>({key,label,value,type:'checkbox'});
const text=(key,label,value)=>({key,label,value,type:'text'});
const choice=(key,label,value,options)=>({key,label,value,options,type:'select'});
export const DITHER_PALETTES={none:[],gameboy:['#0f380f','#306230','#8bac0f','#9bbc0f'],amber:['#0b0603','#5c2e05','#d97706','#ffd08a'],sepia:['#1a120b','#5a4632','#a8916f','#efe3c8'],ice:['#06121f','#173d5c','#5f9ec7','#e4f3ff'],blueprint:['#0d2a57','#24508f','#8fb5ea','#e8f1ff']};
const ditherLook={ditherPattern:'bayer',ditherPalette:'none',ditherColors:4,ditherPixelSize:2,ditherScale:1,ditherSpeed:.05,ditherFrequency:3,ditherAmplitude:.3,ditherContrast:1,ditherBrightness:0,ditherMouseEffect:'erase',ditherMouseRadius:.3,ditherMouseStrength:1,ditherTrail:.5,ditherWaveColor:'#bcbcbc',ditherBackground:'#120f17'};
export const DITHER_PRESETS={classic:{...ditherLook},gameboy:{...ditherLook,ditherPalette:'gameboy',ditherPixelSize:3},newsprint:{...ditherLook,ditherPattern:'halftone',ditherWaveColor:'#141414',ditherBackground:'#efeae0',ditherContrast:1.3,ditherMouseEffect:'reveal'},amber:{...ditherLook,ditherPattern:'lines',ditherPalette:'amber',ditherScale:1.2},blueprint:{...ditherLook,ditherPattern:'crosshatch',ditherPalette:'blueprint',ditherMouseEffect:'ripple',ditherMouseRadius:.45},static:{...ditherLook,ditherPattern:'noise',ditherColors:2,ditherPixelSize:1,ditherSpeed:.12,ditherContrast:1.3}};
export const DESIGN_GROUPS=[
 {id:'colors',label:'Color',description:'A different world for every mode.',fields:[
  choice('colorMode','Color finish','cloud',['cloud','dither']),
  range('saturation','Color saturation · %',120,50,180,5),
  color('liveColor','LIVE mascot','#66f4d5'),color('liveBackground','LIVE background','#050909'),
  color('workColor','WORK mascot','#ff392c'),color('workBackground','WORK background','#f2efed'),
  color('surfColor','PLAY mascot','#01070b'),color('surfBackground','PLAY background','#078fe3'),
  color('sleepColor','SLEEP mascot','#b2a9ee'),color('sleepBackground','SLEEP background','#050909'),
  toggle('colorCycle','Slow LIVE color cycle',true),range('cycleSeconds','Color cycle · seconds',240,60,600,10),
  color('cycle2','Cycle · sky','#8fcfff'),color('cycle3','Cycle · lavender','#b2a9ee'),color('cycle4','Cycle · rose','#f3a3b5'),color('cycle5','Cycle · lime','#b4f483')
 ]},
 {id:'dither',label:'Dither',description:'React Bits Dither. Select Dither in Color to preview these settings.',fields:[
  choice('ditherPreset','Preset','classic',Object.keys(DITHER_PRESETS)),
  color('ditherWaveColor','Wave Color','#bcbcbc'),color('ditherBackground','Background','#120f17'),toggle('ditherTransparent','Transparent background',false),
  choice('ditherPalette','Palette','none',[...Object.keys(DITHER_PALETTES),'custom']),
  choice('ditherPattern','Dither Mode','bayer',['bayer','bayer4','bayer2','halftone','lines','crosshatch','noise','none']),
  range('ditherPixelSize','Pixel Size',2,1,8,1),range('ditherColors','Colors',4,2,16),range('ditherScale','Scale',1,.3,3,.05),
  range('ditherSpeed','Wave Speed',.05,0,.2,.005),range('ditherFrequency','Wave Frequency',3,1,8,.1),range('ditherAmplitude','Wave Amplitude',.3,0,1,.01),
  range('ditherContrast','Contrast',1,.5,2.5,.05),range('ditherBrightness','Brightness',0,-.5,.5,.01),
  choice('ditherMouseEffect','Mouse Effect','erase',['erase','reveal','ripple']),range('ditherMouseRadius','Mouse Radius',.3,.05,1,.01),range('ditherMouseStrength','Mouse Strength',1,0,2,.05),range('ditherTrail','Trail',.5,0,1,.05),
  toggle('ditherMouse','Mouse Interaction',true),toggle('ditherClickRipple','Click Ripple',true),toggle('ditherIntro','Intro',true),toggle('ditherDisableAnimation','Disable Animation',false),
  range('ditherDetail','Render detail',1,1,2,.25),range('ditherPaletteCount','Custom palette colors',4,2,8),
  ...['#06121f','#173d5c','#5f9ec7','#e4f3ff','#7f5af0','#e8aaff','#ffd08a','#fff9e6'].map((value,i)=>color('ditherPalette'+(i+1),'Palette color '+(i+1),value))
 ]},
 {id:'face',label:'Face',description:'One character size, across every expression.',fields:[
  {key:'expression',label:'Eye expression',type:'select',value:'auto',options:['auto','idle','happy','focused','sleeping','touch-0','touch-1','touch-2','touch-3','touch-4','touch-5','touch-6','touch-7','touch-8','touch-9']},
  range('eyeSize','Eye size · %',100,70,130),range('characterSize','Character size · %',100,70,130),
  range('eyeSeparation','Eye separation · %',100,75,125),range('eyeDensity','Character density',2,1,3,.25),
  color('liveEye','LIVE eye color','#09272b'),color('workEye','WORK eye color','#361423'),color('surfEye','PLAY eye color','#dcfcff'),color('sleepEye','SLEEP eye color','#09272b'),
  text('asciiLight','Light characters','.:+'),text('asciiMid','Middle characters','x*o'),text('asciiDark','Dense characters','O0#@'),
  range('asciiSpeed','Character flow',1,0,2,.1),range('blinkSpeed','Blink frequency',1,0,2,.1)
 ]},
 {id:'body',label:'Shape',description:'Round, diffuse and quietly alive.',fields:[
  range('bodyWidth','Width',338,260,370),range('bodyHeight','Height',300,230,360),range('roundness','Roundness',112,60,150),
  range('diffusion','Edge diffusion',13,5,28),range('texture','Surface texture',1,0,2,.1),range('liquid','Liquid movement',1,0,2,.1),range('float','Floating movement',1,0,2,.1)
 ]},
 {id:'light',label:'Light',description:'Depth, illumination and soft shadows.',fields:[
  range('depth','Depth shading',1,0,2,.1),range('light','Light intensity',1,0,2,.1),range('lightTravel','Light movement',1,0,2,.1),range('brightness','Surface brightness',1,.5,1.5,.05)
 ]},
 {id:'motion',label:'Interaction',description:'How your companion responds to you.',fields:[
  toggle('sensors','Respond to device movement',true),range('bodySway','Body sway',1,0,2,.1),range('gaze','Corner gaze',1,0,2,.1),toggle('pickup','Happy when picked up',true),range('greetingSeconds','Happy greeting · seconds',2.8,1,5,.1),
  range('zoom','Menu zoom',1.3,1,1.5,.05),range('menuSeconds','Menu hold · seconds',4.5,2,15,.5),range('holdMs','Long press · milliseconds',520,300,1000,20),toggle('studioAuto','Follow STUDIO activity',true)
 ]}
];
export const DESIGN_FIELDS=DESIGN_GROUPS.flatMap(group=>group.fields);
export const DITHER_SETTING_KEYS=DESIGN_FIELDS.filter(f=>f.key.startsWith('dither')).map(f=>f.key);
export const DESIGN_DEFAULTS={...Object.fromEntries(DESIGN_FIELDS.map(f=>[f.key,f.value])),modeOverrides:{}};
export const DESIGN_MODES=['live','work','surf','sleep'];
export const scopedSetting=key=>key!=='studioAuto'&&!/^(live|work|surf|sleep)(Color|Background|Eye)$/.test(key);
export function validateDesign(input){
 if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(k=>!Object.hasOwn(DESIGN_DEFAULTS,k)))throw Error('Unknown design setting');
 input={...input};if(input.colorMode)input.colorMode=({aurora:'cloud',iridescence:'cloud',bends:'cloud',silk:'cloud',boiling:'cloud',paper:'cloud'})[input.colorMode]||input.colorMode;
 const result={...DESIGN_DEFAULTS};
 for(const f of DESIGN_FIELDS){if(!Object.hasOwn(input,f.key))continue;const v=input[f.key];
  if(f.type==='range'&&(!Number.isFinite(v)||v<f.min||v>f.max))throw Error('Invalid '+f.label);
  if(f.type==='checkbox'&&typeof v!=='boolean')throw Error('Invalid '+f.label);
  if(f.type==='color'&&(typeof v!=='string'||!/^#[0-9a-f]{6}$/i.test(v)))throw Error('Invalid '+f.label);
  if(f.type==='text'&&(typeof v!=='string'||v.length<1||v.length>12||!/^[\x21-\x7e]+$/.test(v)))throw Error('Use 1–12 printable characters');
  if(f.type==='select'&&!f.options.includes(v))throw Error('Invalid '+f.label);
  result[f.key]=v;
 }
 result.modeOverrides={};
 if(input.modeOverrides!==undefined){
  const overrides=input.modeOverrides;
  if(!overrides||typeof overrides!=='object'||Array.isArray(overrides)||Object.keys(overrides).some(mode=>!DESIGN_MODES.includes(mode)))throw Error('Invalid mode settings');
  for(const [mode,fields]of Object.entries(overrides)){
   if(!fields||typeof fields!=='object'||Array.isArray(fields)||Object.keys(fields).some(key=>key==='modeOverrides'||!DESIGN_FIELDS.some(f=>f.key===key)||!scopedSetting(key)))throw Error('Invalid mode setting');
   const checked=validateDesign(fields);result.modeOverrides[mode]=Object.fromEntries(Object.keys(fields).map(key=>[key,checked[key]]));
  }
 }
 return result;
}
export const modeSetting=(design,mode,key)=>scopedSetting(key)?design.modeOverrides?.[mode]?.[key]??design[key]:design[key];
export const settingHistoryKey=(mode,key)=>(scopedSetting(key)?mode:'global')+'/'+key;
export function resolveModeDesign(input,mode){const d=validateDesign(input);if(!DESIGN_MODES.includes(mode))throw Error('Invalid mode');return {...d,...d.modeOverrides[mode],modeOverrides:{}};}
function writeModeSetting(input,mode,key,value){
 if(!DESIGN_MODES.includes(mode)||!DESIGN_FIELDS.some(f=>f.key===key))throw Error('Invalid mode setting');
 return validateDesign(scopedSetting(key)?{...input,modeOverrides:{...input.modeOverrides,[mode]:{...input.modeOverrides?.[mode],[key]:value}}}:{...input,[key]:value});
}
export function editModeValue(draft,history,mode,key,value){
 if(key==='ditherPreset'){
  if(!Object.hasOwn(DITHER_PRESETS,value))throw Error('Invalid preset');
  const h=settingHistoryKey(mode,key),snapshot=Object.fromEntries(DITHER_SETTING_KEYS.map(k=>[k,modeSetting(draft,mode,k)]));
  let next=draft;for(const [k,v]of Object.entries(DITHER_PRESETS[value]))next=writeModeSetting(next,mode,k,v);
  next=writeModeSetting(next,mode,key,value);(history[h]||=[]).push(snapshot);return next;
 }
 const next=writeModeSetting(draft,mode,key,value),old=modeSetting(draft,mode,key),h=settingHistoryKey(mode,key);
 if(modeSetting(next,mode,key)!==old){(history[h]||=[]).push(old);if(history[h].length>50)history[h].shift();}return next;
}
export function undoModeValue(draft,history,mode,key){const stack=history[settingHistoryKey(mode,key)];if(!stack?.length)return draft;const old=stack.pop();if(key==='ditherPreset'&&typeof old==='object'){let next=draft;for(const [k,v]of Object.entries(old))next=writeModeSetting(next,mode,k,v);return next;}return writeModeSetting(draft,mode,key,old);}
export function designForModeApply(applied,draft,mode,key=null){if(key===null)return validateDesign(draft);let next=applied;if(key.startsWith('dither')&&modeSetting(draft,mode,'colorMode')==='dither')next=writeModeSetting(next,mode,'colorMode','dither');if(key==='ditherPreset'){for(const k of DITHER_SETTING_KEYS)next=writeModeSetting(next,mode,k,modeSetting(draft,mode,k));return next;}return writeModeSetting(next,mode,key,modeSetting(draft,mode,key));}
export function reconcileSavedDesign(saved,before,after,selection=null){
 const includes=key=>!selection||(selection.keys||[selection.key]).includes(key);
 const result=structuredClone(after);
 for(const f of DESIGN_FIELDS)if((!selection||!scopedSetting(f.key)&&includes(f.key))&&before[f.key]===after[f.key])result[f.key]=saved[f.key];
 result.modeOverrides??={};
 for(const mode of DESIGN_MODES){
  const fields={...result.modeOverrides[mode]};
  for(const f of DESIGN_FIELDS)if(scopedSetting(f.key)&&(!selection||mode===selection.mode&&includes(f.key))&&before.modeOverrides?.[mode]?.[f.key]===after.modeOverrides?.[mode]?.[f.key]){
   const value=saved.modeOverrides?.[mode]?.[f.key];if(value===undefined)delete fields[f.key];else fields[f.key]=value;
  }
  if(Object.keys(fields).length)result.modeOverrides[mode]=fields;else delete result.modeOverrides[mode];
 }
 return validateDesign(result);
}
export function designDefinition(base,input){
 const d=validateDesign(input),result=structuredClone(base),p=result.presentationV2;
 p.custom=d;p.eyeSizeMultiplier=1.82*d.eyeSize/100;p.eyeDotMultiplier=.6*d.characterSize/100;p.eyeSampling=d.eyeDensity;
 result.eyes.separation=base.eyes.separation*d.eyeSeparation/100;
 result.eyes.flowSpeed=d.asciiSpeed;result.eyes.blinkSpeed=d.blinkSpeed;result.eyes.asciiPalette=[d.asciiLight,d.asciiMid,d.asciiDark];
 Object.assign(result.body,{texture:d.texture,depth:d.depth,brightness:d.brightness,light:d.light,lightTravel:d.lightTravel});
 Object.assign(p.task,{width:d.bodyWidth,height:d.bodyHeight,radius:Math.min(d.roundness,d.bodyWidth/2,d.bodyHeight/2),feather:d.diffusion});
 for(const mode of ['live','work','surf','sleep'])p.modeColors[mode]=d[mode+'Color'];
 p.homeCycleMs=d.cycleSeconds*1000;p.homePalette=[d.liveColor,d.cycle2,d.cycle3,d.cycle4,d.cycle5];
 return result;
}
export function editValue(draft,history,key,value){
 if(!Object.hasOwn(DESIGN_DEFAULTS,key))throw Error('Unknown design setting');
 const next=validateDesign({...draft,[key]:value});
 if(next[key]!==draft[key]){(history[key]||=[]).push(draft[key]);if(history[key].length>50)history[key].shift();}
 return next;
}
export function undoValue(draft,history,key){const stack=history[key];return stack?.length?validateDesign({...draft,[key]:stack.pop()}):draft;}
export function designForApply(applied,draft,key=null){
 if(key!==null&&!Object.hasOwn(DESIGN_DEFAULTS,key))throw Error('Unknown design setting');
 return validateDesign(key===null?draft:{...applied,[key]:draft[key]});
}
