// Timing and gaze only. All eye types, glyphs and appearance remain in the existing renderer.
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const smooth=v=>{v=clamp(v,0,1);return v*v*(3-2*v);};
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
