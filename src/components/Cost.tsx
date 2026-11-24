import { Link } from 'react-router-dom';
import { byId } from '../core/catalog';
import { USAGE_FIELDS, headroom, type StackCost, type Usage } from '../core/cost';
import { pick } from '../core/voice';
import { Voice } from './bits';

const nf = (n: number) => (n >= 1e6 ? `${+(n / 1e6).toFixed(2)}M` : n >= 1e4 ? `${+(n / 1e3).toFixed(1)}k` : `${+n.toFixed(2)}`);

export function UsageForm({ usage, onChange }: { usage: Usage; onChange: (u: Usage) => void }) {
  return (
    <div className="stack-y">
      {USAGE_FIELDS.map((f) => (
        <div key={f.key}>
          <label className="small ink2" htmlFor={`u-${f.key}`}>{f.label}</label>
          <div className="range-row">
            <input type="range" min={0} max={f.max} step={f.step} value={Math.min(usage[f.key], f.max)} aria-label={f.label} onChange={(e) => onChange({ ...usage, [f.key]: Number(e.target.value) })} />
            <input id={`u-${f.key}`} type="number" min={0} step={f.step} value={usage[f.key]} onChange={(e) => onChange({ ...usage, [f.key]: Math.max(0, Number(e.target.value) || 0) })} style={{ minHeight: 32, padding: '4px 8px' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Receipt({ cost, title = 'RECEIPT' }: { cost: StackCost; title?: string }) {
  const hr = headroom(cost.rows);
  const voiceKey = cost.worst === 'over' ? 'costOver' : cost.worst === 'near' ? 'costNear' : !cost.complete ? 'costUnknown' : 'costZero';
  return (
    <div className="stack-y">
      <div className="receipt" aria-label="Estimated monthly cost">
        <h2 style={{ fontSize: "1.02rem", textAlign: "center", letterSpacing: "0.1em", marginBottom: 2 }}>{title}</h2>
        <div className="center small">gary's free stack · monthly estimate</div>
        <div className="rule" />
        {cost.rows.length === 0 && <div className="center">nothing selected</div>}
        {cost.rows.map((r) => {
          const res = byId.get(r.id);
          const cls = r.level === 'over' ? 'lvl-over' : r.level === 'near' ? 'lvl-near' : r.usd === null ? 'lvl-unk' : '';
          return (
            <div key={r.id} style={{ marginBottom: 6 }}>
              <div className="line"><Link to={`/r/${r.id}`}>{res?.name ?? r.id}</Link><span className="dots" /><span className={cls}>{r.usd === null ? '$?' : `$${r.usd.toFixed(2)}`}</span></div>
              {r.checks.filter((c) => c.level === 'over' || c.level === 'near').map((c, i) => (
                <div key={i} className={`small ${c.level === 'over' ? 'lvl-over' : 'lvl-near'}`}>  {c.level === 'over' ? '✗' : '!'} {c.quota.label}: {nf(c.used!)} / {nf(c.quota.limit)}{c.approx ? ` (${c.approx})` : ''}</div>
              ))}
              {(r.level === 'over' || r.usd === null) && <div className="small lvl-unk">{r.costNote}</div>}
            </div>
          );
        })}
        <div className="rule" />
        <div className="line total"><span>TOTAL</span><span className="dots" /><span>${cost.totalUsd.toFixed(2)}{cost.complete ? '' : '+'}</span></div>
        {!cost.complete && <div className="small lvl-unk">+ some costs unknown. Total is a floor, not a promise.</div>}
        {hr && hr.factor >= 1 && <div className="small" style={{ marginTop: 6 }}>headroom: about {hr.factor >= 100 ? '100x+' : `${hr.factor.toFixed(1)}x`} your usage before "{hr.quota}" ({byId.get(hr.id)?.name}) breaks.</div>}
        <div className="rule" />
        <div className="center small">estimates from official pricing pages<br />Budget approved by Jarvis</div>
      </div>
      <Voice line={pick(voiceKey, Math.round(cost.totalUsd))} />
    </div>
  );
}
