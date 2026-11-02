import test from 'node:test';
import assert from 'node:assert/strict';
import {DESIGN_DEFAULTS,validateDesign,resolveModeDesign,randomizeDither,restoreDitherRandomization,editModeValue,designForModeApply} from '../simulator/design.js';
test('random looks remain valid and affect only Dither in the selected mode; undo restores the previous look',()=>{
 const base=editModeValue(validateDesign(DESIGN_DEFAULTS),{},'work','eyeSize',120);
 const looks=new Set();
 for(let seed=1;seed<=50;seed++){
  let n=seed;const random=()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};
  const result=randomizeDither(base,'work',random),work=resolveModeDesign(result.draft,'work');
  assert.equal(work.colorMode,'dither');assert.equal(work.ditherPreset,'custom');assert.equal(work.eyeSize,120);
  assert.deepEqual(resolveModeDesign(result.draft,'live'),resolveModeDesign(base,'live'));
  assert.equal(resolveModeDesign(restoreDitherRandomization(result.draft,'work',result.snapshot),'work').colorMode,'cloud');
  const saved=designForModeApply(base,result.draft,'work','ditherPreset');assert.equal(resolveModeDesign(saved,'work').ditherPalette,work.ditherPalette);
  looks.add(JSON.stringify(work));
 }
 assert(looks.size>40);
});
