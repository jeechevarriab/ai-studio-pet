import {MODES, initialState, validateDefinitions, validateRules, deriveActivity, swipeMode, stepTime, formatHour, ease, createPickupDetector} from './engine.js';
import {renderScene} from './renderer.js';
import {bindEyeAttention} from './eye-surface.js';
import {setDitherPointer} from './color-finishes.js';
import {DESIGN_DEFAULTS,designDefinition,resolveModeDesign,formatAlarmTime} from './design.js';
import {connectDesignEditor} from './editor.js';
import {connectStudio,paintStudio} from './studio.js';

const $ = id => document.getElementById(id);
const canvas = $('pet-canvas');
const ctx = canvas.getContext('2d');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const mascotVersion = new URLSearchParams(location.search).get('mascot') === 'v1' ? 'v1' : 'v2';
let designReady=mascotVersion==='v1';
document.documentElement.classList.toggle('mascot-v2', mascotVersion === 'v2');
let state = initialState(), definition, original, rules, activity, transition = null, pointer = null;
let time = 0, lastTimestamp = 0, previousStatus = '';
let suppressTap = false, tiltAttempted = false, tiltOrigin = null, lastPointerMotion = 0;
let attention = 0, attentionTarget = 0, activeNotice = null;
let greetingUntil=0,greeting=0,motionSeenAt=-Infinity;
const pickupMotion=createPickupDetector(),pickupTilt=createPickupDetector();
const pickupEligible=()=>customDesign.sensors&&customDesign.pickup&&!document.hidden&&state.mode==='live'&&state.agentStatus==='idle'&&state.event==='none'&&!state.paused&&!holding&&!$('device').classList.contains('controls-visible');
function greetOnPickup(){greetingUntil=time+customDesign.greetingSeconds*1000;$('screen-status').textContent='Happy to see you.';}
let holdTimer, holding = false, touchEye = -1, previousEye = -1, eyeChangedAt = 0;
const defaultModeColors = {live: '#66f4d5', work: '#ff392c', surf: '#b4f483', sleep: '#b2a9ee'};
let customDesign={...DESIGN_DEFAULTS};
let sharedDesign={...DESIGN_DEFAULTS},modeDefinitions={};
let studioReport=null,autoStudioWork=false;
function restoreModeDesign(){customDesign=resolveModeDesign(sharedDesign,state.mode);definition=modeDefinitions[state.mode]||designDefinition(original,customDesign);state.expression=customDesign.expression.startsWith('touch-')?'auto':customDesign.expression;touchEye=customDesign.expression.startsWith('touch-')?Number(customDesign.expression.slice(6)):-1;previousEye=-1;}
function setDesign(settings){sharedDesign=structuredClone(settings);modeDefinitions=Object.fromEntries(MODES.map(mode=>[mode,designDefinition(original,resolveModeDesign(settings,mode))]));restoreModeDesign();updateUI();designReady=true;}
const modeColor = () => (definition.presentationV2?.modeColors || defaultModeColors)[state.mode];
let surfData = null, surfPending = false;

function syncPlayPanel() {
  $('play-panel').hidden = mascotVersion !== 'v2' || state.mode !== 'surf' || !$('device').classList.contains('controls-visible') || !!activeNotice;
  $('studio-panel').hidden=mascotVersion!=='v2'||state.mode!=='work'||!$('device').classList.contains('controls-visible')||!!activeNotice;
  $('sleep-panel').hidden=mascotVersion!=='v2'||state.mode!=='sleep'||!$('device').classList.contains('controls-visible')||!!activeNotice;
  $('alarm-time').textContent=formatAlarmTime(customDesign);
}

async function loadSurf() {
  if (surfPending) return;
  if (surfData && Date.now() < surfData.expiresAt) return;
  surfPending = true; $('play-source').textContent = 'Loading offshore forecast…';
  const rows = $('play-rows'); rows.replaceChildren();
  $('play-tide').textContent = '';
  try {
    const response = await fetch('/api/surf', {signal: AbortSignal.timeout(20000)});
    if (!response.ok) throw Error('Forecast unavailable');
    const data = await response.json();
    if (data.kind !== 'offshore-model' || !Array.isArray(data.spots) || data.spots.length !== 3) throw Error('Invalid forecast');
    surfData = data;
    for (const spot of data.spots) {
      const row = document.createElement('div'); row.className = 'play-row';
      const stale = !Number.isFinite(spot.sampleTime) || Math.abs(Date.now() - spot.sampleTime) > 3 * 60 * 60 * 1000;
      const dir = Number.isFinite(spot.directionDegrees) ? ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'][Math.round(spot.directionDegrees / 22.5) % 16] : '—';
      const height = !stale && Number.isFinite(spot.waveFeet) ? spot.waveFeet.toFixed(1) + ' ft' : '—';
      const period = !stale && Number.isFinite(spot.periodSeconds) ? (Math.round(spot.periodSeconds * 10) / 10).toFixed(1) + ' s' : '—';
      const name = document.createElement('span'); name.textContent = spot.name;
      const primary = document.createElement('span'); primary.className = 'play-primary'; primary.textContent = `${height} · ${period} · ${!stale ? dir : '—'}`;
      const detail = document.createElement('div'); detail.className = 'play-detail';
      const windFresh = Number.isFinite(spot.windSampleTime) && Math.abs(Date.now()-spot.windSampleTime)<3*3600000;
      const compass = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
      const windDir = Number.isFinite(spot.windDirectionDegrees) ? compass[Math.round(spot.windDirectionDegrees/22.5)%16] : '';
      const wind = document.createElement('span'); wind.textContent = windFresh && Number.isFinite(spot.windMph) ? `Wind ${spot.windMph.toFixed(1)} MPH ${windDir}` : 'Wind —';
      const energy = document.createElement('span'); energy.textContent = !stale && Number.isFinite(spot.energyKJPerMeter) ? `~${spot.energyKJPerMeter} kJ/m est.` : 'Energy —'; energy.title = 'Equivalent deep-water wave energy per meter of wave front; estimate, not a beach-adjusted surf-app rating.';
      detail.append(wind,energy); row.append(name,primary,detail);
      rows.append(row);
    }
    $('play-tide').textContent = data.tide && ['Low','Rising','High','Falling'].includes(data.tide.stage) ? `TIDE ${data.tide.stage.toUpperCase()} · NOAA Aguadilla reference` : 'TIDE unavailable · NOAA Aguadilla reference';
    const sample = data.spots[0].sampleTime;
    const time = Number.isFinite(sample) ? new Intl.DateTimeFormat('en-US',{hour:'numeric',minute:'2-digit',hour12:true,timeZone:'America/Puerto_Rico'}).format(new Date(sample)) + ' AST' : 'Time unavailable';
    $('play-source').replaceChildren();
    const attribution = document.createElement('a'); attribution.href = 'https://open-meteo.com/en/docs/marine-weather-api'; attribution.target = '_blank'; attribution.rel = 'noopener noreferrer'; attribution.textContent = 'Open-Meteo';
    $('play-source').append(attribution, ' · offshore model · ' + time);
  } catch {
    surfData = null; $('play-source').textContent = 'Forecast unavailable · reopen PLAY to retry';
  } finally {surfPending = false;}
}
const motion = {x: 0, y: 0, targetX: 0, targetY: 0};
let eyeAttention;
const clamp = (value, limit) => Math.max(-limit, Math.min(limit, value));

function cycleEyes(now = performance.now()) {
  if (!definition.touchEyes?.length) return;
  previousEye = touchEye; touchEye = (touchEye + 1) % definition.touchEyes.length; eyeChangedAt = now;
  const name = definition.touchEyes[touchEye].name;
  $('expression-readout').textContent = name.toUpperCase();
  $('screen-status').textContent = 'Mascot eye expression: ' + name;
}

function cancelHold() {
  clearTimeout(holdTimer); holding = false; pointer = null;
  motion.targetX = 0; motion.targetY = 0;
}

function revealControls(visible = true) {
  if (mascotVersion !== 'v2') return;
  $('device').classList.toggle('controls-visible', visible);
  attentionTarget = visible ? 1 : 0;
  if (!visible) activeNotice = null;
  $('device-message').hidden = !activeNotice || !visible;
  syncPlayPanel();
  if (visible && state.mode === 'surf' && !activeNotice) void loadSurf();
  if (visible && activeNotice) {
    $('message-title').textContent = activeNotice.title;
    $('message-body').textContent = activeNotice.body;
  }

}

async function enableTilt() {
  if (tiltAttempted || mascotVersion !== 'v2' || reducedMotion.matches || !customDesign.sensors) return;
  tiltAttempted = true;
  try {
    // Start both permission requests while the real touch activation is live.
    const permission=api=>!api?Promise.resolve('unavailable'):typeof api.requestPermission==='function'?api.requestPermission():Promise.resolve('granted');
    const [orientation,movement]=await Promise.allSettled([permission(window.DeviceOrientationEvent),permission(window.DeviceMotionEvent)]);
    if(orientation.status==='fulfilled'&&orientation.value==='granted')window.addEventListener('deviceorientation', event => {
      if(!customDesign.sensors)return;
      if (!Number.isFinite(event.gamma) || !Number.isFinite(event.beta)) return;
      if (!tiltOrigin) tiltOrigin = {gamma: event.gamma, beta: event.beta};
      const now=performance.now(),r=Math.PI/180,b=event.beta*r,g=event.gamma*r;
      if(now-motionSeenAt>600&&pickupTilt([Math.sin(g)*Math.cos(b)*9.81,Math.sin(b)*9.81,Math.cos(g)*Math.cos(b)*9.81],now,pickupEligible()))greetOnPickup();
      if (performance.now() - lastPointerMotion < 800) return;
      motion.targetX = clamp((event.gamma - tiltOrigin.gamma) * .3, 6);
      motion.targetY = clamp((event.beta - tiltOrigin.beta) * .2, 4);
    }, {passive: true});
    if(movement.status==='fulfilled'&&movement.value==='granted')window.addEventListener('devicemotion',event=>{
      const a=event.accelerationIncludingGravity;
      if(!a||![a.x,a.y,a.z].every(Number.isFinite))return;
      motionSeenAt=performance.now();
      if(pickupMotion([a.x,a.y,a.z],motionSeenAt,pickupEligible()))greetOnPickup();
    },{passive:true});
  } catch { /* Pointer motion remains available if sensors are unavailable or denied. */ }
}

function updateUI() {
  activity = {...deriveActivity(state, rules, mascotVersion==='v2'), mode: state.mode};
  if(mascotVersion==='v2'){
    const bg=customDesign[state.mode+'Background'],rgb=[1,3,5].map(i=>parseInt(bg.slice(i,i+2),16));
    const light=rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722>145;
    $('device').style.setProperty('--page-text',light?'#28323a':'#e6f7ff');
    $('device').style.setProperty('--page-muted',light?'#4e5a65':'#bad2e3');
  }
  $('device').classList.toggle('work-palette',mascotVersion==='v2'&&state.mode==='work');
  $('device').classList.toggle('play-palette',mascotVersion==='v2'&&state.mode==='surf');
  syncPlayPanel();
  $('studio-panel').hidden=mascotVersion!=='v2'||state.mode!=='work'||!$('device').classList.contains('controls-visible')||!!activeNotice;
  paintStudio($('studio-panel'),studioReport);
  document.querySelectorAll('[data-mode]').forEach(b => b.setAttribute('aria-pressed', b.dataset.mode === state.mode));
  document.querySelectorAll('[data-expression]').forEach(b => b.setAttribute('aria-pressed', b.dataset.expression === state.expression));
  $('device-clock').textContent = $('hour-output').textContent = formatHour(state.hour);
  $('activity-label').textContent = activity.label;
  $('caption').textContent = mascotVersion === 'v1' ? activity.caption : '';
  $('expression-readout').textContent = activity.expression.toUpperCase();
  $('scene-readout').textContent = ({live: 'LIVE WORLD', work: 'STUDIO TIME', surf: 'SURF WATCH', sleep: 'REST MODE', rain: 'RAINY DAY'})[activity.scene];
  $('mood-dot').style.backgroundColor = definition.expressions[activity.expression].color;
  $('color').value = mascotVersion === 'v2' ? modeColor() : definition.expressions[activity.expression].color;
  $('device').style.setProperty('--mascot-accent', mascotVersion === 'v2' ? modeColor() : definition.expressions[activity.expression].color);
  $('float').value = definition.expressions[activity.expression].bobPx;
  $('dot-radius').value = definition.eyes.dotRadius;
  $('pause').setAttribute('aria-pressed', state.paused);
  $('pause').textContent = state.paused ? '▷ Resume motion' : 'Ⅱ Pause motion';
  $('event-status').textContent = ({none: 'No event', success: 'Task complete', failure: 'Retry requested'})[state.event] + ' · no live studio connection';
  $('success').classList.toggle('active', state.event === 'success');
  $('failure').classList.toggle('active', state.event === 'failure');
  const status = (mascotVersion === 'v2' && state.mode === 'surf' ? 'PLAY' : state.mode.toUpperCase()) + ' mode. ' + activity.expression + (mascotVersion === 'v1' ? '. ' + activity.caption : '.');
  if (status !== previousStatus) { $('screen-status').textContent = status; previousStatus = status; }
}

function changeMode(mode,fromStudio=false) {
  if(!fromStudio)autoStudioWork=false;
  if (!MODES.includes(mode) || mode === state.mode) return;
  transition = reducedMotion.matches ? null : {from: {...activity}, started: performance.now(), direction: MODES.indexOf(mode) > MODES.indexOf(state.mode) ? 1 : -1};
  activeNotice = null; touchEye = -1; previousEye = -1; state.mode = mode;if(mascotVersion==='v2')restoreModeDesign();updateUI();
  document.dispatchEvent(new CustomEvent('mascot-mode-change',{detail:{mode}}));
  revealControls($('device').classList.contains('controls-visible'));
}

function frame(timestamp) {
  const delta = lastTimestamp ? timestamp - lastTimestamp : 0;
  lastTimestamp = timestamp;
  if(document.hidden) {requestAnimationFrame(frame);return;}
  if(!designReady){requestAnimationFrame(frame);return;}
  if (!document.hidden) time = stepTime(time, delta, state.paused, state.speed);
  const poseSmoothing = 1 - Math.exp(-Math.min(delta, 100) / 170);
  attention = reducedMotion.matches ? attentionTarget : attention + (attentionTarget - attention) * poseSmoothing;
  greeting+=(time<greetingUntil&&state.mode==='live'?1-greeting:-greeting)*poseSmoothing;
  if (reducedMotion.matches) {motion.x = 0; motion.y = 0;}
  else if (!state.paused) {
    const smoothing = 1 - Math.exp(-Math.min(delta, 100) / 180);
    motion.x += (motion.targetX - motion.x) * smoothing;
    motion.y += (motion.targetY - motion.y) * smoothing;
  }
  const eyeBlend = reducedMotion.matches ? 1 : Math.min(1, Math.max(0,(timestamp-eyeChangedAt)/140));
  if(eyeAttention&&!state.paused)motion.eyePose=eyeAttention.update(delta,time,reducedMotion.matches);
  const render = current => renderScene(ctx, {activity: current, definition:modeDefinitions[current.mode]||definition, time, reducedMotion: reducedMotion.matches, surf: state.surf, version: mascotVersion, motion, attention, touchEye:current.mode===state.mode?touchEye:-1, previousEye, eyeBlend, greeting});
  if (transition && !reducedMotion.matches) {
    const progress = Math.min(1, (timestamp - transition.started) / 330);
    const offset = ease(progress) * 410 * transition.direction;
    // Clip each page to its own bounds. An offscreen halo must not paint over
    // the neighbouring page, especially across the white WORK background.
    ctx.clearRect(0,0,410,502);
    ctx.save(); ctx.translate(-offset, 0); ctx.beginPath();ctx.rect(0,0,410,502);ctx.clip();render(transition.from); ctx.restore();
    ctx.save(); ctx.translate(410 * transition.direction - offset, 0);ctx.beginPath();ctx.rect(0,0,410,502);ctx.clip();render(activity); ctx.restore();
    if (progress === 1) transition = null;
  } else render(activity);
  document.documentElement.classList.remove('design-pending');
  requestAnimationFrame(frame);
}

function connect() {
  document.querySelector('[data-mode="surf"]').textContent = mascotVersion === 'v1' ? 'SURF' : 'PLAY';
  document.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => changeMode(b.dataset.mode)));
  document.querySelectorAll('[data-expression]').forEach(b => b.addEventListener('click', () => {touchEye = -1; previousEye = -1; state.expression = b.dataset.expression; updateUI();}));
  for (const [id, key, number] of [['hour', 'hour', true], ['weather', 'weather'], ['surf', 'surf', true], ['agent', 'agent'], ['agent-status', 'agentStatus'], ['speed', 'speed', true]]) {
    $(id).addEventListener('input', e => {state[key] = number ? Number(e.target.value) : e.target.value; updateUI();});
  }
  for (const [id, event] of [['success', 'success'], ['failure', 'failure'], ['clear-event', 'none']]) $(id).addEventListener('click', () => {
    state.event = event; updateUI();
    if (mascotVersion === 'v2') {
      activeNotice = event === 'none' ? null : {title: event === 'success' ? 'Task complete' : 'Needs attention', body: state.agent + (event === 'success' ? ' finished its task.' : ' is trying again.')};
      if($('device').classList.contains('controls-visible'))revealControls(true);
    }
  });
  $('pause').addEventListener('click', () => {state.paused = !state.paused; updateUI();});
  $('reset').addEventListener('click', () => {
    state = initialState(); definition = designDefinition(original,customDesign); time = 0; transition = null;
    greetingUntil=0;greeting=0;
    cancelHold(); touchEye = -1; previousEye = -1;
    Object.assign(motion, {x: 0, y: 0, targetX: 0, targetY: 0}); tiltOrigin = null; revealControls(false);
    for (const [id, value] of [['hour', 12], ['weather', 'clear'], ['surf', 2], ['agent', 'Web & Coding'], ['agent-status', 'idle'], ['speed', 1]]) $(id).value = value;
    updateUI();
  });
  $('color').addEventListener('input', e => {
    if (mascotVersion === 'v2') {
      definition.presentationV2 ||= {modeColors: {...defaultModeColors}};
      definition.presentationV2.modeColors ||= {...defaultModeColors};
      definition.presentationV2.modeColors[state.mode] = e.target.value;
    } else definition.expressions[activity.expression].color = e.target.value;
    updateUI();
  });
  $('dot-radius').addEventListener('input', e => {definition.eyes.dotRadius = Number(e.target.value);});
  $('float').addEventListener('input', e => {definition.expressions[activity.expression].bobPx = Number(e.target.value);});
  $('export').addEventListener('click', () => {
    validateDefinitions(definition);
    const url = URL.createObjectURL(new Blob([JSON.stringify(definition, null, 2) + '\n'], {type: 'application/json'}));
    const a = document.createElement('a'); a.href = url; a.download = 'ai-studio-pet-character.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  const device = $('device');
  if(mascotVersion==='v2')eyeAttention=bindEyeAttention(device,()=>attention,()=>customDesign.zoom??1.3);
  if (mascotVersion === 'v2') device.setAttribute('aria-label', 'Studio Mascot. Touch or press Enter to reveal controls. Swipe or use arrow keys to change mode.');
  device.addEventListener('pointermove', e => {
    if (mascotVersion !== 'v2') return;
    const bounds=device.getBoundingClientRect();setDitherPointer(state.mode,{x:(e.clientX-bounds.left)/bounds.width,y:(e.clientY-bounds.top)/bounds.height,inside:true,time});
    if (pointer && !holding && Math.hypot(e.clientX-pointer.x,e.clientY-pointer.y)>12) clearTimeout(holdTimer);
    if (holding && pointer) {
      if (e.cancelable) e.preventDefault();
      motion.targetX=clamp((e.clientX-pointer.x)*.3,18); motion.targetY=clamp((e.clientY-pointer.y)*.2,12);
      if (Math.hypot(e.clientX-pointer.lastX,e.clientY-pointer.lastY)>22 && performance.now()-eyeChangedAt>160) {
        cycleEyes(); pointer.lastX=e.clientX; pointer.lastY=e.clientY;
      }
      return;
    }
    const rect = device.getBoundingClientRect();
    lastPointerMotion = performance.now();
    motion.targetX = clamp(((e.clientX - rect.left) / rect.width - .5) * 12, 6);
    motion.targetY = clamp(((e.clientY - rect.top) / rect.height - .5) * 8, 4);
  });
  device.addEventListener('pointerleave', () => {motion.targetX = 0; motion.targetY = 0;setDitherPointer(state.mode,{inside:false,time});});
  device.addEventListener('click', e => {
    if (suppressTap) {suppressTap = false; return;}
    if(e.target.closest('button,a,input,select'))return;
    revealControls(!device.classList.contains('controls-visible'));
  });
  device.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target === device) {
      e.preventDefault(); revealControls(!device.classList.contains('controls-visible')); return;
    }
    if (e.key === 'Escape') {revealControls(false); device.focus(); return;}
    if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    e.preventDefault(); changeMode(swipeMode(state.mode, e.key === 'ArrowRight' ? -410 : 410, 0));
  });
  device.addEventListener('pointerdown', e => {
    if (e.target.closest('button,a') || !e.isPrimary || e.button !== 0) return;
    const bounds=device.getBoundingClientRect();setDitherPointer(state.mode,{x:(e.clientX-bounds.left)/bounds.width,y:(e.clientY-bounds.top)/bounds.height,inside:true,click:true,time});
    suppressTap=false;
    pointer = {id: e.pointerId, x: e.clientX, y: e.clientY, lastX:e.clientX, lastY:e.clientY}; device.setPointerCapture(e.pointerId);
    if(mascotVersion==='v2') holdTimer=setTimeout(()=>{
      if(!pointer)return; holding=true; revealControls(false); cycleEyes();
    },customDesign.holdMs);
  });
  device.addEventListener('pointerup', e => {
    clearTimeout(holdTimer);
    if (!pointer || e.pointerId !== pointer.id) return;
    if (e.pointerType === 'touch') void enableTilt();
    if(holding) {
      holding=false; suppressTap=true; pointer=null; revealControls(true);
      motion.targetX=0; motion.targetY=0;
      if(device.hasPointerCapture(e.pointerId))device.releasePointerCapture(e.pointerId);
      return;
    }
    suppressTap = Math.hypot(e.clientX - pointer.x, e.clientY - pointer.y) > 12;
    changeMode(swipeMode(state.mode, e.clientX - pointer.x, e.clientY - pointer.y, device.getBoundingClientRect().width)); pointer = null;
    if (device.hasPointerCapture(e.pointerId)) device.releasePointerCapture(e.pointerId);
  });
  device.addEventListener('pointercancel', cancelHold);
  device.addEventListener('lostpointercapture', cancelHold);
  device.addEventListener('contextmenu', e => {if(mascotVersion==='v2')e.preventDefault();});
  document.addEventListener('visibilitychange', () => {lastTimestamp = 0;});
}

try {
  const [characterResponse, behaviorResponse] = await Promise.all([fetch('/character/expressions.json'), fetch('/scenes/behavior.json')]);
  if (!characterResponse.ok || !behaviorResponse.ok) throw Error('Character definitions unavailable');
  definition = validateDefinitions(await characterResponse.json()); original = structuredClone(definition);
  rules = validateRules(await behaviorResponse.json());
  connect(); updateUI(); $('load-status').textContent = ''; requestAnimationFrame(frame);
  if(mascotVersion==='v2')void connectDesignEditor({preview:setDesign,apply:setDesign,mode:value=>changeMode(value)}).then(result=>{if(!result.loaded)$('load-status').textContent=result.error;});
  if(mascotVersion==='v2')connectStudio({receive:report=>{
    studioReport=report;
    const active=report.online&&report.agents.some(a=>a.status==='working'||a.status==='attention');
    state.agentStatus=customDesign.studioAuto&&active?'working':'idle';
    if(customDesign.studioAuto&&location.pathname!=='/customize'){
      if(active&&state.mode==='live'){changeMode('work',true);autoStudioWork=true;}
      else if(!active&&autoStudioWork&&state.mode==='work'&&report.online){changeMode('live',true);autoStudioWork=false;}
    }
    updateUI();
  }});
} catch (error) {
  $('load-status').textContent = 'Your companion could not load. Restart the local server and refresh.';
  console.error(error);
}
