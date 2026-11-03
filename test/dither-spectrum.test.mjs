import test from 'node:test';import assert from 'node:assert/strict';
import {DESIGN_DEFAULTS,DITHER_PALETTES,DITHER_SETTING_KEYS,activeDitherSpectrum,editDitherSpectrum,editModeValue,undoModeValue,designForModeApply,resolveModeDesign,reconcileSavedDesign,designSignature} from '../simulator/design.js';
import {hexToHsv,hsvToHex} from '../simulator/dither-editor.js';

test('named palette edits seed the visible colors, Undo restores that palette, and Apply saves the whole spectrum only',()=>{
 const saved=editModeValue(DESIGN_DEFAULTS,{},'sleep','ditherPalette','gameboy'),history={};
 assert.deepEqual(activeDitherSpectrum(saved,'sleep'),DITHER_PALETTES.gameboy);
 let draft=editDitherSpectrum(saved,history,'sleep','ditherPalette4','#ff8800');
 assert.deepEqual(activeDitherSpectrum(draft,'sleep'),[...DITHER_PALETTES.gameboy.slice(0,3),'#ff8800']);
 draft=editModeValue(draft,{},'sleep','eyeSize',120);
 const result=designForModeApply(saved,draft,'sleep','ditherSpectrum');
 assert.equal(resolveModeDesign(result,'sleep').ditherPalette,'custom');assert.equal(resolveModeDesign(result,'sleep').eyeSize,100);assert.equal(resolveModeDesign(result,'live').ditherPalette,'none');
 const undone=undoModeValue(draft,history,'sleep','ditherPalette4');assert.deepEqual(activeDitherSpectrum(undone,'sleep'),DITHER_PALETTES.gameboy);assert.equal(resolveModeDesign(undone,'sleep').eyeSize,120);
});
test('custom conversion keeps both endpoints, shade count is bounded, and picker HSV roundtrips',()=>{
 let d=editModeValue(DESIGN_DEFAULTS,{},'live','ditherWaveColor','#ff3300');d=editDitherSpectrum(d,{},'live','ditherPalette','custom');assert.deepEqual(activeDitherSpectrum(d,'live'),['#120f17','#ff3300']);
 assert.throws(()=>editDitherSpectrum(d,{},'live','ditherPaletteCount',9));assert.throws(()=>editDitherSpectrum(d,{},'live','ditherPalette1','invalid'));
 for(const color of ['#000000','#ffffff','#ff3300','#7c3aed','#8bac0f','#10172a'])assert.equal(hsvToHex(hexToHsv(color)),color);
});

test('saving a spectrum clears dirty state even when field insertion order changes',()=>{
 let draft=editModeValue(DESIGN_DEFAULTS,{},'live','ditherPreset','gameboy');draft=editModeValue(draft,{},'live','colorMode','dither');draft=editDitherSpectrum(draft,{},'live','ditherPalette4','#ff3300');
 const saved=designForModeApply(DESIGN_DEFAULTS,draft,'live','ditherPreset');
 const reconciled=reconcileSavedDesign(saved,draft,draft,{mode:'live',key:'ditherPreset',keys:['colorMode',...DITHER_SETTING_KEYS]});
 assert.equal(designSignature(saved),designSignature(reconciled));
});
