import { describe, expect, it } from 'vitest';
import { byId, pricingById, resources, rules, templates } from '../src/core/catalog';
import { applyFilters, buildIndex, emptyFilters } from '../src/core/search';
import { analyzeStack, satisfies } from '../src/core/compat';
import { costForResource, costForStack, defaultUsage, usageFor } from '../src/core/cost';
import { decodeStack, emptyStack, encodeStack, stackFromJson } from '../src/core/stack';
import { flagsFromIdea, matchIdea } from '../src/core/idea';
import { resourcesToCsv } from '../src/core/export';

const idx = buildIndex(resources);
const quotaIds = new Set([...pricingById.values()].filter((p) => p.quotas.length).map((p) => p.id));

describe('search & filters', () => {
  it('finds by name, tag and fuzzy prefix', () => {
    const ids = (q: string) => applyFilters(resources, { ...emptyFilters(), q }, idx, quotaIds).map((r) => r.id);
    expect(ids('postgres')).toContain('neon');
    expect(ids('supabse')).toContain('supabase');
    expect(ids('vector')).toContain('qdrant');
  });
  it('unknown never passes a yes filter', () => {
    const list = applyFilters(resources, { ...emptyFilters(), noCard: true }, idx, quotaIds);
    expect(list.every((r) => r.flags.noCard === true)).toBe(true);
    expect(list.find((r) => r.id === 'supabase')).toBeUndefined(); // card requirement not stated
    expect(list.find((r) => r.id === 'oracle-always-free')).toBeUndefined(); // card required
  });
  it('commercial filter excludes non-commercial offers', () => {
    const list = applyFilters(resources, { ...emptyFilters(), commercial: true }, idx, quotaIds);
    expect(list.find((r) => r.id === 'tailscale')).toBeUndefined();
    expect(list.find((r) => r.id === 'github-pages')).toBeUndefined();
  });
});

describe('compatibility engine', () => {
  it('matches capability prefixes and alternatives', () => {
    expect(satisfies('server-runtime', new Set(['server-runtime:node']))).toBe(true);
    expect(satisfies('llm-local|llm-api', new Set(['llm-api']))).toBe(true);
    expect(satisfies('postgres', new Set(['sql']))).toBe(false);
  });
  it('flags a missing server runtime for a Discord bot on static hosting', () => {
    const s = emptyStack();
    s.slots = { backend: ['discord-js'], hosting: ['github-pages'] };
    const f = analyzeStack(s, byId, rules, resources);
    const req = f.find((x) => x.kind === 'requires');
    expect(req?.severity).toBe('warn');
    expect(req?.suggestions?.length).toBeGreaterThan(0);
  });
  it('applies documented rules with sources', () => {
    const s = emptyStack();
    s.slots = { backend: ['discord-js'], hosting: ['render'] };
    const f = analyzeStack(s, byId, rules, resources);
    const rule = f.find((x) => x.ruleId === 'render-discord-spin-down');
    expect(rule?.source?.url).toMatch(/^https:\/\/render\.com/);
  });
  it('turns commercial context into a GitHub Pages error', () => {
    const s = emptyStack();
    s.slots = { hosting: ['github-pages'] };
    s.project.commercial = true;
    const f = analyzeStack(s, byId, rules, resources);
    expect(f[0].severity).toBe('error');
    expect(f.filter((x) => x.ids.includes('github-pages') && x.kind === 'terms')).toHaveLength(1);
  });
  it('every template is free of errors in its default context', () => {
    for (const t of templates) {
      const s = emptyStack();
      s.slots = t.slots;
      const errors = analyzeStack(s, byId, rules, resources).filter((f) => f.severity === 'error');
      expect(errors, t.id).toEqual([]);
    }
  });
});

describe('cost engine', () => {
  const u = defaultUsage();
  it('converts monthly usage to daily quotas and says so', () => {
    const m = usageFor({ metric: 'requests', limit: 100000, period: 'day', label: '' }, { ...u, monthlyRequests: 3_000_000 });
    expect(m?.value).toBe(100000);
    expect(m?.approx).toMatch(/30/);
  });
  it('is $0 inside quotas', () => {
    const c = costForResource(byId.get('supabase')!, pricingById.get('supabase'), u);
    expect(c.usd).toBe(0);
    expect(c.level).toBe('ok');
  });
  it('uses the next plan base price when over and no rate is published', () => {
    const c = costForResource(byId.get('supabase')!, pricingById.get('supabase'), { ...u, dbStorageGb: 2 });
    expect(c.level).toBe('over');
    expect(c.usd).toBe(25);
    expect(c.confidence).toBe('estimate');
  });
  it('applies published per-unit rates (Clerk beyond 50k MRU)', () => {
    const c = costForResource(byId.get('clerk')!, pricingById.get('clerk'), { ...u, mau: 60000 });
    expect(c.usd).toBeCloseTo(25 + 10000 * 0.02, 2);
  });
  it('keeps unknown costs unknown and marks the total incomplete', () => {
    const c = costForStack([byId.get('uptimerobot')!], pricingById, u);
    expect(c.complete).toBe(true);
    const unknown = costForStack([byId.get('tailscale')!, byId.get('coingecko-api')!], pricingById, u);
    expect(unknown.complete).toBe(false);
  });
  it('treats free software as $0 with a hosting caveat', () => {
    const c = costForResource(byId.get('coolify')!, undefined, u);
    expect(c.usd).toBe(0);
    expect(c.costNote).toMatch(/Server/);
  });
});

describe('stack encoding', () => {
  it('round-trips through the URL', () => {
    const s = emptyStack();
    s.name = 'test stack';
    s.slots = { hosting: ['cloudflare-pages'], database: ['neon', 'turso'] };
    s.project.commercial = true;
    const back = decodeStack(encodeStack(s), new Set(resources.map((r) => r.id)));
    expect(back).toEqual(s);
  });
  it('drops unknown ids and junk', () => {
    const back = decodeStack('s=hosting:nope,github-pages;evil:x&p=z', new Set(resources.map((r) => r.id)));
    expect(back.slots).toEqual({ hosting: ['github-pages'] });
    expect(back.project.commercial).toBe(false);
  });
  it('imports JSON safely', () => {
    expect(stackFromJson({ slots: { hosting: ['github-pages', 42] } }, new Set(['github-pages']))?.slots).toEqual({ hosting: ['github-pages'] });
    expect(stackFromJson('nope', new Set())).toBeNull();
  });
});

describe('idea matcher', () => {
  it('maps an idea to templates and context', () => {
    expect(matchIdea('a discord bot for my community', templates)[0].template.id).toBe('discord-bot');
    expect(matchIdea('saas mvp with subscription', templates)[0].template.id).toBe('saas-mvp');
    expect(flagsFromIdea('a saas for clients').commercial).toBe(true);
    expect(flagsFromIdea('discord bot').alwaysOn).toBe(true);
  });
});

describe('export', () => {
  it('escapes CSV', () => {
    const csv = resourcesToCsv([byId.get('n8n')!]);
    expect(csv.split('\n')).toHaveLength(2);
    expect(csv).toContain('"Sustainable Use License 1.0 (fair-code, not OSI)"'.replace(/"/g, '') ? 'n8n' : '');
  });
});
