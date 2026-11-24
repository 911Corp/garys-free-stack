import { useEffect, useMemo, useState } from 'react';
import { Voice } from '../components/bits';
import type { ImportedApi } from '../core/schema';
import { issueUrl } from '../config';

interface Payload { source: string; license: string; importedAt: string; count: number; apis: ImportedApi[] }

export default function ApiDirectory() {
  const [data, setData] = useState<Payload | null>(null);
  const [err, setErr] = useState(false);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [noAuth, setNoAuth] = useState(false);
  const [cors, setCors] = useState(false);
  const [limit, setLimit] = useState(60);
  useEffect(() => { import('../../data/imports/public-apis.json').then((m) => setData(m.default as Payload), () => setErr(true)); }, []);
  const cats = useMemo(() => [...new Set(data?.apis.map((a) => a.category) ?? [])].sort(), [data]);
  const list = useMemo(() => {
    if (!data) return [];
    const t = q.trim().toLowerCase();
    return data.apis.filter((a) => (!cat || a.category === cat) && (!noAuth || a.auth === 'none') && (!cors || a.cors === 'yes') && (!t || `${a.name} ${a.description}`.toLowerCase().includes(t)));
  }, [data, q, cat, noAuth, cors]);
  useEffect(() => setLimit(60), [q, cat, noAuth, cors]);
  if (err) return <Voice line={{ who: 'jarvis', text: 'the API directory failed to load. refresh, or blame the network.' }} />;
  if (!data) return <Voice line={{ who: 'jarvis', text: 'loading 2,500 APIs. this is the heavy one.' }} />;
  return (
    <div className="stack-y">
      <h1>API directory</h1>
      <p className="notice"><strong>Unverified layer.</strong> {data.count.toLocaleString()} APIs imported from <a href={data.source} target="_blank" rel="noopener">public-apis/public-apis</a> ({data.license} license) on {data.importedAt}. Fields are the upstream ones (auth, HTTPS, CORS). Free Stack has not checked quotas or terms for these. Promote one to the verified catalog by <a href={issueUrl('[suggest] promote API', 'API name and official pricing/terms link:\n', 'suggestion')} target="_blank" rel="noopener">suggesting it</a>.</p>
      <div className="row">
        <input type="search" aria-label="Search APIs" placeholder="weather, anime, bitcoin..." value={q} onChange={(e) => setQ(e.target.value)} style={{ flex: 1, minWidth: 200 }} />
        <select aria-label="Category" value={cat} onChange={(e) => setCat(e.target.value)} style={{ width: 'auto' }}><option value="">all categories</option>{cats.map((c) => <option key={c}>{c}</option>)}</select>
        <label className="check"><input type="checkbox" checked={noAuth} onChange={(e) => setNoAuth(e.target.checked)} />no auth</label>
        <label className="check"><input type="checkbox" checked={cors} onChange={(e) => setCors(e.target.checked)} />CORS yes</label>
      </div>
      <p className="small muted">{list.length.toLocaleString()} APIs</p>
      <div className="compare-wrap">
        <table className="compare">
          <thead><tr><th>API</th><th>description</th><th>category</th><th>auth</th><th>HTTPS</th><th>CORS</th></tr></thead>
          <tbody>{list.slice(0, limit).map((a) => (
            <tr key={a.id}><td><a href={a.url} target="_blank" rel="noopener">{a.name}</a></td><td className="small">{a.description}</td><td className="small muted">{a.category}</td><td className="small mono">{a.auth ?? '?'}</td><td className="small mono">{a.https === null ? '?' : a.https ? 'yes' : 'no'}</td><td className="small mono">{a.cors ?? '?'}</td></tr>
          ))}</tbody>
        </table>
      </div>
      {list.length > limit && <button className="btn" onClick={() => setLimit((l) => l + 120)}>show more</button>}
    </div>
  );
}
