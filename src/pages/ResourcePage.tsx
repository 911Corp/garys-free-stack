import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { byId, CATEGORY_META, FREE_TYPE_META, pricingById, ROLE_META, rules } from '../core/catalog';
import { FreeTypeBadge, MonoLogo, ResourceCard, StatusBadge, Tri, Voice } from '../components/bits';
import { useApp, MAX_COMPARE } from '../state';
import { issueUrl } from '../config';
import { encodeStack, emptyStack } from '../core/stack';
import { pick } from '../core/voice';

const fmt = (n: number) => n.toLocaleString('en-US');
const PERIOD = { month: '/ month', day: '/ day', minute: '/ minute', total: 'total' } as const;

export default function ResourcePage() {
  const { id = '' } = useParams();
  const r = byId.get(id);
  const { favorites, toggleFavorite, compare, toggleCompare, pushHistory, toast } = useApp();
  useEffect(() => { if (r) pushHistory(r.id); document.title = r ? `${r.name} · Gary's Free Stack` : "Gary's Free Stack"; }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!r) return <div className="stack-y"><h1>Not found</h1><Voice line={pick('notFound')} /><Link to="/explore">back to explore</Link></div>;
  const p = pricingById.get(r.id);
  const fav = favorites.includes(r.id);
  const relatedRules = rules.filter((x) => x.when.a === r.id || x.when.b === r.id);
  const addTo = (() => { const s = emptyStack(); if (r.roles[0]) s.slots[r.roles[0]] = [r.id]; return encodeStack(s); })();
  const report = issueUrl(`[outdated] ${r.name}`, `Resource: ${r.id}\nPage: ${location.href}\nWhat changed (with official link):\n`, 'data-report');
  const card = r.flags.noCard === null ? null : !r.flags.noCard;
  return (
    <div className="stack-y">
      <p className="small"><Link to="/explore">explore</Link> / {r.categories.map((c) => CATEGORY_META[c]).join(', ')}</p>
      <header className="row" style={{ alignItems: 'flex-start', gap: 14 }}>
        <MonoLogo r={r} />
        <div style={{ flex: 1, minWidth: 240 }}>
          <h1 style={{ marginBottom: 6 }}>{r.name}</h1>
          <p className="ink2" style={{ marginBottom: 8 }}>{r.tagline}</p>
          <div className="row"><FreeTypeBadge t={r.freeType} /><StatusBadge s={r.status} /><span className="small muted">verified {r.lastVerified}</span></div>
        </div>
        <div className="row">
          <button className="btn small star" aria-pressed={fav} onClick={() => toggleFavorite(r.id)}>{fav ? '★ saved' : '☆ save'}</button>
          <button className="btn small" aria-pressed={compare.includes(r.id)} disabled={!compare.includes(r.id) && compare.length >= MAX_COMPARE} onClick={() => toggleCompare(r.id)}>{compare.includes(r.id) ? '✓ in compare' : '+ compare'}</button>
          <Link className="btn small primary" to={`/build?${addTo}`}>add to a stack</Link>
        </div>
      </header>

      <div className="grid two">
        <section className="panel">
          <h2 className="box-title">what it is</h2>
          <p>{r.description}</p>
          <p className="small muted">{FREE_TYPE_META[r.freeType].label}: {FREE_TYPE_META[r.freeType].hint}</p>
          <div className="chips">{r.tags.map((t) => <Link key={t} className="chip" to={`/explore?q=${encodeURIComponent(t.replace(/-/g, ' '))}`}>{t}</Link>)}</div>
          {r.gem && <div style={{ marginTop: 12 }}><Voice line={{ who: 'jarvis', text: r.gem }} /></div>}
        </section>
        <section className="panel">
          <h2 className="box-title">the fine print</h2>
          <dl className="kv">
            <dt>credit card required</dt><dd><Tri v={card} good={false} /></dd>
            <dt>account required</dt><dd><Tri v={r.flags.noAccount === null ? null : !r.flags.noAccount} good={false} /></dd>
            <dt>commercial use</dt><dd><Tri v={r.flags.commercialUse} yes="allowed" no="not allowed" /></dd>
            <dt>open source</dt><dd><Tri v={r.flags.openSource} good="neutral" /></dd>
            <dt>license</dt><dd>{r.license ?? <span className="tri-unk">unknown / proprietary</span>}</dd>
            <dt>self-hostable</dt><dd><Tri v={r.flags.selfHostable} good="neutral" /></dd>
            <dt>local-first</dt><dd><Tri v={r.flags.localFirst} good="neutral" /></dd>
            <dt>hosting costs</dt><dd><Tri v={r.flags.potentialHostingCosts} yes="possible (you run the server)" no="none expected" good={false} /></dd>
            <dt>usage-based billing</dt><dd><Tri v={r.flags.usageBased} good={false} /></dd>
            <dt>complexity</dt><dd>{r.complexity} <span className="small muted">(editorial)</span></dd>
            <dt>stack slots</dt><dd>{r.roles.map((x) => ROLE_META[x].label).join(', ') || 'none'}</dd>
          </dl>
        </section>
      </div>

      <section className="panel">
        <h2 className="box-title">quotas {p ? `· ${p.plan} plan` : ''}</h2>
        {p && p.quotas.length ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="quota-table">
              <thead><tr><th>quota</th><th>limit</th><th>period</th></tr></thead>
              <tbody>{p.quotas.map((q, i) => <tr key={i}><td>{q.label}{q.scope && <div className="small muted">{q.scope}</div>}</td><td className="mono">{fmt(q.limit)}{/_gb$/.test(q.metric) ? ' GB' : ''}</td><td className="mono">{PERIOD[q.period]}</td></tr>)}</tbody>
            </table>
          </div>
        ) : <p className="muted">No numeric quotas recorded{p ? ' (none stated, or not relevant)' : ''}. See restrictions below and the official pricing page.</p>}
        {p && (
          <dl className="kv" style={{ marginTop: 12 }}>
            <dt>when exceeded</dt><dd>{p.onExceed}{p.onExceedNote && <span className="ink2">: {p.onExceedNote}</span>}</dd>
            <dt>next paid step</dt><dd>{p.nextPlan ? <>{p.nextPlan.name}, ${p.nextPlan.usdPerMonth}/month{p.nextPlan.note && <span className="muted"> ({p.nextPlan.note})</span>}</> : <span className="tri-unk">not recorded</span>}</dd>
            {p.overage.length > 0 && <><dt>published rates</dt><dd>{p.overage.map((o) => o.label).join(' · ')}</dd></>}
            {p.caveats.length > 0 && <><dt>caveats</dt><dd>{p.caveats.join(' ')}</dd></>}
          </dl>
        )}
      </section>

      <div className="grid two">
        <section className="panel">
          <h2 className="box-title">restrictions</h2>
          {r.restrictions.length ? <ul className="clean limits">{r.restrictions.map((x) => <li key={x}>{x}</li>)}</ul> : <p className="muted">None recorded.</p>}
          {relatedRules.length > 0 && <>
            <h3 className="label" style={{ marginTop: 14 }}>compatibility rules</h3>
            <ul className="clean small">{relatedRules.map((x) => <li key={x.id}>{x.description}</li>)}</ul>
          </>}
        </section>
        <section className="panel">
          <h2 className="box-title">pros / cons</h2>
          <ul className="clean">{r.pros.map((x) => <li key={x}>{x}</li>)}</ul>
          <ul className="clean cons" style={{ marginTop: 6 }}>{r.cons.map((x) => <li key={x}>{x}</li>)}</ul>
          <p className="small muted" style={{ marginTop: 8 }}>Pros and cons are editorial.</p>
        </section>
      </div>

      <section className="panel">
        <h2 className="box-title">links & sources</h2>
        <div className="row">
          <a className="btn small" href={r.website} rel="noopener" target="_blank">website ↗</a>
          {r.docs && <a className="btn small" href={r.docs} rel="noopener" target="_blank">docs ↗</a>}
          {r.repo && <a className="btn small" href={r.repo} rel="noopener" target="_blank">repo ↗</a>}
          {r.pricingUrl && <a className="btn small" href={r.pricingUrl} rel="noopener" target="_blank">pricing ↗</a>}
        </div>
        <ul className="clean small" style={{ marginTop: 12 }}>
          {[...r.sources, ...(p?.sources ?? [])].filter((s, i, a) => a.findIndex((x) => x.url === s.url) === i).map((s) => <li key={s.url}><a href={s.url} rel="noopener" target="_blank">{s.label}</a> <span className="muted">checked {s.checkedAt}</span></li>)}
        </ul>
        {r.notes && <p className="notice" style={{ marginTop: 10 }}>{r.notes}</p>}
        <div className="row" style={{ marginTop: 12 }}>
          <a className="btn small ghost" href={report} rel="noopener" target="_blank">report outdated info</a>
          <button className="btn small ghost" onClick={() => { navigator.clipboard?.writeText(location.href).then(() => toast('link copied'), () => toast('copy failed')); }}>copy link</button>
        </div>
      </section>

      {r.alternatives.length > 0 && (
        <section>
          <h2 className="box-title">alternatives</h2>
          <div className="grid cards">{r.alternatives.map((a) => byId.get(a)).filter(Boolean).map((a) => <ResourceCard key={a!.id} r={a!} />)}</div>
        </section>
      )}
    </div>
  );
}
