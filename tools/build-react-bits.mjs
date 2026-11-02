import {readFile,writeFile} from 'node:fs/promises';
const root=new URL('../third-party/react-bits/',import.meta.url);
const literal=(source,name)=>{
 const match=source.match(new RegExp('const '+name+' = `([\\s\\S]*?)`;'));
 if(!match)throw Error('Missing shader '+name);return match[1];
};
const source=await readFile(new URL('Dither.jsx',root),'utf8');
const expand=s=>s.replaceAll('${MAX_TRAIL}','16').replaceAll('${MAX_RIPPLES}','4').replaceAll('${MAX_PALETTE}','8').replaceAll('${RIPPLE_SECONDS.toFixed(2)}','1.60');
const shaders={wave:expand(literal(source,'WAVE_FRAGMENT')),dither:expand(literal(source,'DITHER_FRAGMENT'))};
await writeFile(new URL('../simulator/react-bits-shaders.js',import.meta.url),'// Adapted React Bits GLSL, David Haz. MIT + Commons Clause.\n// Pinned 4dc7b5b7772e1217c8fb8d2a7aa074302180e5b4. See /third-party/react-bits/LICENSE.md.\nexport const SHADERS='+JSON.stringify(shaders,null,2)+';\n');
console.log('Extracted the original two-pass React Bits Dither shaders.');
