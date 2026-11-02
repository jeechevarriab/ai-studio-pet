import {readFile,writeFile} from 'node:fs/promises';
const root=new URL('../third-party/react-bits/',import.meta.url);
const literal=(source,name)=>{
 const match=source.match(new RegExp('const '+name+' = `([\\s\\S]*?)`;'));
 if(!match)throw Error('Missing shader '+name);return match[1];
};
const sources=Object.fromEntries(await Promise.all(['Aurora','Iridescence','ColorBends','Silk'].map(async name=>[name,await readFile(new URL(name+'.jsx',root),'utf8')])));
const shaders={
 aurora:literal(sources.Aurora,'FRAGMENT').replaceAll('${MAX_STOPS}','5').replaceAll('${MAX_LAYERS}','3'),
 iridescence:literal(sources.Iridescence,'FRAGMENT'),
 bends:'#version 300 es\nprecision highp float;\nout vec4 outColor;\n'+literal(sources.ColorBends,'frag').replaceAll('${MAX_COLORS}','8').replace('varying vec2 vUv;','in vec2 vUv;').replaceAll('gl_FragColor','outColor'),
 silk:literal(sources.Silk,'COMPOSITE').replace('${SILK}',literal(sources.Silk,'SILK'))
};
await writeFile(new URL('../simulator/react-bits-shaders.js',import.meta.url),'// Adapted React Bits GLSL, David Haz. MIT + Commons Clause.\n// Pinned 4dc7b5b7772e1217c8fb8d2a7aa074302180e5b4. See /third-party/react-bits/LICENSE.md.\nexport const SHADERS='+JSON.stringify(shaders,null,2)+';\n');
console.log('Extracted four pinned React Bits shaders; no React or Three runtime required.');
