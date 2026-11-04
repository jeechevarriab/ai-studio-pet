import {writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {startEyePreview} from './eye-integration-preview.mjs';
const out=new URL('../docs/eye-integration/',import.meta.url);
const {chromium}=createRequire('C:/Users/Chapito/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json')('playwright');
const fixture=await startEyePreview(),browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
const page=await browser.newPage({serviceWorkers:'block'});
try{
 await page.goto(fixture.url+'/customize');
 const bodies=await page.evaluate(async()=>{
  const modern=await import('/simulator/renderer.js'),before=await import('/__baseline.js'),design=await import('/simulator/design.js'),base=await(await fetch('/character/expressions.json')).json(),restore=await(await fetch('/character/cloud-default-design.json')).json(),results=[];
  function render(module,definition,mode,time,reducedMotion){const c=document.createElement('canvas');c.width=410;c.height=502;const ctx=c.getContext('2d');ctx.fillText=()=>{};module.renderSceneV2(ctx,{activity:{mode,expression:mode==='sleep'?'sleeping':'idle'},definition,time,reducedMotion,motion:{x:5,y:-3},attention:0});return ctx.getImageData(0,0,410,502).data;}
  for(const mode of ['live','work','surf','sleep']){const def=design.designDefinition(base,design.resolveModeDesign(design.validateDesign(restore.settings),mode)),ref=render(before,def,mode,0,true);for(const t of [0,2800,9000]){const actual=render(modern,def,mode,t,false);let changedChannels=0;for(let i=0;i<actual.length;i++)if(actual[i]!==ref[i])changedChannels++;results.push({mode,time:t,changedChannels});}}
  return results;
 });
 await writeFile(new URL('body-validation.json',out),JSON.stringify(bodies,null,2));
 const playback=await page.evaluate(async()=>{
  document.dispatchEvent(new CustomEvent('mascot-eye-preview',{detail:{action:'pause'}}));
  const video=document.createElement('video');video.src='/docs/eye-integration/editor-demo.mp4';video.muted=true;document.body.append(video);await new Promise((r,j)=>{video.onloadeddata=r;video.onerror=j;});
  const sheet=document.createElement('canvas');sheet.width=1300;sheet.height=1818;const c=sheet.getContext('2d');c.fillStyle='#10151b';c.fillRect(0,0,1300,1818);const targets=[1.7,3.6,5.8,9.8,13.8,17.8],captured=[];let n=0,decodedFrames=0;
  function frame(now,m){decodedFrames++;if(n<targets.length&&m.mediaTime>=targets[n]){const x=n%2*650,y=Math.floor(n/2)*606;c.drawImage(video,x,y,650,566);c.fillStyle='#dceaf3';c.font='13px monospace';c.fillText(m.mediaTime.toFixed(2)+' seconds',x+24,y+590);captured.push(m.mediaTime);n++;}if(!video.ended)video.requestVideoFrameCallback(frame);}
  video.requestVideoFrameCallback(frame);await video.play();await new Promise((r,j)=>{video.onended=r;video.onerror=j;});
  return {duration:video.duration,width:video.videoWidth,height:video.videoHeight,decodedFrames,captured,ended:video.ended,sheet:sheet.toDataURL()};
 });
 await writeFile(new URL('playback-review.png',out),Buffer.from(playback.sheet.split(',')[1],'base64'));delete playback.sheet;
 await writeFile(new URL('playback-validation.json',out),JSON.stringify(playback,null,2));
 console.log(JSON.stringify({bodyPixelComparisons:bodies.length,bodyDifferences:bodies.reduce((n,r)=>n+r.changedChannels,0),playback}));
 if(bodies.some(x=>x.changedChannels)||!playback.ended)process.exitCode=1;
}finally{await browser.close();await new Promise(r=>fixture.server.close(r));}
