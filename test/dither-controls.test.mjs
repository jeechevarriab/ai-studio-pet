import test from 'node:test';
import assert from 'node:assert/strict';
import {validateDesign,DESIGN_DEFAULTS,editModeValue,undoModeValue,designForModeApply,resolveModeDesign,DITHER_SETTING_KEYS,reconcileSavedDesign} from '../simulator/design.js';
test('removed finishes migrate to original Cloud without resetting per-mode eyes',()=>{
 for(const colorMode of ['aurora','iridescence','bends','silk','boiling','paper']){
  const design=validateDesign({...DESIGN_DEFAULTS,colorMode,modeOverrides:{work:{colorMode,expression:'touch-3'}}});
  assert.equal(design.colorMode,'cloud');assert.equal(resolveModeDesign(design,'work').colorMode,'cloud');assert.equal(resolveModeDesign(design,'work').expression,'touch-3');
 }
 assert.equal(validateDesign({...DESIGN_DEFAULTS,colorMode:'dither'}).colorMode,'dither');
});
test('presets change the complete Dither look, Undo restores manual values, and Apply keeps other drafts',()=>{
 const base=validateDesign(DESIGN_DEFAULTS),history={};
 const manual=editModeValue(base,history,'work','ditherSpeed',.125);
 const draft=editModeValue(manual,history,'work','ditherPreset','blueprint');
 assert.equal(resolveModeDesign(draft,'work').ditherPattern,'crosshatch');
 assert.equal(resolveModeDesign(draft,'work').ditherPalette,'blueprint');
 assert.equal(resolveModeDesign(draft,'live').ditherPalette,'none');
 const saved=designForModeApply(base,draft,'work','ditherPreset');
 assert.equal(resolveModeDesign(saved,'work').ditherMouseEffect,'ripple');
 const pending=editModeValue(draft,{},'live','eyeSize',125);
 const reconciled=reconcileSavedDesign(saved,draft,pending,{mode:'work',key:'ditherPreset',keys:DITHER_SETTING_KEYS});
 assert.equal(resolveModeDesign(reconciled,'live').eyeSize,125);
 const undone=undoModeValue(draft,history,'work','ditherPreset');
 assert.equal(resolveModeDesign(undone,'work').ditherSpeed,.125);assert.equal(resolveModeDesign(undone,'work').ditherPalette,'none');
});
test('Dither control boundaries reject invalid pattern, palette, size and animation values',()=>{
 for(const [key,value]of [['ditherPattern','bad'],['ditherPixelSize',0],['ditherPaletteCount',9],['ditherMouse','yes'],['ditherSpeed',1]])assert.throws(()=>validateDesign({...DESIGN_DEFAULTS,[key]:value}));
});
test('Apply on a Dither control also records the selected Dither finish without saving other drafts',()=>{
 const base=validateDesign(DESIGN_DEFAULTS);let draft=editModeValue(base,{},'surf','colorMode','dither');draft=editModeValue(draft,{},'surf','ditherSpeed',.1);draft=editModeValue(draft,{},'surf','eyeSize',125);
 const saved=designForModeApply(base,draft,'surf','ditherSpeed');assert.equal(resolveModeDesign(saved,'surf').colorMode,'dither');assert.equal(resolveModeDesign(saved,'surf').ditherSpeed,.1);assert.equal(resolveModeDesign(saved,'surf').eyeSize,100);assert.equal(resolveModeDesign(saved,'live').colorMode,'cloud');
});
