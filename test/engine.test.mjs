import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {initialState, deriveActivity, swipeMode, stepTime, validateDefinitions, validateRules, MODES, defaultRules, ease} from '../simulator/engine.js';
const character = JSON.parse(readFileSync(new URL('../character/expressions.json', import.meta.url), 'utf8'));
const rules = JSON.parse(readFileSync(new URL('../scenes/behavior.json', import.meta.url), 'utf8'));
test('initial companion is idle; all four expressions use portable 5 × 7 data', () => {
  assert.equal(deriveActivity(initialState()).expression, 'idle'); assert.equal(validateDefinitions(character), character);
  const broken = structuredClone(character); broken.expressions.happy.left[0] = 'xxxxx'; assert.throws(() => validateDefinitions(broken));
});
test('night overrides work, celebrations and surf in automatic LIVE', () => {
  const state = {...initialState(), hour: 23, agentStatus: 'working', surf: 6, event: 'success'};
  assert.equal(deriveActivity(state, rules).expression, 'sleeping');
  state.hour = 12; state.event = 'failure'; assert.match(deriveActivity(state, rules).caption, /setback/);
  state.event = 'none'; assert.equal(deriveActivity(state, rules).expression, 'focused');
});
test('success, rain and waves choose their own scenes; clearing event returns to environment', () => {
  const state = {...initialState(), event: 'success'}; assert.equal(deriveActivity(state).expression, 'happy');
  state.event = 'none'; state.weather = 'rain'; assert.equal(deriveActivity(state).scene, 'rain');
  state.weather = 'clear'; state.surf = 4; assert.equal(deriveActivity(state).scene, 'surf');
  state.surf = 2; assert.equal(deriveActivity(state).expression, 'idle');
});
test('mode and expression overrides remain independent of automatic scene choice', () => {
  assert.equal(deriveActivity({...initialState(), mode: 'sleep'}).expression, 'sleeping');
  assert.equal(deriveActivity({...initialState(), mode: 'sleep', expression: 'happy'}).expression, 'happy');
  assert.equal(deriveActivity({...initialState(), mode: 'work', agentStatus: 'working', agent: 'Design'}).caption, 'Design is making things happen.');
  for (const mode of MODES) assert.ok(deriveActivity({...initialState(), mode}).scene);
});
test('behavior priorities are editable, validated and keep a final fallback', () => {
  assert.equal(validateRules(rules), rules);
  const reordered = {...rules, rules: ['success', 'sleep', 'failure', 'working', 'rain', 'surf', 'idle']};
  assert.equal(deriveActivity({...initialState(), hour: 23, event: 'success'}, validateRules(reordered)).expression, 'happy');
  assert.throws(() => validateRules({...rules, rules: [...defaultRules.rules].reverse()}));
});
test('swipes advance one page, reject vertical scroll and short taps, and stop at edges', () => {
  assert.equal(swipeMode('live', -100, 10), 'work'); assert.equal(swipeMode('work', 100, 0), 'live');
  assert.equal(swipeMode('work', 2, 0), 'work'); assert.equal(swipeMode('work', -100, 200), 'work');
  assert.equal(swipeMode('sleep', -100, 0), 'sleep'); assert.equal(swipeMode('live', 100, 0), 'live');
  assert.equal(swipeMode('live', -50, 0, 300), 'work'); assert.equal(swipeMode('live', NaN, 0), 'live');
});
test('animation clock pauses exactly and clamps return-from-background jumps', () => {
  assert.equal(stepTime(1000, 16, true), 1000); assert.equal(stepTime(1000, 16, false, .5), 1008);
  assert.equal(stepTime(1000, 100000, false), 1100); assert.equal(stepTime(1000, -30, false), 1000);
  assert.equal(ease(0), 0); assert.equal(ease(1), 1);
});
