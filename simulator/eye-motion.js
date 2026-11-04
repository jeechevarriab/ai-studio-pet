// Pure numeric eye configuration and motion. No DOM, timers, random render state,
// network or browser effects: the masks/timing can be ported to a framebuffer.
export const EYE_ARCHETYPES = Object.freeze([
  'Approved Lilt', 'Orbit', 'Daydream', 'Tall oval', 'Focused',
  'Soft rectangle', 'Wide curious', 'Angular', 'Asymmetric', 'Horizontal'
]);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const smooth=v=>{v=clamp(v,0,1);return v*v*(3-2*v);};
export function eyeStyleAt(value=0) {
  const v=clamp(Number.isFinite(value)?value:0,0,100),position=v/100*9;
  const index=Math.min(9,Math.floor(position)),variation=position-index;
  return {index,name:EYE_ARCHETYPES[index],variation};
}
export function eyePairForStyle(value=0) {
  const {index,variation}=eyeStyleAt(value);
  if(index===0)return [{shape:'drop',tilt:-.3,pupilX:.1,pupilY:.1},{shape:'drop',tilt:.3,pupilX:-.1,pupilY:.1}];
  if(index===1)return [{shape:'orbit',tilt:-.16,pupilX:.12,pupilY:0},{shape:'orbit',tilt:.16,pupilX:-.12,pupilY:0}];
  if(index===2)return [{shape:'crescent',tilt:-.18},{shape:'crescent',tilt:.18}];
  return [0,1].map(side=>({shape:'generated',style:index,variation,side,tilt:0,pupilX:0,pupilY:0}));
}
export function generatedEyeMask(eye,x,y) {
  const v=eye.variation||0;
  x/=1-v*.08;
  switch(eye.style) {
    case 3:return (x/.57)**2+(y/.95)**2<1;
    case 4:return x*x+(y/.65)**2<1&&y>-.25+.12*x*(eye.side?1:-1);
    case 5:return (Math.abs(x)/.8)**4+(Math.abs(y)/.7)**4<1;
    case 6:return (x/.96)**2+(y/.69)**2<1&&((x-(eye.pupilX||0))/.25)**2+((y-(eye.pupilY||0))/.43)**2>1;
    case 7:return Math.abs(x)/.95+Math.abs(y)/.86<1&&Math.abs(x)+Math.abs(y)>.34;
    case 8:return eye.side?Math.abs(y-.12*x)<.22&&Math.abs(x)<.85:(x/.67)**2+(y/.9)**2<1;
    case 9:return Math.abs(y-(.15-.28*x*x))<.13&&Math.abs(x)<.9;
    default:return false;
  }
}
const gazeKeys=[[0,0,0],[.85,0,0],[1.06,7,-2],[1.95,7,-2],[2.09,8,-3],[3.35,8,-3],[3.61,-8,-1],[5.05,-8,-1],[5.32,2,5],[6.55,2,5],[6.78,6,-5],[8.05,6,-5],[8.21,5,-4],[9.45,5,-4],[9.69,-6,-4],[11.1,-6,-4],[11.4,0,0],[12.25,0,0],[12.48,7,3],[13.6,7,3],[13.83,-5,2],[14.95,-5,2],[15.18,0,-5],[16.15,0,-5],[16.47,0,0],[18,0,0]];
function gazeAt(time) {
  const t=((time/1000)%18+18)%18;
  for(let i=1;i<gazeKeys.length;i++)if(t<=gazeKeys[i][0]){
    const a=gazeKeys[i-1],b=gazeKeys[i],u=1-(1-clamp((t-a[0])/(b[0]-a[0]),0,1))**3;
    return {x:a[1]+(b[1]-a[1])*u,y:a[2]+(b[2]-a[2])*u};
  }
  return {x:0,y:0};
}
function blinkEnvelope(elapsed,duration) {
  if(elapsed<0||elapsed>=duration)return 1;
  const p=elapsed/duration;
  return p<.32?1-smooth(p/.32):p<.44?0:smooth((p-.44)/.56);
}
export function eyeMotionAt(time=0,config={},expression='Idle',{still=false,manualBlinkAt=-Infinity}={}) {
  const t=Math.max(0,Number.isFinite(time)?time:0);
  const duration=clamp(config.eyeBlinkDuration??180,80,500);
  const focused=expression==='Focused',sleeping=expression==='Sleeping';
  const interval=clamp(config.eyeBlinkInterval??5.1,1,15)*1000*(focused?1.22:1);
  let openness=clamp(config.eyeOpenness??1,0,1);
  if(sleeping)openness=0;
  if(!still&&!sleeping){
    const cycle=Math.floor(t/interval),phase=t-cycle*interval;
    // Deterministic variation, occasional double blink, no per-frame randomness.
    const double=cycle%4===2&&interval>duration*1.86+180;
    const start=Math.min(interval*(.62+((cycle*7)%5)*.035),interval-duration*(double?1.86:1)-(double?160:20));
    let blink=blinkEnvelope(phase-start,duration);
    if(double)blink=Math.min(blink,blinkEnvelope(phase-start-duration-130,duration*.86));
    blink=Math.min(blink,blinkEnvelope(t-manualBlinkAt,duration));
    openness*=blink;
  }
  const gaze=!still&&!sleeping&&config.eyeTracking!==false?gazeAt(t):{x:0,y:0};
  if(focused){gaze.x*=.55;gaze.y*=.55;}
  return {openness,gaze,closedBlend:1-smooth(openness/.23),duration,interval};
}
