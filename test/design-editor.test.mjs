import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {DESIGN_DEFAULTS,validateDesign,designDefinition,editValue,undoValue} from '../simulator/design.js';
import {reduceNative,reduceTask,STUDIO_AGENTS} from '../gateway/status-relay.mjs';
test('feature undo is independent and design settings cannot inject arbitrary fields',()=>{
 const history={};let draft={...DESIGN_DEFAULTS};draft=editValue(draft,history,'eyeSize',120);draft=editValue(draft,history,'workColor','#abcdef');draft=undoValue(draft,history,'eyeSize');
 assert.equal(draft.eyeSize,100);assert.equal(draft.workColor,'#abcdef');
 assert.throws(()=>validateDesign({...draft,agentKey:'no'}));assert.throws(()=>validateDesign({...draft,eyeSize:1000}));assert.throws(()=>validateDesign({...draft,asciiDark:'<script>this-is-too-long'}));
 const base=JSON.parse(readFileSync(new URL('../character/expressions.json',import.meta.url)));const copy=JSON.stringify(base);const definition=designDefinition(base,{...draft,eyeSize:110,characterSize:90});
 assert.equal(definition.presentationV2.eyeSizeMultiplier,1.82*1.1);assert.equal(definition.presentationV2.eyeDotMultiplier,.6*.9);assert.equal(JSON.stringify(base),copy);
});
test('relay exports only known status metadata and never prompt, task, thread, tool or result content',()=>{
 const record={agentId:STUDIO_AGENTS[0],threadId:'thread',state:'working',observedAt:1000,startedAt:900,taskSummary:'private',tool:'private',prompt:'private',answer:'private'};
 assert.deepEqual(reduceNative(record,STUDIO_AGENTS[0],'thread',2000),{id:STUDIO_AGENTS[0],status:'working',observedAt:1000,startedAt:900});
 assert.equal(reduceNative(record,STUDIO_AGENTS[0],'thread',122000).status,'unknown');
 assert.equal(reduceNative(record,STUDIO_AGENTS[0],'wrong',2000).status,'unknown');
 assert.equal(reduceNative({...record,state:'completed'},STUDIO_AGENTS[0],'thread',10000).status,'idle');
});
test('dashboard task progress is normalized, excludes private text and becomes unknown without hub health',()=>{
 const turn={agent:'design-master',status:'running',stage:'Verifying private client file.pdf',createdAt:'2026-11-02T00:00:00Z',question:'private',answer:'private'};
 const r=reduceTask(turn,'design-master',true,Date.parse('2026-11-02T00:01:00Z'));
 assert.equal(r.status,'working');assert.equal(r.phase,'checking');assert(!JSON.stringify(r).includes('private'));
 assert.equal(reduceTask(turn,'design-master',false).status,'unknown');
});
