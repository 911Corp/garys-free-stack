import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CATEGORY_META, FREE_TYPE_META, ROLE_META, pricing, resources } from '../core/catalog';
import { applyFilters, buildIndex, emptyFilters, type Filters } from '../core/search';
import { FREE_TYPES, ROLES, CATEGORIES } from '../core/constants';
import type { FreeType } from '../core/schema';
import { ResourceCard, Voice } from '../components/bits';
import { pick } from '../core/voice';
import { download, resourcesToCsv } from '../core/export';

const index = buildIndex(resources);
const quotaIds = new Set(pricing.filter((p) => p.quotas.length).map((p) => p.id));

function toggle<T>(list: T[], v: T): T[] { return list.includes(v) ? list.filter((x) => x !== v) : [...list, v]; }

export default function Explore() {
  const [params, setParams] = useSearchParams();
  const [f, setF] = useState<Filters>(() => ({ ...emptyFilters(), q: params.get('q') ?? '', categories: params.get('cat') ? [params.get('cat')!] : [], roles: params.get('role') ? [params.get('role')!] : [] }));
  const [sort, setSort] = useState<'relevance' | 'name' | 'recent'>('relevance');
  const [open, setOpen] = useState(false);
  const set = (patch: Partial<Filters>) => setF((x) => ({ ...x, ...patch }));
  const list = useMemo(() => {
    const out = applyFilters(resources, f, index, quotaIds);
    if (sort === 'name') return [...out].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'recent') return [...out].sort((a, b) => b.lastVerified.localeCompare(a.lastVerified));
    return out;
  }, [f, sort]);
  const activeCount = f.categories.length + f.freeTypes.length + f.roles.length + f.complexity.length + [f.openSource, f.noCard, f.commercial, f.selfHost, f.localFirst, f.noAccount, f.hasQuotas, f.verifiedOnly].filter(Boolean).length + (f.maxAgeDays ? 1 : 0);

  const flag = (key: keyof Filters, label: string, hint?: string) => (
    <label className="check" title={hint}><input type="checkbox" checked={f[key] as boolean} onChange={(e) => set({ [key]: e.target.checked } as Partial<Filters>)} />{label}</label>
  );

  return (
    <div className="stack-y">
      <div className="row between">
        <h1 style={{ margin: 0 }}>Explore</h1>
        <div className="row">
          <Link className="btn small ghost" to="/random">random</Link>
          <button className="btn small ghost" onClick={() => download('free-stack-resources.csv', resourcesToCsv(list), 'text/csv')}>export CSV</button>
          <button className="btn small ghost" onClick={() => download('free-stack-resources.json', JSON.stringify(list, null, 2), 'application/json')}>export JSON</button>
        </div>
      </div>
      <form role="search" className="search-big" onSubmit={(e) => e.preventDefault()}>
        <label className="sr-only" htmlFor="q">Search</label>
        <input id="q" type="search" placeholder="search name, tag, license..." value={f.q} onChange={(e) => { set({ q: e.target.value }); setParams(e.target.value ? { q: e.target.value } : {}, { replace: true }); }} />
      </form>
      <div className="explore">
        <aside className={`filters ${open ? 'open' : ''}`} aria-label="Filters">
          <fieldset>
            <legend className="label">quick filters</legend>
            {flag('noCard', 'No credit card', 'Only resources where an official page says no card is needed')}
            {flag('commercial', 'Commercial use allowed')}
            {flag('openSource', 'Open source')}
            {flag('selfHost', 'Self-hostable')}
            {flag('localFirst', 'Local-first')}
            {flag('noAccount', 'No account required')}
            {flag('hasQuotas', 'Has documented quotas')}
            {flag('verifiedOnly', 'Verified only')}
            <p className="small muted" style={{ marginTop: 6 }}>Unknown values never pass a filter.</p>
          </fieldset>
          <fieldset>
            <legend className="label">category</legend>
            <div className="chips">{CATEGORIES.map((c) => <button type="button" key={c} className="chip" aria-pressed={f.categories.includes(c)} onClick={() => set({ categories: toggle(f.categories, c) })}>{CATEGORY_META[c]}</button>)}</div>
          </fieldset>
          <fieldset>
            <legend className="label">stack slot</legend>
            <div className="chips">{ROLES.map((r) => <button type="button" key={r} className="chip" aria-pressed={f.roles.includes(r)} onClick={() => set({ roles: toggle(f.roles, r) })}>{ROLE_META[r].label}</button>)}</div>
          </fieldset>
          <fieldset>
            <legend className="label">type of free</legend>
            <div className="chips">{FREE_TYPES.map((t) => <button type="button" key={t} className="chip" aria-pressed={f.freeTypes.includes(t)} onClick={() => set({ freeTypes: toggle<FreeType>(f.freeTypes, t) })} title={FREE_TYPE_META[t].hint}>{FREE_TYPE_META[t].label}</button>)}</div>
          </fieldset>
          <fieldset>
            <legend className="label">complexity (editorial)</legend>
            <div className="chips">{['easy', 'medium', 'advanced'].map((c) => <button type="button" key={c} className="chip" aria-pressed={f.complexity.includes(c)} onClick={() => set({ complexity: toggle(f.complexity, c) })}>{c}</button>)}</div>
          </fieldset>
          <fieldset>
            <legend className="label">last verification</legend>
            <select aria-label="Last verification" value={f.maxAgeDays ?? ''} onChange={(e) => set({ maxAgeDays: e.target.value ? Number(e.target.value) : null })}>
              <option value="">any time</option><option value="30">last 30 days</option><option value="90">last 90 days</option><option value="180">last 180 days</option>
            </select>
          </fieldset>
          {activeCount > 0 && <button className="btn small ghost" onClick={() => setF({ ...emptyFilters(), q: f.q })}>reset filters</button>}
        </aside>
        <section aria-live="polite">
          <div className="row between" style={{ marginBottom: 12 }}>
            <button className="btn small filter-toggle" aria-expanded={open} onClick={() => setOpen((o) => !o)}>filters{activeCount ? ` (${activeCount})` : ''}</button>
            <span className="small muted">{list.length} result{list.length === 1 ? '' : 's'}</span>
            <label className="small row">sort
              <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} style={{ width: 'auto', minHeight: 32, padding: '4px 8px' }}>
                <option value="relevance">relevance</option><option value="name">name</option><option value="recent">recently verified</option>
              </select>
            </label>
          </div>
          {list.length ? <div className="grid cards">{list.map((r) => <ResourceCard key={r.id} r={r} />)}</div> : <Voice line={pick('emptySearch', f.q.length)} />}
          <p className="small muted" style={{ marginTop: 18 }}>Looking for public data APIs? The <Link to="/apis">API directory</Link> lists 2,500+ community-listed APIs (unverified layer).</p>
        </section>
      </div>
    </div>
  );
}
