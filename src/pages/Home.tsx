import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { catalogStats, resources, templates } from '../core/catalog';
import { flagsFromIdea, matchIdea } from '../core/idea';
import { encodeStack, emptyStack } from '../core/stack';
import { Voice } from '../components/bits';
import type { Template } from '../core/schema';

export function templateToQuery(t: Template, idea?: string) {
  const s = emptyStack();
  s.name = t.name;
  s.slots = t.slots;
  if (idea) s.project = flagsFromIdea(idea);
  return encodeStack(s);
}

export default function Home() {
  const [q, setQ] = useState('');
  const [idea, setIdea] = useState('');
  const nav = useNavigate();
  const stats = catalogStats();
  const matches = matchIdea(idea, templates);
  const gems = resources.filter((r) => r.gem).slice(0, 3);
  return (
    <div className="stack-y">
      <section className="hero">
        <p className="label">gary's adventures presents</p>
        <h1>Build the whole stack.<br />Pay <span className="hl">$0</span>. Know the limits.</h1>
        <p className="sub">Free hosting, databases, auth, AI and tools, checked against official pricing pages. Every quota has a source and a date. Unknown stays unknown.</p>
        <form role="search" onSubmit={(e) => { e.preventDefault(); nav(`/explore?q=${encodeURIComponent(q)}`); }} className="search-big" style={{ maxWidth: 640, marginTop: 18 }}>
          <label className="sr-only" htmlFor="home-q">Search free resources</label>
          <input id="home-q" type="search" placeholder="postgres, auth, llm, analytics..." value={q} onChange={(e) => setQ(e.target.value)} />
        </form>
        <div className="stat-row" style={{ marginTop: 18 }}>
          <span><b>{stats.total}</b>resources</span>
          <span><b>{stats.verified}</b>verified</span>
          <span><b>{stats.withQuotas}</b>with quotas</span>
          <span><b>{templates.length}</b>$0 stacks</span>
          <span><b>{stats.lastVerified}</b>last check</span>
        </div>
      </section>

      <section className="panel">
        <h2 className="box-title">idea → stack</h2>
        <label htmlFor="idea" className="ink2">Describe your project in a few words. Free Stack picks a starting stack from documented templates (keyword rules, no AI call).</label>
        <div className="row" style={{ marginTop: 8 }}>
          <input id="idea" type="text" value={idea} onChange={(e) => setIdea(e.target.value)} placeholder="a discord bot that posts crypto prices" style={{ flex: 1, minWidth: 220 }} />
        </div>
        {idea.trim() && (
          <div style={{ marginTop: 12 }} className="stack-y">
            {matches.length ? matches.map(({ template: t, hits }) => (
              <div key={t.id} className="row between panel tight">
                <div>
                  <strong className="mono">{t.name}</strong> <span className="small muted">matched: {hits.join(', ')}</span>
                  <div className="small ink2">{t.pitch}</div>
                </div>
                <div className="row">
                  <Link className="btn small" to={`/stacks/${t.id}`}>details</Link>
                  <Link className="btn small primary" to={`/build?${templateToQuery(t, idea)}`}>open in builder</Link>
                </div>
              </div>
            )) : <Voice line={{ who: 'jarvis', text: 'no template matches yet. open the builder and pick piece by piece.' }} />}
          </div>
        )}
      </section>

      <section>
        <div className="row between"><h2 className="box-title" style={{ flex: 1 }}>$0 stack templates</h2><Link to="/stacks" className="small">all {templates.length} →</Link></div>
        <div className="grid cards">
          {templates.slice(0, 8).map((t) => (
            <Link key={t.id} to={`/stacks/${t.id}`} className="panel tpl-card">
              <div className="price">$0</div>
              <h2>{t.name.replace('$0 ', '')}</h2>
              <p className="small ink2">{t.pitch}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid two">
        <div className="panel">
          <h2 className="box-title">hidden gems</h2>
          <ul className="clean">
            {gems.map((g) => <li key={g.id}><Link to={`/r/${g.id}`}><strong>{g.name}</strong></Link> <span className="ink2 small">{g.tagline}</span></li>)}
          </ul>
          <div className="row" style={{ marginTop: 10 }}><Link className="btn small" to="/gems">more gems</Link><Link className="btn small ghost" to="/random">random pick</Link></div>
        </div>
        <div className="panel stack-y">
          <h2 className="box-title">the rules</h2>
          <ul className="clean small">
            <li>Open source is not the same as free to host.</li>
            <li>A free trial is not a free plan.</li>
            <li>Temporary credits are not a durable $0.</li>
            <li>No quota is ever invented. Missing data shows as <em>unknown</em>.</li>
          </ul>
          <Voice line={{ who: 'jarvis', text: 'gary wanted to list every free trial on earth. we did not.' }} />
        </div>
      </section>
    </div>
  );
}
