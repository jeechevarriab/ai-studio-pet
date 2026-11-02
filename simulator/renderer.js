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

export function renderScene(ctx, {activity, definition, time = 0, reducedMotion = false, surf = 2}) {
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
