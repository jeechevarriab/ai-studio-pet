import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DESIGN_DEFAULTS,DESIGN_GROUPS,DESIGN_MODES,EYE_SETTING_KEYS,FAVORITE_KEYS,validateDesign,resolveModeDesign,scopedSetting,editModeValue,undoModeValue,designForModeApply,reconcileSavedDesign,captureFavoriteLook,validateFavoriteLook,applyFavoriteLook,resetEyes,randomizeEyes,designDefinition} from '../simulator/design.js';

test('eye settings migrate in fixed LIVE/WORK/PLAY/SLEEP order without changing the rest of each page',()=>{
 const input={...DESIGN_DEFAULTS,eyeSize:100,modeOverrides:{sleep:{eyeSize:80,expression:'sleeping',bodyWidth:300},work:{eyeSize:120,eyeDensity:2.75,expression:'focused',colorMode:'dither'},live:{eyeSize:110,expression:'touch-0'},surf:{characterSize:75,expression:'happy'}}};
 const copy=structuredClone(input),saved=validateDesign(input);
 assert.equal(saved.eyeSize,110);assert.equal(saved.eyeDensity,2.75);assert.equal(saved.characterSize,75);
 for(const mode of DESIGN_MODES){const resolved=resolveModeDesign(saved,mode);assert.equal(resolved.eyeSize,110);assert.equal(resolved.eyeDensity,2.75);assert(!Object.keys(saved.modeOverrides[mode]).some(key=>EYE_SETTING_KEYS.includes(key)));assert.equal(resolved.expression,input.modeOverrides[mode].expression);}
 assert.equal(saved.modeOverrides.sleep.bodyWidth,300);assert.equal(saved.modeOverrides.work.colorMode,'dither');
 assert.deepEqual(input,copy);assert.deepEqual(validateDesign(saved),saved);assert.deepEqual(validateDesign(JSON.parse(JSON.stringify(saved))),saved);
 // Editing an old non-canonical profile also drops legacy overrides before writing.
 assert.equal(editModeValue(input,{},'work','eyeSize',125).eyeSize,125);
});

test('global eye Apply/Undo persists across modes and retains unrelated and in-flight edits',()=>{
 const base=validateDesign(DESIGN_DEFAULTS),history={};
 let draft=editModeValue(base,history,'work','eyeStyle',48);
 draft=editModeValue(draft,history,'sleep','eyeBlinkInterval',7.2);
 draft=editModeValue(draft,history,'work','bodyWidth',350);
 const saved=designForModeApply(base,draft,'surf','eyeStyle');
 for(const mode of DESIGN_MODES){assert.equal(resolveModeDesign(saved,mode).eyeStyle,48);assert.equal(resolveModeDesign(saved,mode).eyeBlinkInterval,5.1);}
 const newer=editModeValue(draft,history,'live','eyeStyle',70);
 const reconciled=reconcileSavedDesign(saved,draft,newer,{mode:'surf',key:'eyeStyle'});
 assert.equal(reconciled.eyeStyle,70);assert.equal(reconciled.eyeBlinkInterval,7.2);assert.equal(reconciled.modeOverrides.work.bodyWidth,350);
 const undone=undoModeValue(reconciled,history,'sleep','eyeStyle');assert.equal(undone.eyeStyle,48);
 assert(EYE_SETTING_KEYS.every(key=>!scopedSetting(key)));assert(scopedSetting('expression'));
});

test('eye bounds and types reject invalid settings; legacy blink multiplier remains hidden and accepted',()=>{
 for(const patch of [{eyeStyle:.1},{eyeStyle:101},{eyeBlinkDuration:79},{eyeBlinkDuration:501},{eyeBlinkInterval:.9},{eyeBlinkInterval:16},{eyeOpenness:1.1},{eyeGlow:9},{eyeTracking:1},{eyeStyle:NaN},{modeOverrides:{live:{eyeStyle:100.5}}}])assert.throws(()=>validateDesign({...DESIGN_DEFAULTS,...patch}));
 const field=DESIGN_GROUPS.find(group=>group.id==='face').fields.find(field=>field.key==='blinkSpeed');assert.equal(field.hidden,true);
 assert.equal(validateDesign({blinkSpeed:0}).blinkSpeed,0);
 for(const patch of [{eyeStyle:100},{eyeBlinkDuration:80,eyeBlinkInterval:15},{eyeOpenness:0,eyeGlow:8,eyeTracking:false}])assert.doesNotThrow(()=>validateDesign(patch));
});

test('eye randomize/reset affect only shared eye settings and expose portable numeric configuration',()=>{
 const base=validateDesign({...DESIGN_DEFAULTS,alarmHour:9,workColor:'#121212',modeOverrides:{work:{expression:'focused',bodyWidth:360,colorMode:'dither'},live:{expression:'touch-3'}}});
 const before=structuredClone(base),randomized=randomizeEyes(base,()=>.75);
 assert.deepEqual(randomized,randomizeEyes(base,()=>.75));assert.equal(randomized.eyeStyle,75);
 const reset=resetEyes(randomized);assert.equal(reset.eyeStyle,0);
 for(const key of Object.keys(base).filter(key=>!EYE_SETTING_KEYS.includes(key))){assert.deepEqual(randomized[key],base[key]);assert.deepEqual(reset[key],base[key]);}
 for(const key of EYE_SETTING_KEYS)assert.equal(reset[key],DESIGN_DEFAULTS[key]);
 assert.deepEqual(base,before);assert.throws(()=>randomizeEyes(base,()=>Infinity));
 const character=JSON.parse(readFileSync(new URL('../character/expressions.json',import.meta.url)));
 const a=designDefinition(character,base),b=designDefinition(character,randomized);
 assert.deepEqual(a.body,b.body);assert.deepEqual(a.presentationV2.task,b.presentationV2.task);
 assert.equal(b.eyes.style,75);assert.equal(b.eyes.blinkDuration,randomized.eyeBlinkDuration);assert.equal(b.eyes.blinkInterval,randomized.eyeBlinkInterval);assert.equal(b.eyes.tracking,true);
});

test('legacy Favorites load with new eye defaults and reject unknown, missing old or invalid values',()=>{
 const look=captureFavoriteLook(DESIGN_DEFAULTS,'live'),legacy=structuredClone(look);
 const added=['eyeStyle','eyeBlinkDuration','eyeBlinkInterval','eyeOpenness','eyeGlow','eyeTracking'];for(const key of added)delete legacy.values[key];
 const upgraded=validateFavoriteLook(legacy);assert.deepEqual(upgraded,look);
 const saved=applyFavoriteLook({...DESIGN_DEFAULTS,eyeStyle:62},legacy,['work']);assert.equal(saved.eyeStyle,0);
 assert(FAVORITE_KEYS.includes('eyeStyle'));assert.throws(()=>validateFavoriteLook({...legacy,values:{...legacy.values,unexpected:1}}));
 const missing=structuredClone(legacy);delete missing.values.eyeSize;assert.throws(()=>validateFavoriteLook(missing));
 assert.throws(()=>validateFavoriteLook({...legacy,values:{...legacy.values,eyeStyle:100.5}}));
});
