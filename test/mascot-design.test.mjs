import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {eyeDots,homeColor} from '../simulator/renderer.js';
import {validateDefinitions} from '../simulator/engine.js';
const character=JSON.parse(readFileSync(new URL('../character/expressions.json',import.meta.url),'utf8'));
test('ten original eye pairs produce distinct nonempty bounded dot patterns',()=>{
  validateDefinitions(character);
  const patterns=character.touchEyes.map(e=>[eyeDots(e.left),eyeDots(e.right)]);
  assert.equal(new Set(patterns.map(p=>JSON.stringify(p))).size,10);
  for(const pair of patterns)for(const dots of pair){assert.ok(dots.length>8);assert.ok(dots.every(([x,y])=>Math.abs(x)<=6&&Math.abs(y)<=5));}
  const bad=structuredClone(character);bad.touchEyes[0].left.shape='unknown';assert.throws(()=>validateDefinitions(bad));
});
test('home color completes a seamless slow cycle and task diffusion is 30 percent wider',()=>{
  const p=character.presentationV2,base=p.modeColors.live;
  assert.equal(homeColor(p,base,0),base);assert.equal(homeColor(p,base,p.homeCycleMs),base);
  assert.notEqual(homeColor(p,base,p.homeCycleMs/5),base);
  assert.equal(homeColor(p,base,p.homeCycleMs-1),base);
  assert.equal(p.task.feather,10*1.3);
});
test('smaller eye dots use more samples while preserving the original eye coordinate bounds',()=>{
  assert.equal(character.presentationV2.eyeDotMultiplier,.6);
  assert.equal(character.presentationV2.eyeSizeMultiplier,1.4);
  for(const e of character.touchEyes)for(const side of ['left','right']){
    const detailed=eyeDots(e[side],2),original=eyeDots(e[side]);
    assert.ok(detailed.length>original.length*2);
    assert.ok(detailed.every(([x,y])=>Math.abs(x)<=6&&Math.abs(y)<=5));
  }
});
