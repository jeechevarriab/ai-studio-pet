import test from 'node:test';
import assert from 'node:assert/strict';
import {validateDesign,DESIGN_DEFAULTS,cloudSettingKeys,randomizeCloud,restoreCloudRandomization,resolveModeDesign,designForModeApply,editModeValue} from '../simulator/design.js';
test('Cloud randomization is valid, isolated, undoable and preserves eyes and Dither',()=>{
 const base=editModeValue(validateDesign(DESIGN_DEFAULTS),{},'work','expression','touch-3');
 for(const mode of ['live','work','surf','sleep'])for(const value of [0,.25,.6,.999]){
  const result=randomizeCloud(base,mode,()=>value),look=resolveModeDesign(result.draft,mode);
  assert.equal(look.colorMode,'cloud');assert.equal(look.expression,resolveModeDesign(base,mode).expression);assert.equal(look.ditherSpeed,base.ditherSpeed);
  for(const other of ['live','work','surf','sleep'].filter(m=>m!==mode)){
   assert.equal(resolveModeDesign(result.draft,other).bodyWidth,resolveModeDesign(base,other).bodyWidth);
   assert.equal(result.draft[other+'Color'],base[other+'Color']);
  }
  const restored=resolveModeDesign(restoreCloudRandomization(result.draft,mode,result.snapshot),mode);
  for(const key of cloudSettingKeys(mode))assert.equal(restored[key],resolveModeDesign(base,mode)[key]);
 }
});
test('Apply Cloud look saves its colors and finish without other pending edits',()=>{
 const base=validateDesign(DESIGN_DEFAULTS);let draft=randomizeCloud(base,'live',()=>.6).draft;
 draft=editModeValue(draft,{},'live','eyeSize',125);draft=editModeValue(draft,{},'work','ditherSpeed',.1);
 const saved=designForModeApply(base,draft,'live','cloudLook');
 assert.equal(saved.liveColor,draft.liveColor);assert.equal(resolveModeDesign(saved,'live').diffusion,resolveModeDesign(draft,'live').diffusion);
 assert.equal(resolveModeDesign(saved,'live').eyeSize,100);assert.equal(resolveModeDesign(saved,'work').ditherSpeed,.05);
});
