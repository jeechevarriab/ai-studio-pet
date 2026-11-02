const TAU = Math.PI * 2;
function rounded(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function dot(ctx, x, y, radius) { ctx.beginPath(); ctx.arc(x, y, radius, 0, TAU); ctx.fill(); }

function environment(ctx, scene, time, color, amount) {
  ctx.save();
  if (scene === 'surf') {
    for (let row = 0; row < 3; row++) {
      ctx.beginPath();
      for (let x = 0; x <= 410; x += 4) {
        const y = 379 + row * 16 + Math.sin(x / 49 + time / 1400 + row) * (4 + amount * 1.5);
        if (!x) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = color; ctx.globalAlpha = .26 - row * .06; ctx.lineWidth = 1.2; ctx.stroke();
    }
  } else if (scene === 'sleep') {
    ctx.fillStyle = '#b2a9ee'; ctx.globalAlpha = .55;
    for (const [x, y, r] of [[85, 128, 1.5], [326, 143, 1.8], [291, 106, 1], [111, 360, 1.1], [306, 334, 1.2]]) dot(ctx, x, y, r);
    ctx.strokeStyle = '#b2a9ee'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.arc(301, 126, 12, -.8, 3.4); ctx.stroke();
  } else if (scene === 'rain') {
    ctx.strokeStyle = color; ctx.globalAlpha = .22; ctx.lineWidth = 1;
    for (let i = 0; i < 15; i++) {
      const x = 30 + i * 26; if (x > 90 && x < 322) continue;
      const y = 112 + ((i * 83 + time / 25) % 238);
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 3, y + 10); ctx.stroke();
    }
  }
  ctx.restore();
}

export function renderSceneV1(ctx, {activity, definition, time = 0, reducedMotion = false, surf = 2}) {
  const e = definition.expressions[activity.expression];
  const t = reducedMotion ? 0 : time;
  const breath = Math.sin(t / e.periodMs * TAU);
  const bob = breath * e.bobPx;
  ctx.fillStyle = '#050909'; ctx.fillRect(0, 0, 410, 502);
  const glow = ctx.createRadialGradient(205, 266, 12, 205, 266, 200);
  glow.addColorStop(0, e.color + '16'); glow.addColorStop(1, e.color + '00');
  ctx.fillStyle = glow; ctx.fillRect(0, 65, 410, 365);
  environment(ctx, activity.scene, t, e.color, surf);

  ctx.save();
  ctx.translate(205, 361); ctx.scale(1, .16); ctx.fillStyle = e.color + '16';
  ctx.beginPath(); ctx.ellipse(0, 0, 88 - bob * .6, 45, 0, 0, TAU); ctx.fill(); ctx.restore();

  ctx.save(); ctx.translate(205, 256 + bob);
  ctx.scale(1 + breath * .008, 1 - breath * .008);
  const {width: w, height: h, radius} = definition.body;
  rounded(ctx, -w / 2, -h / 2, w, h, radius);
  const body = ctx.createLinearGradient(-90, -100, 95, 120);
  body.addColorStop(0, e.color); body.addColorStop(.43, e.color); body.addColorStop(1, definition.body.shadowColor);
  ctx.fillStyle = body; ctx.fill();
  ctx.save(); ctx.clip();
  const shine = ctx.createRadialGradient(-58, -76, 1, -54, -72, 130);
  shine.addColorStop(0, '#ffffff50'); shine.addColorStop(1, '#ffffff00');
  ctx.fillStyle = shine; ctx.fillRect(-150, -150, 300, 300);
  ctx.fillStyle = '#00171d';
  for (let y = -h / 2; y < h / 2; y += 6) {
    for (let x = -w / 2; x < w / 2; x += 6) {
      const opacity = Math.max(0, (y + 36) / 145) * .17;
      ctx.globalAlpha = opacity; dot(ctx, x, y, 1);
    }
  }
  ctx.restore();
  ctx.strokeStyle = '#ffffff35'; ctx.lineWidth = .8;
  rounded(ctx, -w / 2 + .5, -h / 2 + .5, w - 1, h - 1, radius); ctx.stroke();

  const eyes = definition.eyes;
  const blink = !reducedMotion && e.blinkMs > 0 && t % 5100 > 5100 - e.blinkMs;
  ctx.fillStyle = eyes.color;
  for (let side = 0; side < 2; side++) {
    const matrix = e[side ? 'right' : 'left'];
    for (let row = 0; row < 7; row++) for (let col = 0; col < 5; col++) {
      if (blink ? row === 3 : matrix[row][col] === '1') dot(ctx, (side ? 1 : -1) * eyes.separation / 2 + (col - 2) * eyes.spacing, (row - 3) * eyes.spacing - 6, eyes.dotRadius);
    }
  }
  // One quiet mouth mark, kept subordinate to the expressive eyes.
  ctx.globalAlpha = .65;
  for (let x = -1; x <= 1; x++) dot(ctx, x * 5, 29 + (activity.expression === 'happy' ? (x === 0 ? 3 : 0) : 0), 1.3);
  ctx.restore();

  if (activity.scene === 'work') {
    ctx.save(); ctx.translate(205, 336);
    ctx.fillStyle = '#17252a'; ctx.strokeStyle = '#43616a'; ctx.lineWidth = 1;
    rounded(ctx, -64, -24, 128, 64, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#9bd4e7'; ctx.globalAlpha = .55;
    rounded(ctx, -5, -2, 10, 10, 3); ctx.fill();
    ctx.globalAlpha = 1; ctx.fillStyle = '#263c44';
    rounded(ctx, -74, 39, 148, 5, 2); ctx.fill(); ctx.restore();
  }
}

// V2 is a presentation change only. The V1 renderer above is preserved verbatim
// apart from its export name; behavior, controls and expression data stay shared.
let floatingCache = null;
const defaultPresentationV2 = {modeColors: {live: '#66f4d5', work: '#8fcfff', surf: '#b4f483', sleep: '#b2a9ee'}, idle: {eyeScale: 1.65}, task: {width: 338, height: 300, radius: 112, feather: 13, eyeScale: 1.35}};

function floatingBody(definition, color, time) {
  const {width, height, radius, feather} = (definition.presentationV2 || defaultPresentationV2).task;
  const radii = [Math.sin(time/3100),Math.cos(time/4100),Math.sin(time/3700+2),Math.cos(time/4500+1)].map(v=>Math.round((radius+v*3)*4)/4);
  const key = [width, height, radii, feather, color, definition.body.shadowColor].join(':');
  if (floatingCache?.key === key) return floatingCache.canvas;
  if(floatingCache && performance.now()-floatingCache.updatedAt<100) return floatingCache.canvas;
  const canvas = floatingCache?.canvas || new OffscreenCanvas(410, 502);
  const c = canvas.getContext('2d');
  c.setTransform(1,0,0,1,0,0); c.globalAlpha=1; c.globalCompositeOperation='source-over'; c.filter='none'; c.clearRect(0,0,410,502);
  c.filter = `blur(${feather}px)`;
  c.fillStyle = '#fff';
  rounded(c, 205 - width / 2, 249 - height / 2, width, height, radii); c.fill();
  c.filter = 'none'; c.globalCompositeOperation = 'source-in';
  const gradient = c.createLinearGradient(72, 103, 282, 410);
  gradient.addColorStop(0, '#e6fff8');
  gradient.addColorStop(.21, color);
  gradient.addColorStop(.49, color + 'ed');
  gradient.addColorStop(.76, color + '5c');
  gradient.addColorStop(1, color + '00');
  c.fillStyle = gradient; c.fillRect(0, 0, 410, 502);
  c.globalCompositeOperation = 'source-atop';
  const shade = c.createRadialGradient(288, 361, 0, 288, 361, 260);
  shade.addColorStop(0, definition.body.shadowColor + 'bd');
  shade.addColorStop(1, definition.body.shadowColor + '00');
  c.fillStyle = shade; c.fillRect(0, 0, 410, 502);
  c.fillStyle = '#07292d';
  for (let y = 104; y < 425; y += 6) for (let x = 25; x < 389; x += 6) {
    c.globalAlpha = Math.min(.17, Math.max(0, (y - 170) / 1200));
    dot(c, x, y, .85);
  }
  floatingCache = {key, canvas, updatedAt:performance.now()};
  return canvas;
}

function largeFace(ctx, definition, expression, time, scale, offsetY, reducedMotion) {
  const eyes = definition.eyes;
  const size=definition.presentationV2?.eyeSizeMultiplier||1.4;
  const blink = !reducedMotion && expression.blinkMs > 0 && time % 5100 > 5100 - expression.blinkMs;
  const separation = eyes.separation * scale * 1.18;
  const spacing = eyes.spacing * scale * size;
  ctx.fillStyle = eyes.color;
  for (let side = 0; side < 2; side++) {
    const matrix = expression[side ? 'right' : 'left'];
    for (let row = 0; row < 7; row++) for (let col = 0; col < 5; col++) {
      if (blink ? row === 3 : matrix[row][col] === '1') dot(ctx, 205 + (side ? 1 : -1) * separation / 2 + (col - 2) * spacing, offsetY + (row - 3) * spacing, eyes.dotRadius * scale * size);
    }
  }
}

export function eyeDots(eye) {
  const dots = [];
  for(let row=0;row<11;row++) for(let col=0;col<13;col++) {
    const px=(col-6)/6, py=(row-5)/5;
    const a=eye.tilt||0, x=px*Math.cos(a)+py*Math.sin(a), y=-px*Math.sin(a)+py*Math.cos(a);
    const pupil=((x-(eye.pupilX||0))/.3)**2+((y-(eye.pupilY||0))/.5)**2<1;
    const ellipse=x*x+(y/.88)**2<1;
    let on=false;
    switch(eye.shape) {
      case 'orbit': on=ellipse&&!pupil; break;
      case 'crescent': on=ellipse&&((x+.25)**2+((y-.05)/.84)**2>.67);break;
      case 'arc': on=Math.abs(y-(-.35+.8*x*x))<.2&&Math.abs(x)<.95;break;
      case 'drop': on=x*x+(y+.14*x*x)**2<.87-.18*y&&!pupil;break;
      case 'prism': on=Math.abs(x)+Math.abs(y)*.86<.98&&Math.abs(x)+Math.abs(y)*.7>.38;break;
      case 'ribbon': on=Math.abs(y-.3*Math.sin(x*2.8))<.2&&Math.abs(x)<.95;break;
      case 'intent': on=ellipse&&y>-.45+.35*x&&!pupil;break;
      case 'squint': on=Math.abs(y-.18*x)<.2&&Math.abs(x)<.9;break;
      case 'sleepy': on=y>.05+.35*x*x&&y<.4+.35*x*x&&Math.abs(x)<.95;break;
      case 'starlit': on=Math.abs(x)*Math.abs(y)<.14&&Math.max(Math.abs(x),Math.abs(y))<.9;break;
    }
    if(on)dots.push([col-6,row-5]);
  }
  return dots;
}

function touchFace(ctx, definition, index, scale, y, opacity=1) {
  const expression=definition.touchEyes?.[index]; if(!expression)return;
  scale*=definition.presentationV2?.eyeSizeMultiplier||1.4;
  ctx.save();ctx.fillStyle=definition.eyes.color;ctx.globalAlpha=opacity;
  for(let side=0;side<2;side++) for(const [x,row] of eyeDots(expression[side?'right':'left'])) {
    dot(ctx,205+(side?1:-1)*56+x*4.1*scale,y+row*4.1*scale,1.55*scale*(definition.eyes.dotRadius/2.2));
  }
  ctx.restore();
}

function mixColor(a,b,amount) {
  const rgb = color=>[1,3,5].map(i=>parseInt(color.slice(i,i+2),16));
  const left=rgb(a),right=rgb(b);
  return '#'+left.map((v,i)=>Math.round(v+(right[i]-v)*amount).toString(16).padStart(2,'0')).join('');
}

export function homeColor(presentation, base, time) {
  const palette=[base,...(presentation.homePalette||['#66f4d5','#8fcfff','#b2a9ee','#f3a3b5','#b4f483']).slice(1)];
  const phase=(time%(presentation.homeCycleMs||240000))/(presentation.homeCycleMs||240000)*palette.length;
  const i=Math.floor(phase), blend=(1-Math.cos((phase-i)*Math.PI))/2;
  return mixColor(palette[i],palette[(i+1)%palette.length],blend);
}

function softBlob(ctx, image, time, still) {
  if (still) return ctx.drawImage(image, 0, 0);
  // Draw the texture once. Smooth whole-surface deformation avoids sampling bands.
  ctx.save(); ctx.translate(205, 249);
  ctx.transform(1 + Math.sin(time / 3100) * .009, Math.sin(time / 4700) * .005, Math.cos(time / 3900) * .006, 1 + Math.cos(time / 4100) * .01, 0, 0);
  ctx.translate(-205, -249); ctx.drawImage(image, 0, 0); ctx.restore();
}

export function renderSceneV2(ctx, {activity, definition, time = 0, reducedMotion = false, motion = {x: 0, y: 0}, attention = 0, touchEye = -1, previousEye = -1, eyeBlend = 1}) {
  const presentation = definition.presentationV2 || defaultPresentationV2;
  const e = {...definition.expressions[activity.expression], color: (presentation.modeColors || defaultPresentationV2.modeColors)[activity.mode || 'live']};
  const t = reducedMotion ? 0 : time;
  if((activity.mode||'live')==='live') e.color=mixColor(homeColor(presentation,e.color,t),e.color,attention);
  const breath = Math.sin(t / e.periodMs * TAU);
  ctx.fillStyle = '#050909'; ctx.fillRect(0, 0, 410, 502);
  ctx.save();
    // A single floating treatment across LIVE, WORK, SURF and SLEEP.
    const offsetX = reducedMotion ? 0 : motion.x;
    const offsetY = reducedMotion ? 0 : motion.y;
    ctx.translate(205 + offsetX, 249 + offsetY + attention * 231);
    ctx.rotate(reducedMotion ? 0 : offsetX * .0015);
    ctx.scale(1 + attention * .3, 1 + attention * .3);
    ctx.translate(-205, -249);
    const bob = breath * e.bobPx * 1.7;
    const halo = ctx.createRadialGradient(205, 248, 30, 205, 248, 299);
    halo.addColorStop(0, e.color + '10'); halo.addColorStop(1, e.color + '00');
    ctx.fillStyle = halo; ctx.fillRect(0, 0, 410, 502);
    ctx.translate(0, bob);
    softBlob(ctx, floatingBody(definition, e.color, t), t, reducedMotion);
    const faceY=237-attention*27;
    if(touchEye>=0) {
      if(previousEye>=0&&eyeBlend<1) touchFace(ctx,definition,previousEye,presentation.task.eyeScale,faceY,1-eyeBlend);
      if(previousEye<0&&eyeBlend<1) {ctx.save();ctx.globalAlpha=1-eyeBlend;largeFace(ctx,definition,e,t,presentation.task.eyeScale,faceY,reducedMotion);ctx.restore();}
      touchFace(ctx,definition,touchEye,presentation.task.eyeScale,faceY,eyeBlend);
    } else largeFace(ctx, definition, e, t, presentation.task.eyeScale, faceY, reducedMotion);
  ctx.restore();
}

export function renderScene(ctx, options) {
  if (options.version === 'v1') return renderSceneV1(ctx, options);
  return renderSceneV2(ctx, options);
}
