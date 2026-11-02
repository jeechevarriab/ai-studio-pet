import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {validateDefinitions, validateRules} from '../simulator/engine.js';
for (const file of ['simulator/app.js', 'simulator/app-view.js', 'simulator/sw.js', 'simulator/engine.js', 'simulator/renderer.js', 'tools/serve.mjs', 'tools/surf.mjs', 'tools/check.mjs']) execFileSync(process.execPath, ['--check', file], {stdio: 'inherit'});
validateDefinitions(JSON.parse(readFileSync('character/expressions.json', 'utf8')));
validateRules(JSON.parse(readFileSync('scenes/behavior.json', 'utf8')));
console.log('Syntax and data validation passed. Buildless simulator: no compilation step.');
