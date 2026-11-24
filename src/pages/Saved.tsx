import { Link } from 'react-router-dom';
import { byId, pricingById } from '../core/catalog';
import { costForStack, defaultUsage } from '../core/cost';
import { encodeStack, stackIds } from '../core/stack';
import { load } from '../core/storage';
import { ResourceCard, Voice } from '../components/bits';
import { pick } from '../core/voice';
import { useApp } from '../state';

export default function Saved() {
  const { favorites, saved, deleteStack, history, clearHistory } = useApp();
  const usage = load('usage', defaultUsage());
  const favs = favorites.map((id) => byId.get(id)!).filter(Boolean);
  const rows = saved.map((s) => {
    const sel = stackIds(s.stack).map((i) => byId.get(i)!).filter(Boolean);
    return { s, sel, cost: costForStack(sel, pricingById, usage) };
  });
  return (
    <div className="stack-y">
      <h1>Saved</h1>
      <p className="small muted">Stored in this browser only. No account, no server. Export a stack as JSON to move it.</p>
      <section>
        <h2 className="box-title">stacks ({saved.length})</h2>
        {rows.length === 0 ? <Voice line={pick('emptyStack')} /> : (
          <div className="compare-wrap">
            <table className="compare">
              <thead><tr><th>stack</th><th>tools</th><th>est. / month</th><th>flags</th><th>saved</th><th /></tr></thead>
              <tbody>{rows.map(({ s, sel, cost }) => (
                <tr key={s.id}>
                  <td><Link to={`/build?${encodeStack(s.stack)}`}>{s.stack.name}</Link></td>
                  <td className="small">{sel.map((r) => r.name).join(', ')}</td>
                  <td className="mono">${cost.totalUsd.toFixed(2)}{cost.complete ? '' : '+'}</td>
                  <td className="small">{[s.stack.project.commercial && 'commercial', s.stack.project.sensitive && 'sensitive', s.stack.project.alwaysOn && '24/7'].filter(Boolean).join(', ') || '-'}</td>
                  <td className="small muted">{s.savedAt.slice(0, 10)}</td>
                  <td><button className="btn small ghost" onClick={() => deleteStack(s.id)} aria-label={`delete ${s.stack.name}`}>delete</button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
        {rows.length > 1 && <p className="small muted" style={{ marginTop: 6 }}>Side-by-side stack comparison uses your current usage profile.</p>}
      </section>
      <section>
        <h2 className="box-title">favorites ({favs.length})</h2>
        {favs.length ? <div className="grid cards">{favs.map((r) => <ResourceCard key={r.id} r={r} />)}</div> : <Voice line={pick('emptyFavorites')} />}
      </section>
      <section>
        <div className="row between"><h2 className="box-title" style={{ flex: 1 }}>recently viewed</h2>{history.length > 0 && <button className="btn small ghost" onClick={clearHistory}>clear history</button>}</div>
        {history.length ? <div className="chips">{history.map((id) => byId.get(id)).filter(Boolean).map((r) => <Link key={r!.id} className="chip" to={`/r/${r!.id}`}>{r!.name}</Link>)}</div> : <p className="muted small">Nothing yet.</p>}
      </section>
    </div>
  );
}
