import { readFileSync } from 'node:fs';
import { validateCatalog } from '../src/core/validate';

const load = (f: string) => JSON.parse(readFileSync(`data/${f}.json`, 'utf8'));
const res = validateCatalog({ resources: load('resources'), pricing: load('pricing'), rules: load('rules'), templates: load('templates') });
for (const w of res.warnings) console.warn('warn ', w);
for (const e of res.errors) console.error('ERROR', e);
console.log(`catalog: ${res.errors.length} errors, ${res.warnings.length} warnings`);
process.exit(res.errors.length ? 1 : 0);
