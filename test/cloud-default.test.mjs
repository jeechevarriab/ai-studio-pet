import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateDesign,DESIGN_DEFAULTS,restoreCloudDefault,resolveModeDesign,editModeValue,designForModeApply} from '../simulator/design.js';
test('Return to Default restores the saved Cloud look for one mode, including its eyes, without replacing other modes',()=>{
 const baseline=validateDesign(JSON.parse(readFileSync(new URL('../character/cloud-default-design.json',import.meta.url),'utf8')).settings);
 let draft=editModeValue(validateDesign(DESIGN_DEFAULTS),{},'live','expression','sleeping');draft=editModeValue(draft,{},'live','colorMode','dither');draft=editModeValue(draft,{},'work','eyeSize',125);
 const restored=restoreCloudDefault(draft,'live',baseline),live=resolveModeDesign(restored,'live');
 assert.equal(live.colorMode,'cloud');assert.equal(live.expression,resolveModeDesign(baseline,'live').expression);assert.equal(restored.liveColor,baseline.liveColor);
 assert.equal(resolveModeDesign(restored,'work').eyeSize,125);
 const saved=designForModeApply(validateDesign(DESIGN_DEFAULTS),restored,'live','modeDefault');assert.equal(resolveModeDesign(saved,'live').expression,live.expression);assert.equal(saved.liveColor,baseline.liveColor);assert.equal(resolveModeDesign(saved,'work').eyeSize,100);
});
