// React Bits Dither, David Haz, pinned 4dc7b5b. MIT + Commons Clause.
// Original shaders/license: third-party/react-bits. App clock and input adapter below.
import {SHADERS} from './react-bits-shaders.js';
import {DITHER_PALETTES} from './design.js';
export const finishName=value=>value==='dither'?'dither':'cloud';
const pages=new Map(),programs=new Map();
let surface,gl,buffer,texture,framebuffer,fieldSize='',unavailable=false;
const vertex=`#version 300 es
in vec2 aPosition;void main(){gl_Position=vec4(aPosition,0.,1.);}`;
const stateFor=page=>{if(!pages.has(page))pages.set(page,{input:{x:.5,y:.5,inside:false},trail:[],ripples:[],last:null,waveTime:0,intro:0,active:false});return pages.get(page);};
export function setDitherPointer(page,input){const state=stateFor(page);state.input={...state.input,...input};if(input.click){state.ripples.push({x:input.x,y:input.y,at:input.time});if(state.ripples.length>4)state.ripples.shift();}}
function initialize(){
 if(unavailable||typeof document==='undefined')return false;
 if(gl&&!gl.isContextLost())return true;
 surface=document.createElement('canvas');
 gl=surface.getContext('webgl2',{alpha:true,premultipliedAlpha:true,antialias:false,depth:false,preserveDrawingBuffer:true});
 if(!gl){unavailable=true;return false;}
 surface.addEventListener('webglcontextlost',event=>{event.preventDefault();gl=null;programs.clear();fieldSize='';});
 buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
 texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);framebuffer=gl.createFramebuffer();return true;
}
function program(name){
 if(programs.has(name))return programs.get(name);
 const compile=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;};
 const p=gl.createProgram(),v=compile(gl.VERTEX_SHADER,vertex),f=compile(gl.FRAGMENT_SHADER,SHADERS[name]);gl.attachShader(p,v);gl.attachShader(p,f);gl.bindAttribLocation(p,0,'aPosition');gl.linkProgram(p);gl.deleteShader(v);gl.deleteShader(f);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));
 const u={};for(let i=0;i<gl.getProgramParameter(p,gl.ACTIVE_UNIFORMS);i++){const info=gl.getActiveUniform(p,i);u[info.name.replace('[0]','')]=gl.getUniformLocation(p,info.name);}
 const result={p,u};programs.set(name,result);return result;
}
const linear=hex=>[1,3,5].map(i=>{const v=parseInt(hex.slice(i,i+2),16)/255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;});
export function drawColorFinish(ctx,{finish,time=0,page='live',settings={},still=false}){
 const state=stateFor(page);
 if(finishName(finish)!=='dither'){state.active=false;return false;}
 if(!initialize())return false;
 try{
 const s=settings,ratio=s.ditherDetail??1,cellCss=s.ditherPixelSize??2;
 const width=Math.round(410*ratio),height=Math.round(502*ratio),cell=Math.max(1,Math.round(cellCss*ratio));
 if(surface.width!==width||surface.height!==height){surface.width=width;surface.height=height;}
 const cols=Math.ceil(width/cell),rows=Math.ceil(height/cell),size=cols+':'+rows;
 gl.bindTexture(gl.TEXTURE_2D,texture);
 if(size!==fieldSize){gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA8,cols,rows,0,gl.RGBA,gl.UNSIGNED_BYTE,null);gl.bindFramebuffer(gl.FRAMEBUFFER,framebuffer);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,texture,0);if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE)throw Error('Incomplete wave buffer');fieldSize=size;}
 if(!state.active){state.active=true;state.intro=0;state.last=time;state.trail=[];}
 if(s.ditherIntro&&state.lastIntro===false)state.intro=0;state.lastIntro=s.ditherIntro;
 const dt=state.last===null?0:Math.max(0,Math.min(.1,(time-state.last)/1000));state.last=time;
 if(!still&&!s.ditherDisableAnimation)state.waveTime+=dt;
 if(still||s.ditherIntro===false)state.intro=1;else state.intro=Math.min(1,state.intro+dt/1.8);
 const point=state.input,toUv=(x,y)=>[(x-.5)*410/502,.5-y];
 if(still||!s.ditherMouse)state.trail=[];
 else{
  const decay=Math.exp(-dt/(.08+(s.ditherTrail??.5)*.7));state.trail.forEach(p=>p.weight*=decay);state.trail=state.trail.filter(p=>p.weight>.01);
  if(point.inside){const [x,y]=toUv(point.x,point.y),head=state.trail[0];if(!head||Math.hypot(x-head.x,y-head.y)>.012)state.trail.unshift({x,y,weight:1});else head.weight=1;}
  state.trail.length=Math.min(state.trail.length,(s.ditherTrail??.5)===0?1:16);
 }
 state.ripples=state.ripples.filter(p=>time-p.at<1600&&time>=p.at);
 const trail=new Float32Array(48),ripples=new Float32Array(16);
 state.trail.forEach((p,i)=>trail.set([p.x,p.y,p.weight],i*3));
 const rings=still||!s.ditherClickRipple?[]:state.ripples;rings.forEach((p,i)=>{const [x,y]=toUv(p.x,p.y);ripples.set([x,y,(time-p.at)/1000,1],i*4);});
 const wave=program('wave');gl.useProgram(wave.p);gl.bindFramebuffer(gl.FRAMEBUFFER,framebuffer);gl.viewport(0,0,cols,rows);
 const w=wave.u;gl.uniform2f(w.uResolution,410,502);gl.uniform1f(w.uCell,cell/ratio);gl.uniform1f(w.uTime,state.waveTime);gl.uniform1f(w.uWaveSpeed,s.ditherSpeed??.05);gl.uniform1f(w.uWaveFrequency,s.ditherFrequency??3);gl.uniform1f(w.uWaveAmplitude,s.ditherAmplitude??.3);gl.uniform1f(w.uScale,s.ditherScale??1);gl.uniform1f(w.uContrast,s.ditherContrast??1);gl.uniform1f(w.uBrightness,s.ditherBrightness??0);gl.uniform1i(w.uEffect,({erase:0,reveal:1,ripple:2})[s.ditherMouseEffect]??0);gl.uniform1f(w.uRadius,s.ditherMouseRadius??.3);gl.uniform1f(w.uStrength,s.ditherMouseStrength??1);gl.uniform3fv(w.uTrail,trail);gl.uniform1i(w.uTrailCount,state.trail.length);gl.uniform4fv(w.uRipples,ripples);gl.uniform1i(w.uRippleCount,rings.length);gl.uniform1f(w.uIntro,state.intro*state.intro*(3-2*state.intro));gl.uniform1f(w.uReach,.5*Math.hypot(410/502,1)+.45);gl.drawArrays(gl.TRIANGLES,0,3);
 const dither=program('dither'),d=dither.u;gl.useProgram(dither.p);gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,width,height);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);gl.uniform1i(d.uField,0);gl.uniform2i(d.uFieldSize,cols,rows);gl.uniform1f(d.uCellDevice,cell);gl.uniform1i(d.uMode,({bayer:0,bayer4:1,bayer2:2,halftone:3,lines:4,crosshatch:5,noise:6,none:7})[s.ditherPattern]??0);gl.uniform1f(d.uColorNum,s.ditherColors??4);gl.uniform3fv(d.uWave,linear(s.ditherWaveColor||'#bcbcbc'));gl.uniform3fv(d.uBackground,linear(s.ditherBackground||'#120f17'));gl.uniform1f(d.uTransparent,s.ditherTransparent?1:0);
 const colors=s.ditherPalette==='custom'?Array.from({length:s.ditherPaletteCount??4},(_,i)=>s['ditherPalette'+(i+1)]):DITHER_PALETTES[s.ditherPalette]||[];
 const palette=new Float32Array(24);colors.forEach((c,i)=>palette.set(linear(c),i*3));gl.uniform3fv(d.uPalette,palette);gl.uniform1i(d.uPaletteCount,colors.length);gl.drawArrays(gl.TRIANGLES,0,3);
 const error=gl.getError();if(error!==gl.NO_ERROR)throw Error('WebGL draw failed ('+error+')');
 ctx.save();ctx.imageSmoothingEnabled=false;ctx.drawImage(surface,0,0,410,502);ctx.restore();return true;
 }catch(error){console.warn('Mascot Dither fallback:',error.message);unavailable=true;return false;}
}
