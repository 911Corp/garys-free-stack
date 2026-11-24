import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { byId, pricing, pricingById, resources, templates } from '../core/catalog';
import { costForStack, defaultUsage, type Usage } from '../core/cost';
import { load, save } from '../core/storage';
import { Receipt, UsageForm } from '../components/Cost';
import { useApp } from '../state';

const nf = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 2 });
const priced = resources.filter((r) => pricing.some((p) => p.id === r.id && p.quotas.length));

export default function Simulator() {
  const { saved } = useApp();
  const [ids, setIds] = useState<string[]>(() => [...new Set(load<string[]>('sim-ids', Object.values(templates[1].slots).flat() as string[]))]);
  const [usage, setUsageState] = useState<Usage>(() => load('usage', defaultUsage()));
  const setUsage = (u: Usage) => { setUsageState(u); save('usage', u); };
  const setList = (l: string[]) => { const u = [...new Set(l)]; setIds(u); save('sim-ids', u); };
  const sel = ids.map((i) => byId.get(i)!).filter(Boolean);
  const cost = useMemo(() => costForStack(sel, pricingById, usage), [ids.join(), usage]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="stack-y">
      <h1>Cost simulator</h1>
      <p className="ink2 prose">Move the sliders to your expected usage. Free Stack compares it to the documented quotas and tells you which one breaks first. Costs are only computed from published prices; anything else stays unknown.</p>
      <div className="row">
        <select value="" onChange={(e) => { const t = templates.find((x) => x.id === e.target.value); const s = saved.find((x) => x.id === e.target.value); if (t) setList(Object.values(t.slots).flat() as string[]); if (s) setList(Object.values(s.stack.slots).flat() as string[]); }} style={{ width: 'auto' }}>
          <option value="">load a stack...</option>
          <optgroup label="templates">{templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</optgroup>
          {saved.length > 0 && <optgroup label="saved">{saved.map((s) => <option key={s.id} value={s.id}>{s.stack.name}</option>)}</optgroup>}
        </select>
        <select value="" onChange={(e) => e.target.value && setList([...ids, e.target.value])} style={{ width: 'auto' }}>
          <option value="">+ add a service with quotas...</option>
          {priced.filter((r) => !ids.includes(r.id)).map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
        <button className="btn small ghost" onClick={() => setUsage(defaultUsage())}>reset usage</button>
      </div>
      <div className="chips">{sel.map((r) => <span key={r.id} className="tok">{r.name}<button aria-label={`remove ${r.name}`} onClick={() => setList(ids.filter((x) => x !== r.id))}>×</button></span>)}</div>
      <div className="builder">
        <div className="stack-y">
          <section className="panel"><h2 className="box-title">usage profile</h2><UsageForm usage={usage} onChange={setUsage} /></section>
          <section className="panel">
            <h2 className="box-title">quota by quota</h2>
            <div style={{ overflowX: 'auto' }}>
              <table className="quota-table">
                <thead><tr><th>service</th><th>quota</th><th>your usage</th><th style={{ minWidth: 110 }}>load</th></tr></thead>
                <tbody>{cost.rows.flatMap((r) => r.checks.map((c, i) => (
                  <tr key={r.id + i}>
                    <td>{i === 0 ? <Link to={`/r/${r.id}`}>{byId.get(r.id)?.name}</Link> : ''}</td>
                    <td>{c.quota.label}</td>
                    <td className="mono">{c.used === null ? <span className="tri-unk">not simulated</span> : nf(c.used)}{c.approx && <div className="small muted">{c.approx}</div>}</td>
                    <td>{c.ratio === null ? '' : <><div className={`meter ${c.level}`}><span style={{ width: `${Math.min(100, c.ratio * 100)}%` }} /></div><span className="small mono">{(c.ratio * 100).toFixed(c.ratio < 0.01 ? 2 : 0)}%</span></>}</td>
                  </tr>
                )))}</tbody>
              </table>
            </div>
            {cost.rows.some((r) => !r.checks.length) && <p className="small muted" style={{ marginTop: 8 }}>No quota data: {cost.rows.filter((r) => !r.checks.length).map((r) => byId.get(r.id)?.name).join(', ')}.</p>}
          </section>
        </div>
        <aside className="sticky-side"><Receipt cost={cost} /></aside>
      </div>
    </div>
  );
}
