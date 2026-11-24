import { Link, useParams } from 'react-router-dom';
import { byId, pricingById, ROLE_META, rules, resources, templates } from '../core/catalog';
import { emptyStack, stackIds } from '../core/stack';
import { analyzeStack } from '../core/compat';
import { costForStack, defaultUsage } from '../core/cost';
import type { Role } from '../core/schema';
import { Voice } from '../components/bits';
import { Receipt } from '../components/Cost';
import { templateToQuery } from './Home';

export default function Templates() {
  return (
    <div className="stack-y">
      <h1>$0 stack templates</h1>
      <p className="ink2 prose">Complete, documented starting points. Each one lists its conditions, its limits and the indirect costs nobody puts on the landing page.</p>
      <div className="grid cards">
        {templates.map((t) => (
          <Link key={t.id} to={`/stacks/${t.id}`} className="panel tpl-card">
            <div className="price">$0</div>
            <h2>{t.name.replace('$0 ', '')}</h2>
            <p className="small ink2">{t.pitch}</p>
            <p className="small muted mono">{Object.values(t.slots).flat().map((id) => byId.get(id!)?.name).filter(Boolean).slice(0, 5).join(' · ')}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function TemplatePage() {
  const { id } = useParams();
  const t = templates.find((x) => x.id === id);
  if (!t) return <div><h1>Template not found</h1><Link to="/stacks">all templates</Link></div>;
  const s = emptyStack(); s.slots = t.slots;
  const sel = stackIds(s).map((i) => byId.get(i)!).filter(Boolean);
  const findings = analyzeStack(s, byId, rules, resources).filter((f) => f.severity !== 'info');
  const cost = costForStack(sel, pricingById, defaultUsage());
  return (
    <div className="stack-y">
      <p className="small"><Link to="/stacks">templates</Link> / {t.name}</p>
      <div className="row between"><h1 style={{ margin: 0 }}>{t.name}</h1><Link className="btn primary" to={`/build?${templateToQuery(t)}`}>open in builder</Link></div>
      <p className="ink2 prose">{t.pitch}</p>
      <Voice line={{ who: 'jarvis', text: t.jarvis }} />
      <div className="builder">
        <div className="stack-y">
          <section className="panel">
            <h2 className="box-title">components</h2>
            <table className="simple"><tbody>
              {(Object.entries(t.slots) as [Role, string[]][]).map(([role, ids]) => (
                <tr key={role}><th className="label" style={{ width: 130 }}>{ROLE_META[role].label}</th><td>{ids.map((i, k) => <span key={i}>{k ? ' + ' : ''}<Link to={`/r/${i}`}>{byId.get(i)?.name}</Link></span>)}</td></tr>
              ))}
            </tbody></table>
          </section>
          <section className="panel"><h2 className="box-title">conditions to stay at $0</h2><ul className="clean limits">{t.conditions.map((c) => <li key={c}>{c}</li>)}</ul></section>
          <section className="panel"><h2 className="box-title">limits</h2><ul className="clean cons">{t.limits.map((c) => <li key={c}>{c}</li>)}</ul></section>
          <section className="panel"><h2 className="box-title">indirect costs</h2><ul className="clean">{t.indirectCosts.map((c) => <li key={c}>{c}</li>)}</ul></section>
          {findings.length > 0 && <section className="panel"><h2 className="box-title">rule warnings (default context)</h2><ul className="clean limits small">{findings.map((f) => <li key={f.ruleId}>{f.message}</li>)}</ul></section>}
        </div>
        <aside className="sticky-side"><Receipt cost={cost} title="SAMPLE RECEIPT" /><p className="small muted" style={{ marginTop: 10 }}>Sample usage: 500 MAU, 200k requests/month, 2 GB bandwidth. Tune it in the builder.</p></aside>
      </div>
    </div>
  );
}
