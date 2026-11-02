import test from 'node:test';
import assert from 'node:assert/strict';
import {deriveActivity,initialState} from '../simulator/engine.js';
import {modeEyeShape} from '../simulator/renderer.js';
import {validateDesign,DESIGN_DEFAULTS,designForApply} from '../simulator/design.js';

test('modes show focus and joy even while waiting; explicit expression overrides remain available',()=>{
 assert.equal(deriveActivity({...initialState(),mode:'work'}).expression,'focused');
 assert.equal(deriveActivity({...initialState(),mode:'surf',surf:0}).expression,'happy');
 assert.equal(deriveActivity({...initialState(),mode:'sleep'}).expression,'sleeping');
 assert.equal(deriveActivity({...initialState(),mode:'work',expression:'happy'}).expression,'happy');
});
test('eye silhouettes are distinct and sleepy stretches freeze with reduced motion',()=>{
 const sample=(label,time=0,still=false)=>Array.from({length:441},(_,i)=>modeEyeShape(label,(i%21-10)/10,(Math.floor(i/21)-10)/10,0,time,still));
 const shapes=['Idle','Happy','Focused','Sleeping'].map(label=>JSON.stringify(sample(label)));
 assert.equal(new Set(shapes).size,4);
 assert.notDeepEqual(sample('Sleeping',0),sample('Sleeping',5300*Math.PI/2));
 assert.deepEqual(sample('Sleeping',0,true),sample('Sleeping',5300*Math.PI/2,true));
});
test('new finishes default safely for existing saved designs and save independently',()=>{
 const old={...DESIGN_DEFAULTS};delete old.colorMode;delete old.saturation;
 const upgraded=validateDesign(old);assert.equal(upgraded.saturation,120);assert.equal(upgraded.colorMode,'cloud');
 for(const colorMode of ['cloud','dither'])assert.equal(validateDesign({...upgraded,colorMode}).colorMode,colorMode);
 assert.throws(()=>validateDesign({...upgraded,colorMode:'unsafe'}));
 const saved=designForApply(upgraded,{...upgraded,colorMode:'dither',liveColor:'#123456'},'colorMode');
 assert.equal(saved.colorMode,'dither');assert.equal(saved.liveColor,upgraded.liveColor);
 assert.equal(validateDesign({...upgraded,colorMode:'boiling'}).colorMode,'cloud');
 assert.equal(validateDesign({...upgraded,colorMode:'paper'}).colorMode,'cloud');
});
