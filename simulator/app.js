import {MODES, initialState, validateDefinitions, validateRules, deriveActivity, swipeMode, stepTime, formatHour, ease} from './engine.js';
import {renderScene} from './renderer.js';

const $ = id => document.getElementById(id);
const canvas = $('pet-canvas');
const ctx = canvas.getContext('2d');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let state = initialState(), definition, original, rules, activity, transition = null, pointer = null;
let time = 0, lastTimestamp = 0, previousStatus = '';

function updateUI() {
  activity = deriveActivity(state, rules);
  document.querySelectorAll('[data-mode]').forEach(b => b.setAttribute('aria-pressed', b.dataset.mode === state.mode));
  document.querySelectorAll('[data-expression]').forEach(b => b.setAttribute('aria-pressed', b.dataset.expression === state.expression));
  $('device-clock').textContent = $('hour-output').textContent = formatHour(state.hour);
  $('activity-label').textContent = activity.label;
  $('caption').textContent = activity.caption;
  $('expression-readout').textContent = activity.expression.toUpperCase();
  $('scene-readout').textContent = ({live: 'LIVE WORLD', work: 'STUDIO TIME', surf: 'SURF WATCH', sleep: 'REST MODE', rain: 'RAINY DAY'})[activity.scene];
  $('mood-dot').style.backgroundColor = definition.expressions[activity.expression].color;
  $('color').value = definition.expressions[activity.expression].color;
  $('float').value = definition.expressions[activity.expression].bobPx;
  $('dot-radius').value = definition.eyes.dotRadius;
  $('pause').setAttribute('aria-pressed', state.paused);
  $('pause').textContent = state.paused ? '▷ Resume motion' : 'Ⅱ Pause motion';
  $('event-status').textContent = ({none: 'No event', success: 'Task complete', failure: 'Retry requested'})[state.event] + ' · no live studio connection';
  $('success').classList.toggle('active', state.event === 'success');
  $('failure').classList.toggle('active', state.event === 'failure');
  const status = state.mode.toUpperCase() + ' mode. ' + activity.expression + '. ' + activity.caption;
  if (status !== previousStatus) { $('screen-status').textContent = status; previousStatus = status; }
}

function changeMode(mode) {
  if (!MODES.includes(mode) || mode === state.mode) return;
  transition = reducedMotion.matches ? null : {from: {...activity}, started: performance.now(), direction: MODES.indexOf(mode) > MODES.indexOf(state.mode) ? 1 : -1};
  state.mode = mode; updateUI();
}

function frame(timestamp) {
  const delta = lastTimestamp ? timestamp - lastTimestamp : 0;
  lastTimestamp = timestamp;
  if (!document.hidden) time = stepTime(time, delta, state.paused, state.speed);
  const render = current => renderScene(ctx, {activity: current, definition, time, reducedMotion: reducedMotion.matches, surf: state.surf});
  if (transition && !reducedMotion.matches) {
    const progress = Math.min(1, (timestamp - transition.started) / 330);
    const offset = ease(progress) * 410 * transition.direction;
    ctx.save(); ctx.translate(-offset, 0); render(transition.from); ctx.restore();
    ctx.save(); ctx.translate(410 * transition.direction - offset, 0); render(activity); ctx.restore();
    if (progress === 1) transition = null;
  } else render(activity);
  requestAnimationFrame(frame);
}

function connect() {
  document.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => changeMode(b.dataset.mode)));
  document.querySelectorAll('[data-expression]').forEach(b => b.addEventListener('click', () => {state.expression = b.dataset.expression; updateUI();}));
  for (const [id, key, number] of [['hour', 'hour', true], ['weather', 'weather'], ['surf', 'surf', true], ['agent', 'agent'], ['agent-status', 'agentStatus'], ['speed', 'speed', true]]) {
    $(id).addEventListener('input', e => {state[key] = number ? Number(e.target.value) : e.target.value; updateUI();});
  }
  for (const [id, event] of [['success', 'success'], ['failure', 'failure'], ['clear-event', 'none']]) $(id).addEventListener('click', () => {state.event = event; updateUI();});
  $('pause').addEventListener('click', () => {state.paused = !state.paused; updateUI();});
  $('reset').addEventListener('click', () => {
    state = initialState(); definition = structuredClone(original); time = 0; transition = null;
    for (const [id, value] of [['hour', 12], ['weather', 'clear'], ['surf', 2], ['agent', 'Web & Coding'], ['agent-status', 'idle'], ['speed', 1]]) $(id).value = value;
    updateUI();
  });
  $('color').addEventListener('input', e => {definition.expressions[activity.expression].color = e.target.value; updateUI();});
  $('dot-radius').addEventListener('input', e => {definition.eyes.dotRadius = Number(e.target.value);});
  $('float').addEventListener('input', e => {definition.expressions[activity.expression].bobPx = Number(e.target.value);});
  $('export').addEventListener('click', () => {
    validateDefinitions(definition);
    const url = URL.createObjectURL(new Blob([JSON.stringify(definition, null, 2) + '\n'], {type: 'application/json'}));
    const a = document.createElement('a'); a.href = url; a.download = 'ai-studio-pet-character.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  const device = $('device');
  device.addEventListener('keydown', e => {
    if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    e.preventDefault(); changeMode(swipeMode(state.mode, e.key === 'ArrowRight' ? -410 : 410, 0));
  });
  device.addEventListener('pointerdown', e => {
    if (e.target.closest('button') || !e.isPrimary || e.button !== 0) return;
    pointer = {id: e.pointerId, x: e.clientX, y: e.clientY}; device.setPointerCapture(e.pointerId);
  });
  device.addEventListener('pointerup', e => {
    if (!pointer || e.pointerId !== pointer.id) return;
    changeMode(swipeMode(state.mode, e.clientX - pointer.x, e.clientY - pointer.y, device.getBoundingClientRect().width)); pointer = null;
    if (device.hasPointerCapture(e.pointerId)) device.releasePointerCapture(e.pointerId);
  });
  device.addEventListener('pointercancel', () => {pointer = null;});
  device.addEventListener('lostpointercapture', () => {pointer = null;});
  document.addEventListener('visibilitychange', () => {lastTimestamp = 0;});
}

try {
  const [characterResponse, behaviorResponse] = await Promise.all([fetch('/character/expressions.json'), fetch('/scenes/behavior.json')]);
  if (!characterResponse.ok || !behaviorResponse.ok) throw Error('Character definitions unavailable');
  definition = validateDefinitions(await characterResponse.json()); original = structuredClone(definition);
  rules = validateRules(await behaviorResponse.json());
  connect(); updateUI(); $('load-status').textContent = ''; requestAnimationFrame(frame);
} catch (error) {
  $('load-status').textContent = 'Your companion could not load. Restart the local server and refresh.';
  console.error(error);
}
