import {startEyePreview} from './eye-integration-preview.mjs';
import {createRequire} from 'node:module';
import {writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const {chromium}=createRequire('C:/Users/Chapito/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json')('playwright');
const fixture=await startEyePreview(),browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
const out=new URL('../docs/eyes-v3-integration/',import.meta.url);await mkdir(out,{recursive:true});
try{
 const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,serviceWorkers:'block'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(fixture.url+'/app');await page.waitForTimeout(1500);
 const result=await page.evaluate(async()=>{
  const {renderScene}=await import('/simulator/renderer.js'),old=await import('/__baseline.js');
  const {designDefinition,resolveModeDesign}=await import('/simulator/design.js');
  const {bindEyeAttention,projectEyePoint}=await import('/simulator/eye-surface.js');
  const base=await(await fetch('/character/expressions.json')).json(),settings=await(await fetch('/api/design')).json();
  const def=designDefinition(base,resolveModeDesign(settings.settings,'live'));
  const canvas=()=>{const c=document.createElement('canvas');c.width=410;c.height=502;return c;};
  let changed=0;for(const mode of ['live','work','surf','sleep'])for(const attention of [0,1]){
   const d=designDefinition(base,resolveModeDesign(settings.settings,mode));
   const pixels=renderer=>{const c=canvas(),ctx=c.getContext('2d');ctx.fillText=()=>{};renderer(ctx,{version:'v2',activity:{mode,expression:mode==='sleep'?'sleeping':'idle'},definition:d,time:2300,motion:{x:2,y:-1},attention});return ctx.getImageData(0,0,410,502).data;};
   const a=pixels(renderScene),b=pixels(old.renderScene);changed+=a.reduce((n,v,i)=>n+(v!==b[i]?1:0),0);
  }
  const images=[];for(let i=0;i<10;i++){const c=canvas(),ctx=c.getContext('2d');renderScene(ctx,{version:'v2',activity:{mode:'live',expression:'idle'},definition:def,time:1500,touchEye:i,motion:{x:0,y:0,eyePose:{yaw:.16,pitch:-.22,expression:1,blink:1}}});images.push(c.toDataURL());}
  const el=document.createElement('div');el.style='position:fixed;left:0;top:0;width:410px;height:502px';document.body.append(el);let attention=0;const input=bindEyeAttention(el,()=>attention);const event=(type,x,y,extra={})=>el.dispatchEvent(new PointerEvent(type,{pointerId:71,pointerType:'touch',isPrimary:true,button:0,clientX:x,clientY:y,...extra}));
  event('pointerdown',205,237);event('pointermove',350,400);let p;for(let i=0;i<10;i++)p=input.update(50,0);const down=p.yaw>.2&&p.pitch>.18;
  event('pointermove',40,40);for(let i=0;i<10;i++)p=input.update(50,0);const up=p.yaw<-.2&&p.pitch<-.2;
  event('pointercancel',0,0);for(let i=0;i<15;i++)p=input.update(50,0);const released=Math.abs(p.yaw)<.01&&Math.abs(p.pitch)<.01;
  attention=1;for(let i=0;i<15;i++)p=input.update(50,0);const menu=p.pitch<-.23;el.remove();
  return {bodyBytesChanged:changed,allTenStylesDistinct:new Set(images).size===10,down,up,released,menu,projectionVertical:projectEyePoint(205,237,237,0,-.24).y<200};
 });
 assert.equal(result.bodyBytesChanged,0);for(const [key,value] of Object.entries(result))if(key!=='bodyBytesChanged')assert.equal(value,true,key);
 const device=page.locator('#device');await device.tap();await page.waitForTimeout(650);assert(await device.evaluate(e=>e.classList.contains('controls-visible')));
 await page.screenshot({path:fileURLToPath(new URL('app-menu.png',out))});
 await device.press('Escape');await page.waitForTimeout(500);const b=await device.boundingBox(),cdp=await page.context().newCDPSession(page);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:b.x+b.width*.4,y:b.y+b.height*.5,id:1}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:b.x+b.width*.6,y:b.y+b.height*.7,id:1}]});await page.waitForTimeout(300);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(300);assert(!(await device.evaluate(e=>e.classList.contains('controls-visible'))));
 await page.goto(fixture.url+'/customize');await page.getByRole('tab',{name:'Face',exact:true}).click();assert(await page.getByText('Orbit',{exact:true}).count()>0);assert.equal(fixture.state().writes,0);assert.equal(errors.length,0);
 const report={...result,tapMenuAndZoom:true,touchDragPreservesMenuState:true,editorEyeListPresent:true,settingsWrites:fixture.state().writes,errors,physicalIphoneTested:false};await writeFile(new URL('validation.json',out),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}finally{await browser.close();await new Promise(r=>fixture.server.close(r));}
