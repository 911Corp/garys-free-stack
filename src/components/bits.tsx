import { Link } from 'react-router-dom';
import { FREE_TYPE_META, STATUS_META } from '../core/catalog';
import type { FreeType, Resource, Status } from '../core/schema';
import type { Line } from '../core/voice';
import { useApp, MAX_COMPARE } from '../state';

const HUES = ['#c8f03c', '#ffb43c', '#6fe0ef', '#b9a3ff', '#ff8f6b', '#9ff0b0', '#f0d43c'];
export function MonoLogo({ r }: { r: Resource }) {
  const h = [...r.id].reduce((a, c) => a + c.charCodeAt(0), 0);
  const letters = r.name.replace(/[^A-Za-z0-9 ]/g, '').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  return <span className="mono-logo" style={{ background: HUES[h % HUES.length] }} aria-hidden="true">{letters || '?'}</span>;
}

export function FreeTypeBadge({ t }: { t: FreeType }) {
  const m = FREE_TYPE_META[t];
  const cls = t === 'non-commercial-only' || t === 'student-only' ? 'ft-nc' : m.durable ? 'ft-durable' : 'ft-temp';
  return <span className={`badge ${cls}`} title={m.hint}>{m.label}</span>;
}

export function StatusBadge({ s }: { s: Status }) {
  const m = STATUS_META[s];
  return <span className={`badge ${m.tone}`}>{m.label}</span>;
}

/** good: which value is the good news (green). The other one is red. 'neutral' colors neither. */
export function Tri({ v, yes = 'yes', no = 'no', good = true }: { v: boolean | null; yes?: string; no?: string; good?: boolean | 'neutral' }) {
  if (v === null) return <span className="tri-unk">unknown</span>;
  const cls = good === 'neutral' ? '' : v === good ? 'tri-yes' : 'tri-no';
  return <span className={cls}>{v ? yes : no}</span>;
}

/** Quick flags shown on cards. Only shows what is known; unknown stays visible as "?" */
export function FlagPills({ r }: { r: Resource }) {
  const f = r.flags;
  const pill = (label: string, v: boolean | null, invert = false) => {
    const val = invert && v !== null ? !v : v;
    return (
      <span className="pill" key={label} title={`${label}: ${v === null ? 'unknown' : val ? 'yes' : 'no'}`}>
        {label} <span className={v === null ? 'v-unk' : val ? 'v-yes' : 'v-no'}>{v === null ? '?' : val ? '✓' : '✗'}</span>
      </span>
    );
  };
  return (
    <div className="meta">
      {pill('no card', f.noCard)}
      {pill('commercial', f.commercialUse)}
      {f.openSource && pill('OSS', true)}
      {f.selfHostable && pill('self-host', true)}
      {f.localFirst && pill('local', true)}
    </div>
  );
}

export function Voice({ line }: { line: Line }) {
  return (
    <div className="voice">
      <span className={`who ${line.who}`}>{line.who}</span>
      <span className="text">{line.text}</span>
    </div>
  );
}

export function ResourceCard({ r }: { r: Resource }) {
  const { favorites, toggleFavorite, compare, toggleCompare } = useApp();
  const fav = favorites.includes(r.id);
  const inCmp = compare.includes(r.id);
  return (
    <article className="card">
      <div className="head">
        <MonoLogo r={r} />
        <div>
          <h3><Link to={`/r/${r.id}`}>{r.name}</Link></h3>
          <p className="tag">{r.tagline}</p>
        </div>
      </div>
      <div className="meta">
        <FreeTypeBadge t={r.freeType} />
        {r.status !== 'verified' && <StatusBadge s={r.status} />}
      </div>
      <FlagPills r={r} />
      <div className="actions">
        <button className="btn small star" aria-pressed={fav} onClick={() => toggleFavorite(r.id)} aria-label={fav ? `Remove ${r.name} from favorites` : `Add ${r.name} to favorites`}>{fav ? '★' : '☆'}</button>
        <button className="btn small" aria-pressed={inCmp} disabled={!inCmp && compare.length >= MAX_COMPARE} onClick={() => toggleCompare(r.id)}>{inCmp ? '✓ compare' : '+ compare'}</button>
        <span className="small muted" style={{ marginLeft: 'auto', alignSelf: 'center' }} title="last verification">✓ {r.lastVerified}</span>
      </div>
    </article>
  );
}

export function CompareDock() {
  const { compare } = useApp();
  if (compare.length < 2) return null;
  return <Link className="btn primary compare-dock" to={`/compare?ids=${compare.join(',')}`}>compare {compare.length} →</Link>;
}
