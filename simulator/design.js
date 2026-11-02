const range=(key,label,value,min,max,step=1)=>({key,label,value,min,max,step,type:'range'});
const color=(key,label,value)=>({key,label,value,type:'color'});
const toggle=(key,label,value)=>({key,label,value,type:'checkbox'});
const text=(key,label,value)=>({key,label,value,type:'text'});
export const DESIGN_GROUPS=[
 {id:'colors',label:'Color',description:'A different world for every mode.',fields:[
  color('liveColor','LIVE mascot','#66f4d5'),color('liveBackground','LIVE background','#050909'),
  color('workColor','WORK mascot','#ff392c'),color('workBackground','WORK background','#f2efed'),
  color('surfColor','PLAY mascot','#01070b'),color('surfBackground','PLAY background','#078fe3'),
  color('sleepColor','SLEEP mascot','#b2a9ee'),color('sleepBackground','SLEEP background','#050909'),
  toggle('colorCycle','Slow LIVE color cycle',true),range('cycleSeconds','Color cycle · seconds',240,60,600,10),
  color('cycle2','Cycle · sky','#8fcfff'),color('cycle3','Cycle · lavender','#b2a9ee'),color('cycle4','Cycle · rose','#f3a3b5'),color('cycle5','Cycle · lime','#b4f483')
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
export const DESIGN_DEFAULTS=Object.fromEntries(DESIGN_FIELDS.map(f=>[f.key,f.value]));
export function validateDesign(input){
 if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(k=>!Object.hasOwn(DESIGN_DEFAULTS,k)))throw Error('Unknown design setting');
 const result={...DESIGN_DEFAULTS};
 for(const f of DESIGN_FIELDS){if(!Object.hasOwn(input,f.key))continue;const v=input[f.key];
  if(f.type==='range'&&(!Number.isFinite(v)||v<f.min||v>f.max))throw Error('Invalid '+f.label);
  if(f.type==='checkbox'&&typeof v!=='boolean')throw Error('Invalid '+f.label);
  if(f.type==='color'&&(typeof v!=='string'||!/^#[0-9a-f]{6}$/i.test(v)))throw Error('Invalid '+f.label);
  if(f.type==='text'&&(typeof v!=='string'||v.length<1||v.length>12||!/^[\x21-\x7e]+$/.test(v)))throw Error('Use 1–12 printable characters');
  if(f.type==='select'&&!f.options.includes(v))throw Error('Invalid expression');
  result[f.key]=v;
 }return result;
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
