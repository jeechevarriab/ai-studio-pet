import test from 'node:test';
import assert from 'node:assert/strict';
import {loadInitialDesign,DESIGN_DEFAULTS} from '../simulator/design.js';
test('startup waits for the latest saved design and never displays an older cache first',async()=>{
 let finish,cachedReads=0,settled=false;
 const cloud=new Promise(resolve=>finish=resolve);
 const initial=loadInitialDesign(()=>cloud,()=>{cachedReads++;return {...DESIGN_DEFAULTS,liveColor:'#111111'};}).then(result=>{settled=true;return result;});
 await Promise.resolve();assert.equal(settled,false);assert.equal(cachedReads,0);
 finish({...DESIGN_DEFAULTS,liveColor:'#abcdef',modeOverrides:{work:{expression:'touch-3'}}});
 const result=await initial;assert.equal(result.source,'cloud');assert.equal(result.settings.liveColor,'#abcdef');assert.equal(result.settings.modeOverrides.work.expression,'touch-3');assert.equal(cachedReads,0);
});
test('startup falls back only to a validated saved copy and rejects missing data rather than using factory defaults',async()=>{
 const failed=async()=>{throw Error('offline');};
 assert.equal((await loadInitialDesign(failed,()=>({...DESIGN_DEFAULTS,liveColor:'#123456'}))).settings.liveColor,'#123456');
 await assert.rejects(loadInitialDesign(failed,()=>null),/saved design could not load/);
 await assert.rejects(loadInitialDesign(failed,()=>{throw Error('empty');}),/saved design could not load/);
});
