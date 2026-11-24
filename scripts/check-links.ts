/**
 * Checks every URL in the catalog (website, docs, repo, pricing, sources).
 * Polite by design: 4 concurrent requests, explicit User-Agent, 15 s timeout.
 * Writes reports/links.json. Never edits the catalog: humans review the report.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import type { Resource } from '../src/core/schema';

const UA = 'garys-free-stack-linkcheck/0.1 (+https://github.com/911Corp/garys-free-stack)';
const resources: Resource[] = JSON.parse(readFileSync('data/resources.json', 'utf8'));
const urls = new Map<string, string[]>();
for (const r of resources) {
  for (const u of [r.website, r.docs, r.repo, r.pricingUrl, ...r.sources.map((s) => s.url)]) {
    if (!u) continue;
    urls.set(u, [...(urls.get(u) ?? []), r.id]);
  }
}
type Row = { url: string; ids: string[]; status: number | null; ok: boolean; error?: string };

async function check(url: string): Promise<Omit<Row, 'ids'>> {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 15000);
  try {
    let res = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: ctl.signal, headers: { 'user-agent': UA } });
    if (res.status === 405 || res.status === 403) res = await fetch(url, { method: 'GET', redirect: 'follow', signal: ctl.signal, headers: { 'user-agent': UA } });
    return { url, status: res.status, ok: res.status < 400 };
  } catch (e) {
    return { url, status: null, ok: false, error: (e as Error).message };
  } finally {
    clearTimeout(t);
  }
}

async function main() {
  const list = [...urls.keys()];
  const rows: Row[] = [];
  let i = 0;
  await Promise.all(Array.from({ length: 4 }, async () => {
    while (i < list.length) {
      const u = list[i++];
      rows.push({ ...(await check(u)), ids: urls.get(u)! });
    }
  }));
  mkdirSync('reports', { recursive: true });
  writeFileSync('reports/links.json', JSON.stringify({ checkedAt: new Date().toISOString(), rows }, null, 2));
  const bad = rows.filter((r) => !r.ok);
  for (const b of bad) console.log(`${b.status ?? 'ERR'}  ${b.url}  (${b.ids.join(', ')}) ${b.error ?? ''}`);
  console.log(`${rows.length} urls, ${bad.length} need a human look`);
}
main();
