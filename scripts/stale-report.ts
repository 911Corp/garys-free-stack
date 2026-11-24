/** Lists resources whose verification is older than STALE_DAYS (default 90) or not "verified". */
import { readFileSync } from 'node:fs';
import type { Resource } from '../src/core/schema';

const days = Number(process.env.STALE_DAYS ?? 90);
const resources: Resource[] = JSON.parse(readFileSync('data/resources.json', 'utf8'));
const now = Date.now();
const rows = resources
  .map((r) => ({ id: r.id, status: r.status, age: Math.floor((now - Date.parse(r.lastVerified)) / 86400000) }))
  .filter((r) => r.age > days || r.status !== 'verified')
  .sort((a, b) => b.age - a.age);
for (const r of rows) console.log(`${String(r.age).padStart(4)}d  ${r.status.padEnd(16)} ${r.id}`);
console.log(`${rows.length} resources need review (threshold ${days} days)`);
