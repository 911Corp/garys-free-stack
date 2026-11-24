import { useEffect, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { byId, pricingById, resources } from '../core/catalog';
import { FreeTypeBadge, StatusBadge, Tri, Voice } from '../components/bits';
import { useApp, MAX_COMPARE } from '../state';
import { download } from '../core/export';
import type { Resource } from '../core/schema';

const yn = (v: boolean | null) => (v === null ? 'unknown' : v ? 'yes' : 'no');

export default function Compare() {
  const [params, setParams] = useSearchParams();
  const { compare, setCompare, toast } = useApp();
  const fromUrl = (params.get('ids') ?? '').split(',').filter((x) => byId.has(x));
  const ids = fromUrl.length ? fromUrl.slice(0, MAX_COMPARE) : compare;
  useEffect(() => { if (fromUrl.length) setCompare(fromUrl); }, [params.get('ids')]); // eslint-disable-line react-hooks/exhaustive-deps
  const list = ids.map((id) => byId.get(id)!).filter(Boolean);
  const setIds = (next: string[]) => { setCompare(next); setParams(next.length ? { ids: next.join(',') } : {}, { replace: true }); };

  const rows: [string, (r: Resource) => ReactNode, (r: Resource) => string][] = [
    ['type of free', (r) => <FreeTypeBadge t={r.freeType} />, (r) => r.freeType],
    ['data status', (r) => <><StatusBadge s={r.status} /><div className="small muted">{r.lastVerified}</div></>, (r) => `${r.status} ${r.lastVerified}`],
    ['quotas', (r) => { const p = pricingById.get(r.id); return p?.quotas.length ? <ul className="clean small">{p.quotas.map((q, i) => <li key={i}>{q.label}</li>)}</ul> : <span className="tri-unk">none recorded</span>; }, (r) => pricingById.get(r.id)?.quotas.map((q) => q.label).join('; ') || 'none recorded'],
    ['when exceeded', (r) => pricingById.get(r.id)?.onExceed ?? <span className="tri-unk">unknown</span>, (r) => pricingById.get(r.id)?.onExceed ?? 'unknown'],
    ['next paid step', (r) => { const n = pricingById.get(r.id)?.nextPlan; return n ? `${n.name} $${n.usdPerMonth}/mo` : <span className="tri-unk">not recorded</span>; }, (r) => { const n = pricingById.get(r.id)?.nextPlan; return n ? `${n.name} $${n.usdPerMonth}/mo` : 'not recorded'; }],
    ['card required', (r) => <Tri v={r.flags.noCard === null ? null : !r.flags.noCard} good={false} />, (r) => yn(r.flags.noCard === null ? null : !r.flags.noCard)],
    ['commercial use', (r) => <Tri v={r.flags.commercialUse} />, (r) => yn(r.flags.commercialUse)],
    ['open source', (r) => <Tri v={r.flags.openSource} good="neutral" />, (r) => yn(r.flags.openSource)],
    ['license', (r) => r.license ?? <span className="tri-unk">unknown</span>, (r) => r.license ?? 'unknown'],
    ['self-hostable', (r) => <Tri v={r.flags.selfHostable} good="neutral" />, (r) => yn(r.flags.selfHostable)],
    ['restrictions', (r) => <ul className="clean limits small">{r.restrictions.map((x) => <li key={x}>{x}</li>)}</ul>, (r) => r.restrictions.join('; ')],
    ['pros', (r) => <ul className="clean small">{r.pros.map((x) => <li key={x}>{x}</li>)}</ul>, (r) => r.pros.join('; ')],
    ['cons', (r) => <ul className="clean cons small">{r.cons.map((x) => <li key={x}>{x}</li>)}</ul>, (r) => r.cons.join('; ')],
    ['alternatives', (r) => r.alternatives.map((a) => <div key={a}><Link to={`/r/${a}`}>{byId.get(a)?.name}</Link></div>), (r) => r.alternatives.map((a) => byId.get(a)?.name).join(', ')],
    ['pricing page', (r) => r.pricingUrl ? <a href={r.pricingUrl} target="_blank" rel="noopener">official ↗</a> : <span className="tri-unk">none</span>, (r) => r.pricingUrl ?? 'none'],
  ];
  const md = () => {
    const head = `| | ${list.map((r) => r.name).join(' | ')} |\n|---|${list.map(() => '---').join('|')}|`;
    const body = rows.map(([label, , txt]) => `| ${label} | ${list.map((r) => txt(r).replace(/\|/g, '/')).join(' | ')} |`).join('\n');
    return `# Free Stack comparison\n\n${head}\n${body}\n\n${location.href}\n`;
  };
  return (
    <div className="stack-y">
      <div className="row between"><h1 style={{ margin: 0 }}>Compare</h1>
        <div className="row">
          {list.length > 0 && <>
            <button className="btn small ghost" onClick={() => download('free-stack-compare.md', md(), 'text/markdown')}>export markdown</button>
            <button className="btn small ghost" onClick={() => navigator.clipboard?.writeText(location.href).then(() => toast('link copied'))}>copy link</button>
            <button className="btn small ghost" onClick={() => setIds([])}>clear</button>
          </>}
        </div>
      </div>
      <div className="row">
        <label htmlFor="add" className="small muted">add</label>
        <select id="add" value="" disabled={list.length >= MAX_COMPARE} onChange={(e) => e.target.value && setIds([...ids, e.target.value])} style={{ maxWidth: 320 }}>
          <option value="">{list.length >= MAX_COMPARE ? `max ${MAX_COMPARE}` : 'pick a resource...'}</option>
          {resources.filter((r) => !ids.includes(r.id)).map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
      </div>
      {list.length === 0 ? <Voice line={{ who: 'jarvis', text: 'nothing to compare. use "+ compare" on resource cards, up to four.' }} /> : (
        <div className="compare-wrap">
          <table className="compare">
            <thead><tr><th scope="col"><span className="sr-only">field</span></th>{list.map((r) => <th key={r.id} scope="col"><Link to={`/r/${r.id}`}>{r.name}</Link> <button className="btn small ghost" aria-label={`remove ${r.name}`} onClick={() => setIds(ids.filter((x) => x !== r.id))}>×</button></th>)}</tr></thead>
            <tbody>{rows.map(([label, cell]) => <tr key={label}><th scope="row">{label}</th>{list.map((r) => <td key={r.id}>{cell(r)}</td>)}</tr>)}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
