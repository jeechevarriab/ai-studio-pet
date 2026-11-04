// Seconds, yaw, pitch (negative = up), lid openness, intention.
// Holds make attention readable; short eased changes suggest eye saccades.
export const keys=[
 [0,0,0,1,'Hello'],[1.2,0,0,1,'Hello'],
 [1.55,-.16,-.055,1.04,'Curious'],[2.6,-.16,-.055,1.04,'Curious'],
 [3,0,-.24,1.06,'Menu noticed'],[4.5,0,-.24,1.06,'Menu noticed'],
 [4.78,-.2,-.22,.9,'Reading left'],[6.3,-.2,-.22,.9,'Reading left'],
 [6.55,0,-.26,.94,'Reading middle'],[7.8,0,-.26,.94,'Reading middle'],
 [8.1,.2,-.22,.9,'Reading right'],[9.5,.2,-.22,.9,'Reading right'],
 [9.9,0,0,.82,'Warm acknowledgment'],[11.3,0,0,.82,'Warm acknowledgment'],
 [11.65,-.16,.19,1,'Something below'],[13.2,-.16,.19,1,'Something below'],
 [13.5,.12,.22,.92,'Following below'],[14.9,.12,.22,.92,'Following below'],
 [15.3,.24,-.12,1.06,'A little curious'],[16.8,.24,-.12,1.06,'A little curious'],
 [17.15,-.19,.06,.86,'Thinking'],[18.6,-.19,.06,.86,'Thinking'],
 [19,0,0,.78,'Content'],[20.6,0,0,.78,'Content'],
 [21.2,0,0,1,'Back to you'],[24,0,0,1,'Back to you']
];
export const ease=t=>t*t*(3-2*t);
export function projectEyePoint(x,y,centerY,yaw=0,pitch=0){
 const radius=195,lon=(x-205)/radius+yaw,lat=(y-centerY)/205;
 const depth=Math.cos(lon)*Math.cos(lat*.3),perspective=780/(780+radius*(1-depth));
 return {x:205+radius*Math.sin(lon)*Math.cos(lat*.3)*perspective,
  y:centerY+(205*Math.sin(lat)*Math.cos(pitch)+radius*depth*Math.sin(pitch))*perspective+6*(1-Math.cos(lon)),facing:Math.max(.25,Math.cos(lon))};
}
// Read-only pointer attention; existing tap, swipe and long-press handlers own gestures.
export function bindEyeAttention(device,getAttention,getZoom=()=>1.3){
 const target={active:false,x:0,y:0},pose={yaw:0,pitch:0};let held=null;
 const locate=e=>{const r=device.getBoundingClientRect();target.x=(e.clientX-r.left)/r.width*410;target.y=(e.clientY-r.top)/r.height*502;target.active=true;};
 device.addEventListener('pointerdown',e=>{if(e.isPrimary&&e.button===0){held=e.pointerId;locate(e);}});
 device.addEventListener('pointermove',e=>{if(e.pointerType==='mouse'||e.pointerId===held)locate(e);});
 const release=e=>{if(e.pointerId===held){held=null;target.active=false;}};
 device.addEventListener('pointerup',release);device.addEventListener('pointercancel',release);device.addEventListener('lostpointercapture',release);
 device.addEventListener('pointerleave',()=>{if(held===null)target.active=false;});
 window.addEventListener('blur',()=>{held=null;target.active=false;});
 return {update(delta,time,still=false){
  const attention=getAttention(),idle=poseAt(time);
  let yaw=still?0:idle.yaw,pitch=still?0:idle.pitch;
  if(attention>.01){yaw=0;pitch=-.24*attention;}
  if(target.active){const zoom=1+attention*(getZoom()-1),faceY=249+attention*231+(237-attention*27-249)*zoom;
   yaw=.4*Math.max(-.24,Math.min(.24,(target.x-205)/(195*zoom)));
   pitch=.4*Math.max(-.24,Math.min(.22,(target.y-faceY)/(195*zoom)));}
  const u=still?1:1-Math.exp(-Math.min(delta,100)/(target.active?150:85));
  pose.yaw+=(yaw-pose.yaw)*u;pose.pitch+=(pitch-pose.pitch)*u;
  return {...pose,expression:still||target.active||attention>.01?1:idle.expression,blink:still||target.active||attention>.01?1:idle.blink};
 }};
}
export function poseAt(ms){
 const t=((ms/1000)%24+24)%24;
 let i=1;while(i<keys.length-1&&t>keys[i][0])i++;
 const a=keys[i-1],b=keys[i],u=ease((t-a[0])/(b[0]-a[0]));
 const mix=n=>a[n]+(b[n]-a[n])*u;
 // Deliberate soft blink on acknowledgment, with a slower reopening.
 const pulse=(start,duration)=>{const p=(t-start)/duration;return p<0||p>1?1:p<.3?1-ease(p/.3):ease((p-.3)/.7);};
 return {yaw:mix(1),pitch:mix(2),expression:mix(3),blink:Math.min(pulse(10,.36),pulse(19.4,.48)),label:b[4],menu:t>=2.8&&t<9.8};
}
