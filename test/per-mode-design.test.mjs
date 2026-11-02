import test from 'node:test';
import assert from 'node:assert/strict';
import {DESIGN_DEFAULTS,validateDesign,editModeValue,undoModeValue,designForModeApply,resolveModeDesign,reconcileSavedDesign} from '../simulator/design.js';
test('mode settings survive switching, serialization and reload without leaking between pages',()=>{
 const base=validateDesign({...DESIGN_DEFAULTS,eyeSize:110}),history={};
 let draft=editModeValue(base,history,'live','expression','touch-0');
 draft=editModeValue(draft,history,'work','expression','focused');
 draft=editModeValue(draft,history,'surf','colorMode','silk');
 const saved=validateDesign(JSON.parse(JSON.stringify(designForModeApply(base,draft,'live'))));
 assert.equal(resolveModeDesign(saved,'live').expression,'touch-0');
 assert.equal(resolveModeDesign(saved,'work').expression,'focused');
 assert.equal(resolveModeDesign(saved,'surf').colorMode,'silk');
 assert.equal(resolveModeDesign(saved,'sleep').expression,'auto');
 for(const mode of ['live','work','surf','sleep'])assert.equal(resolveModeDesign(saved,mode).eyeSize,110);
 const undone=undoModeValue(saved,history,'live','expression');
 assert.equal(resolveModeDesign(undone,'live').expression,'auto');
 assert.equal(resolveModeDesign(undone,'work').expression,'focused');
});
test('one Apply saves only that page and field while retaining unsaved drafts and newer edits',()=>{
 const base=validateDesign(DESIGN_DEFAULTS);
 let draft=editModeValue(base,{},'live','expression','touch-2');
 draft=editModeValue(draft,{},'work','expression','focused');
 draft=editModeValue(draft,{},'live','eyeSize',120);
 const saved=designForModeApply(base,draft,'live','expression');
 assert.equal(resolveModeDesign(saved,'live').expression,'touch-2');
 assert.equal(resolveModeDesign(saved,'work').expression,'auto');
 assert.equal(resolveModeDesign(saved,'live').eyeSize,100);
 const newer=editModeValue(draft,{},'live','expression','happy');
 const reconciled=reconcileSavedDesign(saved,draft,newer,{mode:'live',key:'expression'});
 assert.equal(resolveModeDesign(reconciled,'live').expression,'happy');
 assert.equal(resolveModeDesign(reconciled,'work').expression,'focused');
 assert.equal(resolveModeDesign(reconciled,'live').eyeSize,120);
});
test('nested mode settings reject unrecognized modes, fields, bad values and nested objects',()=>{
 for(const modeOverrides of [{admin:{}},{live:{unknown:1}},{work:{eyeSize:999}},{surf:{modeOverrides:{}}},{live:{liveColor:'#123456'}}])assert.throws(()=>validateDesign({...DESIGN_DEFAULTS,modeOverrides}));
});
