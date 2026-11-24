import MiniSearch from 'minisearch';
import type { FreeType, Resource } from './schema';

export interface Filters {
  q: string;
  categories: string[];
  freeTypes: FreeType[];
  roles: string[];
  openSource: boolean;
  noCard: boolean;
  commercial: boolean;
  selfHost: boolean;
  localFirst: boolean;
  noAccount: boolean;
  hasQuotas: boolean;
  complexity: string[];
  verifiedOnly: boolean;
  maxAgeDays: number | null;
}

export const emptyFilters = (): Filters => ({
  q: '', categories: [], freeTypes: [], roles: [], openSource: false, noCard: false, commercial: false,
  selfHost: false, localFirst: false, noAccount: false, hasQuotas: false, complexity: [], verifiedOnly: false, maxAgeDays: null,
});

export function buildIndex(resources: Resource[]) {
  const ms = new MiniSearch<Resource>({
    fields: ['name', 'tagline', 'description', 'tagsText', 'license'],
    storeFields: ['id'],
    extractField: (doc, field) => (field === 'tagsText' ? doc.tags.join(' ').replace(/-/g, ' ') : (doc as unknown as Record<string, string>)[field] ?? ''),
    searchOptions: { boost: { name: 4, tagsText: 2, tagline: 1.5 }, prefix: true, fuzzy: 0.2 },
  });
  ms.addAll(resources);
  return ms;
}

/**
 * Filter semantics: a "yes" filter only keeps resources where the flag is explicitly true.
 * Unknown (null) never passes a yes-filter: we do not pretend to know.
 */
export function applyFilters(resources: Resource[], f: Filters, index: MiniSearch<Resource> | null, quotaIds: Set<string>, today = Date.now()): Resource[] {
  let list = resources;
  if (f.q.trim() && index) {
    const hits = index.search(f.q.trim());
    const rank = new Map(hits.map((h, i) => [h.id as string, i]));
    list = list.filter((r) => rank.has(r.id)).sort((a, b) => rank.get(a.id)! - rank.get(b.id)!);
  }
  return list.filter((r) => {
    if (f.categories.length && !r.categories.some((c) => f.categories.includes(c))) return false;
    if (f.freeTypes.length && !f.freeTypes.includes(r.freeType)) return false;
    if (f.roles.length && !r.roles.some((x) => f.roles.includes(x))) return false;
    if (f.complexity.length && !f.complexity.includes(r.complexity)) return false;
    if (f.openSource && r.flags.openSource !== true) return false;
    if (f.noCard && r.flags.noCard !== true) return false;
    if (f.commercial && r.flags.commercialUse !== true) return false;
    if (f.selfHost && r.flags.selfHostable !== true) return false;
    if (f.localFirst && r.flags.localFirst !== true) return false;
    if (f.noAccount && r.flags.noAccount !== true) return false;
    if (f.hasQuotas && !quotaIds.has(r.id)) return false;
    if (f.verifiedOnly && r.status !== 'verified') return false;
    if (f.maxAgeDays != null && (today - Date.parse(r.lastVerified)) / 86400000 > f.maxAgeDays) return false;
    return true;
  });
}
