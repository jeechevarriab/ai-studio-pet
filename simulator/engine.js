export const MODES = Object.freeze(['live', 'work', 'surf', 'sleep']);
export const EXPRESSIONS = Object.freeze(['idle', 'happy', 'focused', 'sleeping']);
export const AGENTS = Object.freeze(['Manager', 'IT', 'Design', 'Animation', 'Web & Coding']);
export const initialState = () => ({mode: 'live', expression: 'auto', hour: 12, weather: 'clear', surf: 2, agent: 'Web & Coding', agentStatus: 'idle', event: 'none', paused: false, speed: 1});
export const defaultRules = Object.freeze({sleepBeforeHour: 7, sleepFromHour: 22, surfThreshold: 3, rules: ['sleep', 'failure', 'working', 'success', 'rain', 'surf', 'idle']});

export function validateDefinitions(data) {
  if (data?.schemaVersion !== 1 || data.designWidth !== 410 || data.designHeight !== 502) throw Error('Unsupported character dimensions or schema');
  const color = value => /^#[0-9a-f]{6}$/i.test(value);
  if (!color(data.body?.color) || !color(data.body?.shadowColor) || !color(data.eyes?.color)) throw Error('Invalid character color');
  for (const [key, min, max] of [['width', 100, 300], ['height', 100, 280], ['radius', 0, 100]]) {
    if (!Number.isFinite(data.body[key]) || data.body[key] < min || data.body[key] > max) throw Error('Invalid body geometry');
  }
  for (const [key, min, max] of [['dotRadius', 1, 4], ['spacing', 5, 12], ['separation', 45, 100]]) {
    if (!Number.isFinite(data.eyes[key]) || data.eyes[key] < min || data.eyes[key] > max) throw Error('Invalid eye geometry');
  }
  for (const name of EXPRESSIONS) {
    const e = data.expressions?.[name];
    if (!e || !color(e.color) || !Number.isFinite(e.periodMs) || e.periodMs < 500 || !Number.isFinite(e.bobPx) || e.bobPx < 0 || e.bobPx > 20 || !Number.isFinite(e.blinkMs) || e.blinkMs < 0 || e.blinkMs > 500) throw Error('Invalid expression ' + name);
    for (const side of ['left', 'right']) {
      if (!Array.isArray(e[side]) || e[side].length !== 7 || e[side].some(row => !/^[01]{5}$/.test(row))) throw Error('Eyes must be 5 × 7 binary matrices');
    }
  }
  if(data.touchEyes!==undefined) {
    const shapes=['orbit','crescent','arc','drop','prism','ribbon','intent','squint','sleepy','starlit'];
    if(!Array.isArray(data.touchEyes)||data.touchEyes.length!==10||new Set(data.touchEyes.map(e=>e.name)).size!==10)throw Error('Ten distinct touch eye expressions are required');
    for(const entry of data.touchEyes)for(const side of ['left','right']) {
      const e=entry[side]; if(!e||!shapes.includes(e.shape)||!Number.isFinite(e.tilt)||Math.abs(e.tilt)>1)throw Error('Invalid touch eye geometry');
      for(const key of ['pupilX','pupilY'])if(e[key]!==undefined&&(!Number.isFinite(e[key])||Math.abs(e[key])>1))throw Error('Invalid pupil offset');
    }
  }
  return data;
}

export function validateRules(rules) {
  if (rules?.schemaVersion !== 1 || !Array.isArray(rules.rules) || rules.rules.length !== 7 || new Set(rules.rules).size !== 7 || rules.rules.some(x => !defaultRules.rules.includes(x))) throw Error('Invalid behavior rules');
  for (const key of ['sleepBeforeHour', 'sleepFromHour', 'surfThreshold']) if (!Number.isFinite(rules[key]) || rules[key] < 0 || rules[key] > (key === 'surfThreshold' ? 6 : 24)) throw Error('Invalid behavior threshold');
  if (rules.rules.at(-1) !== 'idle') throw Error('Idle must remain the fallback rule');
  return rules;
}

export function deriveActivity(state, config = defaultRules) {
  const options = {
    sleep: {match: state.hour < config.sleepBeforeHour || state.hour >= config.sleepFromHour, scene: 'sleep', expression: 'sleeping', caption: 'A little time to recharge.', label: 'Resting'},
    failure: {match: state.event === 'failure', scene: 'work', expression: 'focused', caption: 'A small setback. Working on it.', label: 'Trying again'},
    working: {match: state.agentStatus === 'working', scene: 'work', expression: 'focused', caption: state.agent + ' is making things happen.', label: 'In the flow'},
    success: {match: state.event === 'success', scene: 'live', expression: 'happy', caption: 'One more little win.', label: 'Well done'},
    rain: {match: state.weather === 'rain', scene: 'rain', expression: 'idle', caption: 'Rain outside. Cozy in here.', label: 'Staying cozy'},
    surf: {match: state.surf >= config.surfThreshold, scene: 'surf', expression: 'happy', caption: 'There is a good wave out there.', label: 'Wave watching'},
    idle: {match: true, scene: 'live', expression: 'idle', caption: 'A quiet moment. A world of possibilities.', label: 'Just being'}
  };
  let activity = options[config.rules.find(rule => options[rule].match) || 'idle'];
  if (state.mode === 'work') activity = options.failure.match ? options.failure : {...options.working, caption: state.agentStatus === 'working' ? options.working.caption : 'Ready when your studio is.', label: state.agentStatus === 'working' ? 'In the flow' : 'Standing by', expression: state.agentStatus === 'working' ? 'focused' : 'idle'};
  if (state.mode === 'surf') activity = {...options.surf, expression: state.surf >= config.surfThreshold ? 'happy' : 'idle', caption: state.surf >= config.surfThreshold ? options.surf.caption : 'Waiting for the next little wave.'};
  if (state.mode === 'sleep') activity = options.sleep;
  return {...activity, expression: state.expression === 'auto' ? activity.expression : state.expression};
}

export function swipeMode(mode, dx, dy, width = 410) {
  if (!Number.isFinite(dx) || !Number.isFinite(dy) || Math.abs(dx) < Math.max(38, width * .14) || Math.abs(dx) < Math.abs(dy) * 1.25) return mode;
  const index = MODES.indexOf(mode);
  return MODES[Math.max(0, Math.min(MODES.length - 1, index + (dx < 0 ? 1 : -1)))];
}

export function stepTime(time, delta, paused, speed = 1) {
  return time + (paused ? 0 : Math.max(0, Math.min(delta, 100)) * Math.max(.25, Math.min(speed, 2)));
}
export const formatHour = hour => {
  const normalized = ((Math.floor(hour) % 24) + 24) % 24;
  return `${normalized % 12 || 12}:00 ${normalized < 12 ? 'AM' : 'PM'}`;
};
export const ease = t => 1 - (1 - Math.max(0, Math.min(t, 1))) ** 3;
