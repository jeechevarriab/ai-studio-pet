import test from 'node:test';
import assert from 'node:assert/strict';
import {DESIGN_DEFAULTS,FAVORITE_KEYS,captureFavoriteLook,validateFavoriteLook,applyFavoriteLook,modeSetting,reconcileSavedDesign} from '../simulator/design.js';

test('a generated favorite transfers the complete selected look without changing other pages or service settings',()=>{
 const source={...DESIGN_DEFAULTS,liveColor:'#123abc',liveBackground:'#010203',liveEye:'#fedcba',modeOverrides:{live:{colorMode:'dither',expression:'touch-7',eyeSize:125,ditherPattern:'halftone',float:1.4}}};
 const look=captureFavoriteLook(source,'live');
 assert.deepEqual(validateFavoriteLook(JSON.parse(JSON.stringify(look))),look);
 const saved={...DESIGN_DEFAULTS,alarmHour:9,studioAuto:false,sensors:false,modeOverrides:{sleep:{eyeSize:90},work:{eyeSize:80}}};
 const result=applyFavoriteLook(saved,look,['work','surf']);
 for(const mode of ['work','surf']){assert.equal(modeSetting(result,mode,'expression'),'touch-7');assert.equal(modeSetting(result,mode,'ditherPattern'),'halftone');assert.equal(result[mode+'Color'],'#123abc');assert.equal(result[mode+'Eye'],'#fedcba');}
 assert.deepEqual(result.modeOverrides.sleep,saved.modeOverrides.sleep);assert.equal(result.liveColor,saved.liveColor);assert.equal(result.alarmHour,9);assert.equal(result.studioAuto,false);assert.equal(result.sensors,false);assert.equal(saved.modeOverrides.work.eyeSize,80);
 assert.throws(()=>validateFavoriteLook({...look,values:{...look.values,token:'invalid'}}));
 assert.throws(()=>validateFavoriteLook({...look,values:{...look.values,eyeSize:999}}));
 assert.throws(()=>applyFavoriteLook(saved,look,[]));assert.throws(()=>applyFavoriteLook(saved,look,['unknown']));
});

test('favorite Apply preserves unrelated drafts and newer edits made during its save',()=>{
 const applied=structuredClone(DESIGN_DEFAULTS),look=captureFavoriteLook({...applied,eyeSize:120},'live');
 const saved=applyFavoriteLook(applied,look,['work']);
 const atSubmit=applyFavoriteLook({...applied,alarmHour:10},look,['work']);
 const after=structuredClone(atSubmit);after.modeOverrides.work.eyeSize=110;after.modeOverrides.sleep={expression:'touch-1'};
 const result=reconcileSavedDesign(saved,atSubmit,after,{mode:'work',keys:[...FAVORITE_KEYS,'workColor','workBackground','workEye']});
 assert.equal(result.alarmHour,10);assert.equal(result.modeOverrides.work.eyeSize,110);assert.equal(result.modeOverrides.sleep.expression,'touch-1');assert.equal(saved.alarmHour,7);
});
