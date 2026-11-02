import {readFileSync,writeFileSync} from 'node:fs';
import {eyeDots,asciiMarks} from '../simulator/renderer.js';
const data=JSON.parse(readFileSync(new URL('../character/expressions.json',import.meta.url),'utf8'));
const colors=data.presentationV2.homePalette;
const parts=['<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="570" viewBox="0 0 1000 570">','<rect width="1000" height="570" fill="#eef0e9"/>','<text x="30" y="40" font-family="Arial,sans-serif" font-size="18" fill="#25352e">STUDIO MASCOT / TEN ORIGINAL EYE EXPRESSIONS</text>'];
data.touchEyes.forEach((e,i)=>{
  const x=20+(i%5)*196,y=65+Math.floor(i/5)*245;
  parts.push(`<rect x="${x}" y="${y}" width="180" height="220" rx="25" fill="#061211"/>`,`<ellipse cx="${x+90}" cy="${y+95}" rx="78" ry="75" fill="${colors[i%5]}"/>`);
  const size=data.presentationV2.eyeSizeMultiplier;
  const points=[];
  for(let side=0;side<2;side++)for(const [dx,dy] of eyeDots(e[side?'right':'left'],data.presentationV2.eyeSampling)){
    points.push([x+(side?126:54)+dx*3.3*size,y+96+dy*3.3*size]);
  }
  for(const m of asciiMarks(points,0,true)){
    const r=1.22*size*data.presentationV2.eyeDotMultiplier,color=['#467b86','#2c5468','#09272b'][m.layer];
    parts.push(`<text x="${m.x}" y="${m.y}" text-anchor="middle" dominant-baseline="central" font-family="Consolas,Menlo,monospace" font-size="${Math.max(4.5,r*2.85)}" font-weight="600" fill="${color}">${m.glyph}</text>`);
  }
  parts.push(`<text x="${x+90}" y="${y+194}" text-anchor="middle" font-family="Arial,sans-serif" font-size="13" fill="#b5c5ba">${String(i+1).padStart(2,'0')} / ${e.name}</text>`);
});
parts.push('</svg>');
writeFileSync(new URL('../character/eye-expression-sheet.svg',import.meta.url),parts.join('\n'));
console.log('Wrote the editable SVG eye-expression sheet.');
