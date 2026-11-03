import test from 'node:test';
import assert from 'node:assert/strict';
import {DESIGN_DEFAULTS,validateDesign,formatAlarmTime,editModeValue,restoreCloudDefault} from '../simulator/design.js';
test('alarm time has an AM/PM default and preserves exact minute values through saving',()=>{
 const base=validateDesign(DESIGN_DEFAULTS);assert.equal(formatAlarmTime(base),'7:00 AM');
 let draft=editModeValue(base,{},'sleep','alarmHour',12);draft=editModeValue(draft,{},'sleep','alarmMinute',5);draft=editModeValue(draft,{},'sleep','alarmMeridiem','PM');
 const saved=validateDesign(JSON.parse(JSON.stringify(draft)));assert.equal(formatAlarmTime(saved),'12:05 PM');
 assert.equal(formatAlarmTime({...saved,alarmMeridiem:'AM'}),'12:05 AM');
 assert.equal(restoreCloudDefault(saved,'sleep',base).alarmMinute,5);
});
test('alarm preview rejects fractional and out-of-range time values',()=>{
 for(const [key,value]of [['alarmHour',0],['alarmHour',13],['alarmMinute',60],['alarmMinute',2.5],['alarmMeridiem','24h']])assert.throws(()=>validateDesign({...DESIGN_DEFAULTS,[key]:value}));
});
