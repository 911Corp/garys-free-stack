import { describe, expect, it } from 'vitest';
import resources from '../data/resources.json';
import pricing from '../data/pricing.json';
import rules from '../data/rules.json';
import templates from '../data/templates.json';
import { validateCatalog } from '../src/core/validate';
import type { Resource } from '../src/core/schema';

describe('catalog data', () => {
  it('passes schema and referential validation', () => {
    const r = validateCatalog({ resources, pricing, rules, templates });
    expect(r.errors).toEqual([]);
  });
  it('has no invented values: every verified resource has a dated official source', () => {
    for (const r of resources as Resource[]) {
      expect(r.sources.length).toBeGreaterThan(0);
      for (const s of r.sources) expect(s.checkedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
  it('non-commercial resources never claim commercial use', () => {
    for (const r of resources as Resource[]) if (r.freeType === 'non-commercial-only') expect(r.flags.commercialUse).not.toBe(true);
  });
  it('flags bad data', () => {
    const bad = structuredClone(resources) as Resource[];
    bad[0].alternatives = ['does-not-exist'];
    bad[1].lastVerified = '2999-01-01';
    const r = validateCatalog({ resources: bad, pricing, rules, templates });
    expect(r.errors.some((e) => e.includes('unknown alternative'))).toBe(true);
    expect(r.errors.some((e) => e.includes('future'))).toBe(true);
  });
  it('ships at least 10 documented templates', () => {
    expect(templates.length).toBeGreaterThanOrEqual(10);
  });
});
