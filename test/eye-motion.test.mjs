import test from 'node:test';
import assert from 'node:assert/strict';
import {eyeMotionAt} from '../simulator/eye-motion.js';
test('blink duration and frequency are independent, with smooth intermediate states',()=>{
 const short=eyeMotionAt(650,{eyeBlinkInterval:1,eyeBlinkDuration:100});
 const long=eyeMotionAt(650,{eyeBlinkInterval:1,eyeBlinkDuration:400});
 assert.notEqual(short.openness,long.openness);
 assert.equal(short.interval,long.interval);
 const states=Array.from({length:150},(_,i)=>eyeMotionAt(i*10,{eyeBlinkInterval:1,eyeBlinkDuration:200}).openness);
 assert.ok(states.some(x=>x===0));assert.ok(states.some(x=>x>0&&x<1));assert.ok(states.some(x=>x===1));
});
test('scheduled double blinks are deterministic',()=>{
 const config={eyeBlinkInterval:1,eyeBlinkDuration:180};
 assert.ok(eyeMotionAt(2575,config).openness<.1);
 assert.ok(eyeMotionAt(2877,config).openness<.2);
 assert.deepEqual(eyeMotionAt(2877,config),eyeMotionAt(2877,config));
});
test('manual blink uses the same animation clock',()=>{
 assert.equal(eyeMotionAt(5000,{eyeBlinkInterval:15,eyeBlinkDuration:200},'Idle',{manualBlinkAt:4930}).openness,0);
 assert.equal(eyeMotionAt(5300,{eyeBlinkInterval:15},'Idle',{manualBlinkAt:4930}).openness,1);
});
test('manual openness, tracking off, sleeping and reduced motion are respected',()=>{
 assert.equal(eyeMotionAt(0,{eyeOpenness:.5}).openness,.5);
 assert.deepEqual(eyeMotionAt(4000,{eyeTracking:false}).gaze,{x:0,y:0});
 assert.equal(eyeMotionAt(4000,{},'Sleeping').openness,0);
 assert.deepEqual(eyeMotionAt(4000,{},'Sleeping').gaze,{x:0,y:0});
 assert.deepEqual(eyeMotionAt(4000,{eyeOpenness:.7},'Idle',{still:true}).gaze,{x:0,y:0});
 assert.equal(eyeMotionAt(4000,{eyeOpenness:.7},'Idle',{still:true}).openness,.7);
});
test('natural gaze stays bounded',()=>{for(let t=0;t<18000;t+=50){const {gaze}=eyeMotionAt(t);assert.ok(Math.abs(gaze.x)<=8&&Math.abs(gaze.y)<=5);}});
