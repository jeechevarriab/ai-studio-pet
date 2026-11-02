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
const floatingCaches = new Map();
const materialMasks = new Map();
const reliefMasks = new Map();
const lightingCanvases = new Map();
const defaultPresentationV2 = {modeColors: {live: '#66f4d5', work: '#ff392c', surf: '#b4f483', sleep: '#b2a9ee'}, idle: {eyeScale: 1.65}, task: {width: 338, height: 300, radius: 112, feather: 13, eyeScale: 1.35}};

function noise(x,y) {
  let n=Math.imul(x+7349,y+9127)^Math.imul(x,374761393)^Math.imul(y,668265263);
  n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295;
}
function cloud(x,y) {
  const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy;
  const sx=fx*fx*(3-2*fx),sy=fy*fy*(3-2*fy);
  return (noise(ix,iy)*(1-sx)+noise(ix+1,iy)*sx)*(1-sy)+(noise(ix,iy+1)*(1-sx)+noise(ix+1,iy+1)*sx)*sy;
}
// A rounded volume: 1 is the forward surface, 0 is the receding silhouette.
// Geometry only; no camera, photo processing or sensor data is stored here.
export function surfaceDepth(x,y,width=338,height=300) {
  const nx=Math.abs((x-205)/(width*.5)),ny=Math.abs((y-249)/(height*.5));
  const radius=Math.cbrt(nx**3+ny**3);
  return Math.sqrt(Math.max(0,1-radius*radius));
}
export function depthLighting(motion={x:0,y:0},time=0,still=false) {
  const clamp=(value,limit)=>Math.max(-limit,Math.min(limit,Number.isFinite(value)?value:0));
  const x=still?0:clamp(motion.x,6),y=still?0:clamp(motion.y,4);
  const drift=still?0:Math.sin(time/5200)*2;
  return {lightX:174+x*5+drift,lightY:205+y*5,shadowX:274-x*4,shadowY:338-y*4};
}
function materialMask(width,height,radius,feather) {
  const key=[width,height,radius,feather].join(':');
  if(materialMasks.has(key))return materialMasks.get(key);
  const canvas=new OffscreenCanvas(410,502),c=canvas.getContext('2d'),image=c.createImageData(410,502);
  const relief=new OffscreenCanvas(410,502),rc=relief.getContext('2d'),shading=rc.createImageData(410,502);
  for(let y=0;y<502;y++)for(let x=0;x<410;x++) {
    const mottle=cloud(x/19,y/19)*.65+cloud(x/7,y/7)*.35;
    const qx=Math.abs(x-205)-width/2+radius,qy=Math.abs(y-249)-height/2+radius;
    const distance=Math.hypot(Math.max(qx,0),Math.max(qy,0))+Math.min(Math.max(qx,qy),0)-radius+(mottle-.5)*7;
    const f=feather*1.8,u=Math.max(0,Math.min(1,.5-distance/(f*2)));
    const coverage=u*u*(3-2*u);
    const lowerFade=1-Math.max(0,Math.min(1,(y-290)/170))**1.5;
    const alpha=coverage*lowerFade*(.87+mottle*.1+noise(x,y)*.03);
    const i=(y*410+x)*4;image.data[i]=image.data[i+1]=image.data[i+2]=255;image.data[i+3]=Math.round(alpha*255);
    // The depth field supplies soft edge occlusion without hard contour bands.
    shading.data[i+3]=Math.round((1-surfaceDepth(x,y,width,height))*.86*coverage*255);
  }
  c.putImageData(image,0,0);rc.putImageData(shading,0,0);
  if(materialMasks.size>=8){materialMasks.clear();reliefMasks.clear();}
  materialMasks.set(key,canvas);reliefMasks.set(key,relief);return canvas;
}
// Each page owns a distinct canvas: drawing the incoming page must never repaint
// the outgoing page's cached texture or borrow its throttle window.
export function floatingBody(definition, color, time, page = 'live') {
  const {width, height, radius, feather} = (definition.presentationV2 || defaultPresentationV2).task;
  const slot=[page,width,height,radius,feather,definition.body.shadowColor,definition.body.highlightColor,definition.body.darkSurface,definition.body.texture,definition.body.depth,definition.body.brightness].join(':');
  const cached=floatingCaches.get(slot);
  if(cached?.color===color)return cached.canvas;
  if(cached&&performance.now()-cached.updatedAt<80)return cached.canvas;
  const canvas = cached?.canvas || new OffscreenCanvas(410, 502);
  const c = canvas.getContext('2d');
  c.setTransform(1,0,0,1,0,0); c.globalAlpha=1; c.globalCompositeOperation='source-over'; c.filter='none'; c.clearRect(0,0,410,502);
  const gradient = c.createRadialGradient(167,205,8,200,249,240);
  gradient.addColorStop(0, mixColor(color,definition.body.highlightColor||'#f1fff9',Math.min(.9,.58*(definition.body.brightness??1))));
  gradient.addColorStop(.34,definition.body.darkSurface?color:mixColor(color,'#ffffff',.22));
  gradient.addColorStop(.68,color);
  gradient.addColorStop(1,color+'58');
  c.fillStyle = gradient; c.fillRect(0, 0, 410, 502);
  c.globalCompositeOperation='destination-in';c.drawImage(materialMask(width,height,radius,feather),0,0);
  c.globalCompositeOperation = 'source-atop';
  c.globalAlpha=Math.min(1,(definition.body.depth??1)/2);c.drawImage(reliefMasks.get([width,height,radius,feather].join(':')),0,0);c.globalAlpha=1;
  const shade = c.createRadialGradient(287,382,0,260,350,250);
  shade.addColorStop(0, definition.body.shadowColor + '8a');
  shade.addColorStop(1, definition.body.shadowColor + '00');
  c.fillStyle = shade; c.fillRect(0, 0, 410, 502);
  // Stable, irregular translucent pores; no animated noise, scanlines or hard grid.
  for(let y=85;y<430;y+=5)for(let x=18;x<398;x+=5) {
    const n=noise(x,y),m=cloud(x/19,y/19);
    c.globalAlpha=(definition.body.darkSurface ? .009+m*.012 : .035+m*.045)*(definition.body.texture??1);c.fillStyle=n>.45?'#ffffff':'#082b30';
    dot(c,x+(n-.5)*3,y+(noise(y,x)-.5)*3,.5+n*.65);
  }
  if(floatingCaches.size>=16&&!cached)floatingCaches.clear();
  floatingCaches.set(slot,{color,canvas,updatedAt:performance.now()});
  return canvas;
}

function litBody(image,definition,motion,time,still,page) {
  // Per-page scratch surfaces retain the swipe isolation; light moves smoothly
  // every frame over a static depth/texture field, with no regenerated noise.
  let canvas=lightingCanvases.get(page);
  if(!canvas){canvas=new OffscreenCanvas(410,502);lightingCanvases.set(page,canvas);}
  const travel=definition.body.lightTravel??1;
  const c=canvas.getContext('2d'),light=depthLighting({x:motion.x*travel,y:motion.y*travel},time,still||travel===0),dark=definition.body.darkSurface;
  c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.globalCompositeOperation='source-over';c.clearRect(0,0,410,502);c.drawImage(image,0,0);
  c.globalCompositeOperation='source-atop';
  c.globalAlpha=Math.min(1,(definition.body.light??1)/2);
  const highlight=c.createRadialGradient(light.lightX,light.lightY,4,light.lightX,light.lightY,170);
  highlight.addColorStop(0,dark?'#197d9c14':'#f3fff964');highlight.addColorStop(.5,dark?'#197d9c0a':'#f3fff928');highlight.addColorStop(1,'#ffffff00');
  c.fillStyle=highlight;c.fillRect(0,0,410,502);
  const shadow=c.createRadialGradient(light.shadowX,light.shadowY,10,light.shadowX,light.shadowY,205);
  shadow.addColorStop(0,'#00080d60');shadow.addColorStop(1,'#00080d00');c.fillStyle=shadow;c.fillRect(0,0,410,502);
  return canvas;
}

// One independent glyph at each sample: a dot OR a cross, never a cross in a dot.
// The slow spatial field creates overlapping-looking bands without changing the
// silhouette or moving/flickering glyphs as the character animates.
export function eyeMarks(points) {
  return points.map(([x,y])=>{
    const field=Math.sin(x*.061+y*.043)+.48*Math.cos(x*.031-y*.09);
    const type=field>.22?'cross':'dot';
    const layer=field>.9?0:field>-.4?1:2;
    return {x,y,type,layer};
  });
}
export function asciiMarks(points,time=0,still=false,alphabets=['.:+','x*o','O0#@']) {
  return eyeMarks(points).map(mark=>{
    const seed=Math.abs(Math.round(mark.x*7+mark.y*11));
    const phase=(still?0:Math.max(0,time)/2200)+(seed%17)/17;
    const step=Math.floor(phase),fraction=phase-step;
    const chars=alphabets[mark.layer],index=(seed+step)%chars.length;
    const u=still?0:Math.max(0,(fraction-.78)/.22);
    return {...mark,glyph:chars[index],nextGlyph:chars[(index+1)%chars.length],blend:u*u*(3-2*u)};
  });
}
function asciiEyes(ctx, points, radius, eyes, time, still) {
  const colors=eyes.layers||['#467b86','#2c5468',eyes.color];
  const speed=eyes.flowSpeed??1;
  const marks=asciiMarks(points,time*speed,still||speed===0,eyes.asciiPalette);
  ctx.save();const alpha=ctx.globalAlpha;
  ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.font=`600 ${Math.max(4.5,radius*2.85)}px ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace`;
  if(eyes.luminous){ctx.shadowColor='#61dcff';ctx.shadowBlur=1;}
  for(let layer=0;layer<3;layer++) {
    const opacity=alpha*[.78,.92,1][layer];ctx.fillStyle=colors[layer];
    for(const m of marks)if(m.layer===layer){
      ctx.globalAlpha=opacity*(1-m.blend);ctx.fillText(m.glyph,m.x,m.y);
      if(m.blend>0){ctx.globalAlpha=opacity*m.blend;ctx.fillText(m.nextGlyph,m.x,m.y);}
    }
  }
  ctx.restore();
}

function largeFace(ctx, definition, expression, time, scale, offsetY, reducedMotion) {
  const eyes = definition.eyes;
  const size=definition.presentationV2?.eyeSizeMultiplier||1.4;
  const dotSize=definition.presentationV2?.eyeDotMultiplier||.6;
  const density=definition.presentationV2?.eyeSampling||2;
  const blinkCycle=5100/(eyes.blinkSpeed||1);
  const blink = !reducedMotion && eyes.blinkSpeed!==0 && expression.blinkMs > 0 && time % blinkCycle > blinkCycle - expression.blinkMs;
  const separation = eyes.separation * scale * 1.18 * (size/1.4);
  const spacing = eyes.spacing * scale * size;
  const points=[];
  for (let side = 0; side < 2; side++) {
    for (let ri = 0; ri <= 6*density; ri++) for (let ci = 0; ci <= 4*density; ci++) {
      const row=ri/density,col=ci/density,x=(col-2)/2,y=(row-3)/3;
      let on=x*x/.94+y*y<1;
      if(expression.label==='Happy')on=Math.abs(y-(-.28+.7*x*x))<.2&&x*x+y*y<1;
      if(expression.label==='Focused')on=on&&y>-.34+.15*x*(side?1:-1)+.2*x*x;
      if(expression.label==='Sleeping')on=Math.abs(y-(.32-.32*x*x))<.16&&Math.abs(x)<.9;
      if (blink ? row === 3&&Math.abs(x)<.9 : on) points.push([205+(side?1:-1)*separation/2+(col-2)*spacing,offsetY+(row-3)*spacing]);
    }
  }
  asciiEyes(ctx,points,eyes.dotRadius*scale*size*dotSize,eyes,time,reducedMotion);
}

const eyeDotCache=new Map();
export function eyeDots(eye, density=1) {
  const key=JSON.stringify(eye)+':'+density;if(eyeDotCache.has(key))return eyeDotCache.get(key);
  const dots = [];
  for(let row=0;row<=10*density;row++) for(let col=0;col<=12*density;col++) {
    const px=(col/density-6)/6, py=(row/density-5)/5;
    const a=eye.tilt||0, x=px*Math.cos(a)+py*Math.sin(a), y=-px*Math.sin(a)+py*Math.cos(a);
    const pupil=((x-(eye.pupilX||0))/.3)**2+((y-(eye.pupilY||0))/.5)**2<1;
    const ellipse=x*x+(y/.88)**2<1;
    let on=false;
    switch(eye.shape) {
      case 'orbit': on=ellipse&&!pupil; break;
      case 'crescent': on=ellipse&&((x+.25)**2+((y-.05)/.84)**2>.67);break;
      case 'arc': on=Math.abs(y-(-.35+.8*x*x))<.21&&x*x+(y+.1)**2<.95;break;
      case 'drop': on=x*x+(y+.14*x*x)**2<.87-.18*y&&!pupil;break;
      case 'prism': on=Math.abs(x)**1.55+Math.abs(y*.94)**1.55<.91&&(x/.38)**2+(y/.4)**2>1;break;
      case 'ribbon': on=Math.abs(y-.3*Math.sin(x*2.8))<.21&&x*x+y*y*.7<.9;break;
      case 'intent': on=ellipse&&y>-.38+.12*x+.23*x*x&&!pupil;break;
      case 'squint': on=Math.abs(y-.18*x)<.23&&x*x+y*y<.8;break;
      case 'sleepy': on=y>.18-.32*x*x&&y<.56-.32*x*x&&x*x+(y-.25)**2<.9;break;
      case 'starlit': {const r=Math.hypot(x,y),theta=Math.atan2(y,x);on=r<.67+.13*Math.cos(theta*4);break;}
    }
    if(on)dots.push([col/density-6,row/density-5]);
  }
  if(eyeDotCache.size>64)eyeDotCache.clear();eyeDotCache.set(key,dots);return dots;
}

function touchFace(ctx, definition, index, scale, y, opacity=1, time=0, still=false) {
  const expression=definition.touchEyes?.[index]; if(!expression)return;
  const size=definition.presentationV2?.eyeSizeMultiplier||1.4;
  scale*=size;
  ctx.save();ctx.globalAlpha=opacity;const points=[];
  const sampling=Math.max(1,(definition.presentationV2?.eyeSampling||2)*4.1/definition.eyes.spacing);
  for(let side=0;side<2;side++) for(const [x,row] of eyeDots(expression[side?'right':'left'],sampling)) {
    points.push([205+(side?1:-1)*56*(size/1.4)+x*4.1*scale,y+row*4.1*scale]);
  }
  asciiEyes(ctx,points,definition.eyes.dotRadius*scale*(definition.presentationV2?.eyeDotMultiplier||.6),definition.eyes,time,still);
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

function softBlob(ctx, image, time, still, amount=1) {
  if (still) return ctx.drawImage(image, 0, 0);
  // Draw the texture once. Smooth whole-surface deformation avoids sampling bands.
  ctx.save(); ctx.translate(205, 249);
  ctx.transform(1 + Math.sin(time / 3100) * .009*amount, Math.sin(time / 4700) * .005*amount, Math.cos(time / 3900) * .006*amount, 1 + Math.cos(time / 4100) * .01*amount, 0, 0);
  ctx.translate(-205, -249); ctx.drawImage(image, 0, 0); ctx.restore();
}

export function renderSceneV2(ctx, {activity, definition, time = 0, reducedMotion = false, motion = {x: 0, y: 0}, attention = 0, touchEye = -1, previousEye = -1, eyeBlend = 1, greeting=0}) {
  const presentation = definition.presentationV2 || defaultPresentationV2;
  const custom=presentation.custom||{};
  const e = {...definition.expressions[activity.expression], color: (presentation.modeColors || defaultPresentationV2.modeColors)[activity.mode || 'live']};
  const t = reducedMotion ? 0 : time;
  if((activity.mode||'live')==='live'&&custom.colorCycle!==false) e.color=mixColor(homeColor(presentation,e.color,t),e.color,attention);
  const breath = Math.sin(t / e.periodMs * TAU);
  const workTheme=activity.mode==='work';
  const playTheme=activity.mode==='surf';
  const eyeColor=custom[(activity.mode||'live')+'Eye'];
  const paintedDefinition=workTheme?{...definition,body:{...definition.body,shadowColor:'#3b0605',highlightColor:'#fff4ef'},eyes:{...definition.eyes,color:eyeColor||'#361423',layers:['#9b4868','#62253e',eyeColor||'#361423']}}:playTheme?{...definition,body:{...definition.body,shadowColor:'#000306',highlightColor:'#071117',darkSurface:true},eyes:{...definition.eyes,color:eyeColor||'#dcfcff',layers:['#3988bf','#7bdcf6',eyeColor||'#dcfcff'],luminous:true}}:{...definition,eyes:{...definition.eyes,color:eyeColor||definition.eyes.color}};
  if(playTheme)e.color=custom.surfColor||'#01070b';
  ctx.fillStyle = custom[(activity.mode||'live')+'Background']||(workTheme?'#f2efed':playTheme?'#078fe3':'#050909'); ctx.fillRect(0, 0, 410, 502);
  ctx.save();
    // A single floating treatment across LIVE, WORK, SURF and SLEEP.
    const offsetX = reducedMotion ? 0 : motion.x*(custom.bodySway??1);
    const offsetY = reducedMotion ? 0 : motion.y*(custom.bodySway??1);
    ctx.translate(205 + offsetX, 249 + offsetY + attention * 231);
    ctx.rotate(reducedMotion ? 0 : offsetX * .0015);
    ctx.scale(1 + attention * ((custom.zoom??1.3)-1), 1 + attention * ((custom.zoom??1.3)-1));
    ctx.translate(-205, -249);
    const bob = breath * e.bobPx * 1.7*(custom.float??1);
    const halo = ctx.createRadialGradient(205, 248, 30, 205, 248, 299);
    halo.addColorStop(0, e.color + '10'); halo.addColorStop(1, e.color + '00');
    ctx.fillStyle = halo; ctx.fillRect(0, 0, 410, 502);
    ctx.translate(0, bob);
    const body=floatingBody(paintedDefinition,e.color,t,activity.mode||'live');
    softBlob(ctx,litBody(body,paintedDefinition,motion,t,reducedMotion,activity.mode||'live'),t,reducedMotion,custom.liquid??1);
    const faceY=237-attention*27;
    // Eyes travel farther than the body, making the corner glance readable.
    ctx.translate(reducedMotion?0:Math.max(-12,Math.min(12,motion.x*1.8))*(custom.gaze??1),reducedMotion?0:Math.max(-9,Math.min(9,motion.y*2))*(custom.gaze??1));
    if(greeting>.01) {
      ctx.save();ctx.globalAlpha=1-greeting;largeFace(ctx,paintedDefinition,e,t,presentation.task.eyeScale,faceY,reducedMotion);ctx.restore();
      ctx.save();ctx.globalAlpha=greeting;largeFace(ctx,paintedDefinition,definition.expressions.happy,t,presentation.task.eyeScale,faceY,reducedMotion);ctx.restore();
    } else if(touchEye>=0) {
      if(previousEye>=0&&eyeBlend<1) touchFace(ctx,paintedDefinition,previousEye,presentation.task.eyeScale,faceY,1-eyeBlend,t,reducedMotion);
      if(previousEye<0&&eyeBlend<1) {ctx.save();ctx.globalAlpha=1-eyeBlend;largeFace(ctx,paintedDefinition,e,t,presentation.task.eyeScale,faceY,reducedMotion);ctx.restore();}
      touchFace(ctx,paintedDefinition,touchEye,presentation.task.eyeScale,faceY,eyeBlend,t,reducedMotion);
    } else largeFace(ctx, paintedDefinition, e, t, presentation.task.eyeScale, faceY, reducedMotion);
  ctx.restore();
}

export function renderScene(ctx, options) {
  if (options.version === 'v1') return renderSceneV1(ctx, options);
  return renderSceneV2(ctx, options);
}
