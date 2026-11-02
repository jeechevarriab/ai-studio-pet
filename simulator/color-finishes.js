// React Bits shader adapter. Original shaders and license retained in third-party/react-bits.
import {SHADERS} from './react-bits-shaders.js';
let surface=null,gl=null,unavailable=false;
const programs=new Map();
const vertex=`#version 300 es
in vec2 aPosition;
out vec2 vUv;
void main(){vUv=aPosition*.5+.5;gl_Position=vec4(aPosition,0.,1.);}`;
export const FINISH_MIGRATION={cloud:'aurora',boiling:'bends',paper:'silk',dither:'iridescence'};
export const finishName=value=>FINISH_MIGRATION[value]||value;
const rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255);
function oklch(hex){
 const [r,g,b]=rgb(hex).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
 const l=Math.cbrt(.4122214708*r+.5363325363*g+.0514459929*b),m=Math.cbrt(.2119034982*r+.6806995451*g+.1073969566*b),s=Math.cbrt(.0883024619*r+.2817188376*g+.6299787005*b);
 const a=1.9779984951*l-2.428592205*m+.4505937099*s,c=.0259040371*l+.7827717662*m-.808675766*s;
 return [.2104542553*l+.793617785*m-.0040720468*s,Math.hypot(a,c),Math.atan2(c,a)];
}
function initialize(){
 if(unavailable)return false;
 if(gl&&!gl.isContextLost())return true;
 if(unavailable||typeof document==='undefined')return false;
 surface=document.createElement('canvas');surface.width=328;surface.height=402;
 gl=surface.getContext('webgl2',{alpha:true,premultipliedAlpha:true,antialias:false,depth:false,preserveDrawingBuffer:true});
 if(!gl){unavailable=true;return false;}
 surface.addEventListener('webglcontextlost',event=>{event.preventDefault();programs.clear();gl=null;});
 surface.addEventListener('webglcontextrestored',()=>{unavailable=false;gl=null;});
 const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
 gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
 const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([0,0,0,255]));gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
 return true;
}
function program(mode){
 if(programs.has(mode))return programs.get(mode);
 const compile=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;};
 const p=gl.createProgram(),v=compile(gl.VERTEX_SHADER,vertex),f=compile(gl.FRAGMENT_SHADER,SHADERS[mode]);
 gl.attachShader(p,v);gl.attachShader(p,f);gl.bindAttribLocation(p,0,'aPosition');gl.linkProgram(p);gl.deleteShader(v);gl.deleteShader(f);
 if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));
 const locations={};for(let i=0;i<gl.getProgramParameter(p,gl.ACTIVE_UNIFORMS);i++){const info=gl.getActiveUniform(p,i);locations[info.name.replace('[0]','')]=gl.getUniformLocation(p,info.name);}
 const result={p,locations};programs.set(mode,result);return result;
}
export function drawColorFinish(ctx,{finish,color,time=0,dark=false,motion={x:0,y:0}}){
 const mode=finishName(finish);if(!Object.hasOwn(SHADERS,mode)||!initialize())return false;
 try{
 const {p,locations:u}=program(mode);gl.useProgram(p);gl.viewport(0,0,surface.width,surface.height);
 const f=(key,value)=>{if(u[key]!=null)gl.uniform1f(u[key],value);};
 const n=(key,value)=>{if(u[key]!=null)gl.uniform1i(u[key],value);};
 const v=(key,value)=>{if(u[key]!=null){if(value.length===2)gl.uniform2fv(u[key],value);else if(value.length===4)gl.uniform4fv(u[key],value);else gl.uniform3fv(u[key],value);}};
 const base=rgb(color),t=time/1000,tilt=[motion.x/40,motion.y/40];
 v('uResolution',[surface.width,surface.height]);v('uView',[surface.width,surface.height]);v('uCanvas',[surface.width,surface.height]);f('uTime',t*.22);f('uOpacity',1);f('uFade',0);n('uField',0);n('uBloom',0);
 if(mode==='aurora'){
  const palette=[color,'#50d9c4','#6477ff','#d1a0ff',color];
  if(u.uStops)gl.uniform3fv(u.uStops,palette.flatMap(oklch));
  n('uStopCount',5);f('uAmplitude',1.25);f('uBlend',.75);f('uHeight',.84);f('uScale',1.15);f('uGlow',.35);f('uBrightness',1);n('uLayers',3);f('uFlip',0);v('uPointer',[tilt[0],tilt[1],.1]);f('uReveal',1);f('uLightMode',0);
 }else if(mode==='iridescence'){
  v('uColor',base.map(c=>.42+c*.58));v('uMouse',[.5+tilt[0],.5+tilt[1]]);f('uAmplitude',.12);f('uScale',1.5);f('uRotation',.4);n('uDetail',6);f('uWarp',.75);f('uHue',.1);f('uSaturation',1.65);f('uBrightness',1);f('uContrast',1.25);f('uGrain',.1);f('uSeed',17);f('uStir',0);f('uSheen',.1);v('uPointer',[.5,.5,0]);
 }else if(mode==='bends'){
  v('uRot',[.8,.6]);f('uSpeed',.4);n('uColorCount',4);if(u.uColors)gl.uniform3fv(u.uColors,[color,'#ee65ae','#7366ff','#42d5cf'].flatMap(rgb).concat(new Array(12).fill(0)));
  n('uTransparent',0);f('uScale',1.15);f('uFrequency',.85);f('uWarpStrength',1);v('uPointer',tilt);f('uMouseInfluence',.2);f('uParallax',.3);f('uNoise',0);n('uIterations',1);f('uIntensity',1.5);f('uBandWidth',5.5);
 }else{
  v('uColor',base.map(c=>.08+c*.92));v('uSheenColor',[.8,.92,1]);f('uScale',.9);f('uRotation',.5);f('uWave',.5);f('uRipple',.18);f('uFold',.85);v('uShift',[0,0]);v('uPointer',[.5,.5,0,.3]);v('uDrag',tilt);f('uNoiseIntensity',.2);f('uDepth',.35);f('uSheen',.25);f('uGlow',0);f('uLightMode',0);v('uLight',[-.5,.5,0]);v('uStep',[1/surface.width,1/surface.height]);f('uPresence',1);
 }
 gl.drawArrays(gl.TRIANGLES,0,3);
 const error=gl.getError();if(error!==gl.NO_ERROR)throw Error('WebGL draw failed ('+error+')');
 ctx.save();if(mode==='bends')ctx.globalCompositeOperation='screen';ctx.globalAlpha=dark?.2:.82;ctx.drawImage(surface,0,0,410,502);ctx.restore();return true;
 }catch(error){console.warn('Mascot finish fallback:',mode,error.message);unavailable=true;return false;}
}
