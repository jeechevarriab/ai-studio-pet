import test from 'node:test';import assert from 'node:assert/strict';
import {DESIGN_DEFAULTS,groupSettingKeys,groupSnapshot,restoreGroupSettings,designForGroupApply,editModeValue,resolveModeDesign,undoModeValue,editDitherSpectrum,activeDitherSpectrum,designSignature,designForDitherEditorApply} from '../simulator/design.js';

test('Face panel Apply shares eye geometry while retaining unrelated page drafts',()=>{
 let draft=editModeValue(DESIGN_DEFAULTS,{},'work','eyeSize',120);draft=editModeValue(draft,{},'work','bodyWidth',350);draft=editModeValue(draft,{},'surf','eyeSize',80);
 const saved=designForGroupApply(DESIGN_DEFAULTS,draft,'work','face');assert.equal(resolveModeDesign(saved,'work').eyeSize,80);assert.equal(resolveModeDesign(saved,'work').bodyWidth,338);assert.equal(resolveModeDesign(saved,'surf').eyeSize,80);
});
test('Color panel snapshots include the current palette only and Reset/Undo preserve other pages',()=>{
 const base={...DESIGN_DEFAULTS,liveColor:'#123456',workColor:'#abcdef'};
 const keys=groupSettingKeys('colors','work');assert(keys.includes('workColor'));assert(!keys.includes('liveColor'));assert(!keys.includes('cycle2'));
 const before=groupSnapshot(base,'work','colors');const reset=restoreGroupSettings(base,'work','colors',groupSnapshot(DESIGN_DEFAULTS,'work','colors'));assert.equal(reset.liveColor,'#123456');assert.equal(reset.workColor,DESIGN_DEFAULTS.workColor);
 assert.equal(restoreGroupSettings(reset,'work','colors',before).workColor,'#abcdef');
});
test('alarm remains shared while panel restoration rejects invalid snapshots',()=>{
 let draft=editModeValue(DESIGN_DEFAULTS,{},'sleep','alarmHour',10);const saved=designForGroupApply(DESIGN_DEFAULTS,draft,'sleep','alarm');assert.equal(resolveModeDesign(saved,'live').alarmHour,10);
 assert.throws(()=>groupSettingKeys('bad','live'));assert.throws(()=>restoreGroupSettings(draft,'sleep','alarm',{alarmHour:99}));
});

test('individual parameter Undo preserves other edits, including later palette shades',()=>{
 const history={};let draft=editModeValue(DESIGN_DEFAULTS,history,'work','eyeSize',115);draft=editModeValue(draft,history,'work','eyeDensity',2.5);draft=undoModeValue(draft,history,'work','eyeSize');assert.equal(resolveModeDesign(draft,'work').eyeSize,100);assert.equal(resolveModeDesign(draft,'work').eyeDensity,2.5);
 draft=editModeValue(draft,{},'work','ditherPalette','gameboy');draft=editDitherSpectrum(draft,history,'work','ditherPalette4','#ff0000');draft=editDitherSpectrum(draft,history,'work','ditherPalette1','#0000ff');draft=undoModeValue(draft,history,'work','ditherPalette4');const colors=activeDitherSpectrum(draft,'work');assert.equal(colors[0],'#0000ff');assert.equal(colors[3],'#9bbc0f');
});

test('Undo to an inherited value does not leave a false dirty state',()=>{
 const history={};const changed=editModeValue(DESIGN_DEFAULTS,history,'live','eyeSize',115);const undone=undoModeValue(changed,history,'live','eyeSize');assert.equal(designSignature(undone),designSignature(DESIGN_DEFAULTS));
});

test('Dither panel Apply saves the page background and effect without touching other pages or unrelated drafts',()=>{
 let draft=editModeValue(DESIGN_DEFAULTS,{},'work','workBackground','#123456');draft=editModeValue(draft,{},'work','colorMode','dither');draft=editModeValue(draft,{},'work','ditherBrightness',.15);draft=editModeValue(draft,{},'work','eyeSize',120);draft=editModeValue(draft,{},'sleep','sleepBackground','#abcdef');
 const saved=designForDitherEditorApply(DESIGN_DEFAULTS,draft,'work');assert.equal(saved.workBackground,'#123456');assert.equal(saved.sleepBackground,DESIGN_DEFAULTS.sleepBackground);assert.equal(resolveModeDesign(saved,'work').colorMode,'dither');assert.equal(resolveModeDesign(saved,'work').ditherBrightness,.15);assert.equal(resolveModeDesign(saved,'work').eyeSize,100);
});
