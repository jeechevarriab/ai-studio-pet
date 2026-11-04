import {writeFile,readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {startEyePreview} from './eye-integration-preview.mjs';
const out=new URL('../docs/eye-integration/',import.meta.url);
const {chromium}=createRequire('C:/Users/Chapito/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json')('playwright');
const fixture=await startEyePreview(),browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000},serviceWorkers:'block'});page.setDefaultTimeout(4000);
try{
 await page.goto(fixture.url+'/customize');await page.getByRole('tab',{name:'Face',exact:true}).click();
 const result=await page.evaluate(async()=>{
  const {eyeStyleAt}=await import('/simulator/eye-motion.js');
  document.querySelector('#edit-face button').textContent; // actual mounted editor
  document.dispatchEvent(new CustomEvent('mascot-eye-preview',{detail:{action:'play'}}));
  function set(key,value){const el=document.querySelector('#setting-'+key);if(el.type==='checkbox')el.checked=value;else el.value=String(value);el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));}
  set('eyeSize',100);set('eyeSeparation',100);set('eyeDensity',2);set('eyeOpenness',1);set('eyeGlow',0);set('eyeTracking',true);set('eyeStyle',0);
  const source=document.querySelector('#pet-canvas'),canvas=document.createElement('canvas');canvas.width=650;canvas.height=566;const c=canvas.getContext('2d');
  const stream=canvas.captureStream(30),chunks=[],recorder=new MediaRecorder(stream,{mimeType:'video/mp4;codecs=avc1',videoBitsPerSecond:2200000});
  const finished=new Promise(r=>recorder.onstop=r);recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
  const values=[0,12,38,60,86];let active=-1;const start=performance.now();recorder.start();
  await new Promise(resolve=>{function frame(now){const t=(now-start)/1000,index=Math.min(4,Math.floor(t/4));if(index!==active){active=index;set('eyeStyle',values[index]);}c.fillStyle='#0c1118';c.fillRect(0,0,650,566);c.fillStyle='#dceaf3';c.font='15px system-ui';c.fillText('AI STUDIO PET · '+eyeStyleAt(values[index]).name,24,34);c.font='11px system-ui';c.fillStyle='#9dafbd';c.fillText('Actual Face preview / Generator '+values[index]+' / Body fixed',24,53);c.drawImage(source,120,64,410,502);if(t<20)requestAnimationFrame(frame);else resolve();}requestAnimationFrame(frame);});
  recorder.stop();await finished;stream.getTracks().forEach(t=>t.stop());
  const blob=new Blob(chunks,{type:'video/mp4'}),data=await new Promise(r=>{const reader=new FileReader();reader.onload=()=>r(reader.result);reader.readAsDataURL(blob);});
  return {data,styles:values.map(value=>({value,name:eyeStyleAt(value).name}))};
 });
 await writeFile(new URL('editor-demo.mp4',out),Buffer.from(result.data.split(',')[1],'base64'));
 await writeFile(new URL('demo-styles.json',out),JSON.stringify(result.styles,null,2));
 console.log(JSON.stringify({saved:'docs/eye-integration/editor-demo.mp4',styles:result.styles}));
}finally{await browser.close();await new Promise(r=>fixture.server.close(r));}
