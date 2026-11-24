import { useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { byId, pricingById, resources, ROLE_META, rules, templates } from '../core/catalog';
import { ROLES } from '../core/constants';
import type { Role } from '../core/schema';
import { decodeStack, encodeStack, stackFromJson, stackIds, type Stack } from '../core/stack';
import { analyzeStack } from '../core/compat';
import { costForStack, defaultUsage, type Usage } from '../core/cost';
import { download, stackToJson, stackToMarkdown } from '../core/export';
import { load, save } from '../core/storage';
import { pick } from '../core/voice';
import { Receipt, UsageForm } from '../components/Cost';
import { FreeTypeBadge, Voice } from '../components/bits';
import { stackCardPng } from '../components/shareCard';
import { useApp } from '../state';
import { X_HANDLE } from '../config';

const known = new Set(resources.map((r) => r.id));
const byRole = Object.fromEntries(ROLES.map((r) => [r, resources.filter((x) => x.roles.includes(r)).sort((a, b) => a.name.localeCompare(b.name))])) as Record<Role, typeof resources>;

export default function Builder() {
  const [params, setParams] = useSearchParams();
  const stack = useMemo(() => decodeStack(params.toString(), known), [params]);
  const setStack = (s: Stack) => setParams(encodeStack(s), { replace: true });
  const [usage, setUsageState] = useState<Usage>(() => load('usage', defaultUsage()));
  const setUsage = (u: Usage) => { setUsageState(u); save('usage', u); };
  const [showUsage, setShowUsage] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { saveStack, toast } = useApp();

  const ids = stackIds(stack);
  const selected = ids.map((id) => byId.get(id)!).filter(Boolean);
  const findings = useMemo(() => analyzeStack(stack, byId, rules, resources), [stack]);
  const cost = useMemo(() => costForStack(selected, pricingById, usage), [selected.map((r) => r.id).join(), usage]); // eslint-disable-line react-hooks/exhaustive-deps
  const shareUrl = `${location.origin}${location.pathname}#/build?${encodeStack(stack)}`;

  const add = (role: Role, id: string) => { if (!id) return; const cur = stack.slots[role] ?? []; if (!cur.includes(id)) setStack({ ...stack, slots: { ...stack.slots, [role]: [...cur, id] } }); };
  const remove = (role: Role, id: string) => setStack({ ...stack, slots: { ...stack.slots, [role]: (stack.slots[role] ?? []).filter((x) => x !== id) } });
  const conditions = [...new Set(selected.flatMap((r) => [...r.restrictions, ...(pricingById.get(r.id)?.caveats ?? [])].map((x) => `${r.name}: ${x}`)))];
  const deps = selected.filter((r) => r.compat.requires.length).map((r) => `${r.name} needs ${r.compat.requires.map((q) => q.replace('|', ' or ')).join(', ')}`);
  const alts = [...new Set(selected.flatMap((r) => r.alternatives))].filter((a) => !ids.includes(a)).map((a) => byId.get(a)!).filter(Boolean);
  const errors = findings.filter((f) => f.severity === 'error').length;
  const warns = findings.filter((f) => f.severity === 'warn').length;

  const shareX = async () => {
    const blob = await stackCardPng(stack, cost.totalUsd, cost.complete);
    if (blob) download(`${stack.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'stack'}.png`, blob);
    const text = `my stack "${stack.name}": ${selected.length} tools, est. $${cost.totalUsd.toFixed(2)}/mo. built with gary's free stack via @${X_HANDLE}`;
    window.open(`https://x.com/intent/post?${new URLSearchParams({ text, url: shareUrl })}`, '_blank', 'noopener');
  };
  const onImport = async (file: File) => {
    try {
      const s = stackFromJson(JSON.parse(await file.text()), known);
      if (!s) throw new Error('bad');
      setStack(s); toast('stack imported');
    } catch { toast('not a Free Stack JSON file'); }
  };

  return (
    <div className="stack-y">
      <div className="row between">
        <div><p className="label">stack builder</p>
          <label className="sr-only" htmlFor="sname">Stack name</label>
          <input id="sname" type="text" value={stack.name} maxLength={80} onChange={(e) => setStack({ ...stack, name: e.target.value })} style={{ font: '700 1.5rem var(--mono)', background: 'transparent', border: 0, borderBottom: '1px dashed var(--line-2)', padding: '2px 0', borderRadius: 0 }} />
        </div>
        <div className="row">
          <label className="sr-only" htmlFor="tpl">Load template</label>
          <select id="tpl" value="" onChange={(e) => { const t = templates.find((x) => x.id === e.target.value); if (t) setStack({ ...stack, name: t.name, slots: t.slots }); }} style={{ width: 'auto' }}>
            <option value="">load a template...</option>
            {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <button className="btn small ghost" onClick={() => setStack({ ...stack, slots: {} })} disabled={!ids.length}>clear</button>
        </div>
      </div>

      <fieldset className="panel tight row" style={{ border: '1px solid var(--line)' }}>
        <legend className="label" style={{ padding: '0 6px' }}>project context (drives the rules)</legend>
        {([['commercial', 'commercial project'], ['sensitive', 'handles sensitive data'], ['alwaysOn', 'must stay online 24/7']] as const).map(([k, label]) => (
          <label key={k} className="check" style={{ marginRight: 14 }}><input type="checkbox" checked={stack.project[k]} onChange={(e) => setStack({ ...stack, project: { ...stack.project, [k]: e.target.checked } })} />{label}</label>
        ))}
      </fieldset>

      <div className="builder">
        <div className="grid two" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
          {ROLES.map((role) => (
            <section key={role} className="slot" aria-label={ROLE_META[role].label}>
              <header><strong className="mono small">{ROLE_META[role].label.toLowerCase()}</strong><span className="small muted">{ROLE_META[role].hint}</span></header>
              <div className="picked">
                {(stack.slots[role] ?? []).map((id) => (
                  <span key={id} className="tok"><Link to={`/r/${id}`}>{byId.get(id)?.name}</Link><button aria-label={`remove ${byId.get(id)?.name}`} onClick={() => remove(role, id)}>×</button></span>
                ))}
              </div>
              <label className="sr-only" htmlFor={`add-${role}`}>Add to {role}</label>
              <select id={`add-${role}`} value="" onChange={(e) => add(role, e.target.value)}>
                <option value="">+ add {ROLE_META[role].label.toLowerCase()}</option>
                {byRole[role].filter((r) => !(stack.slots[role] ?? []).includes(r.id)).map((r) => <option key={r.id} value={r.id}>{r.name}{r.flags.commercialUse === false ? ' (non-commercial)' : ''}</option>)}
              </select>
            </section>
          ))}
        </div>

        <aside className="sticky-side stack-y" id="receipt">
          {ids.length === 0 ? <Voice line={pick('emptyStack', 1)} /> : <>
            <Receipt cost={cost} />
            <button className="btn small ghost" aria-expanded={showUsage} onClick={() => setShowUsage((s) => !s)}>{showUsage ? 'hide' : 'tune'} usage profile</button>
            {showUsage && <div className="panel tight"><UsageForm usage={usage} onChange={setUsage} /></div>}
            <div className="row">
              <button className="btn small primary" onClick={() => { saveStack(stack); toast('stack saved in this browser'); }}>save</button>
              <button className="btn small" onClick={() => navigator.clipboard?.writeText(shareUrl).then(() => toast('share link copied'), () => toast('copy failed'))}>copy link</button>
              <button className="btn small" onClick={shareX}>share on X</button>
            </div>
            <div className="row">
              <button className="btn small ghost" onClick={() => download('stack.md', stackToMarkdown(stack, byId, findings, cost, shareUrl), 'text/markdown')}>.md</button>
              <button className="btn small ghost" onClick={() => download('stack.json', stackToJson(stack), 'application/json')}>.json</button>
              <button className="btn small ghost" onClick={() => fileRef.current?.click()}>import .json</button>
              <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => e.target.files?.[0] && onImport(e.target.files[0])} />
            </div>
          </>}
        </aside>
      </div>

      {ids.length > 0 && (
        <button className="mobile-total" onClick={() => document.getElementById('receipt')?.scrollIntoView({ behavior: 'smooth' })}>
          <span>${cost.totalUsd.toFixed(2)}{cost.complete ? '' : '+'}/mo</span><span>{selected.length} tools · {errors} err · {warns} warn</span><span>receipt ↓</span>
        </button>
      )}
      {ids.length > 0 && (
        <div className="grid two">
          <section className="panel stack-y">
            <h2 className="box-title">compatibility · {errors} errors · {warns} warnings</h2>
            {findings.length === 0 && <Voice line={{ who: 'jarvis', text: 'no documented rule flags this stack. that is not a guarantee, it is the absence of known problems.' }} />}
            {findings.map((f) => (
              <div key={f.ruleId} className={`finding ${f.severity}`}>
                <span className="sev">{f.severity}</span>
                <div>
                  <div>{f.message}</div>
                  {f.suggestions?.length ? <div className="small muted">options: {f.suggestions.map((s, i) => <span key={s}>{i ? ', ' : ''}<Link to={`/r/${s}`}>{byId.get(s)?.name}</Link></span>)}</div> : null}
                  {f.source && <a className="small" href={f.source.url} target="_blank" rel="noopener">source: {f.source.label}</a>}
                </div>
              </div>
            ))}
            <p className="small muted">Rules are documented and sourced. See <Link to="/methodology">methodology</Link>.</p>
          </section>
          <section className="panel stack-y">
            <h2 className="box-title">to stay at $0</h2>
            {conditions.length ? <ul className="clean limits small">{conditions.map((c) => <li key={c}>{c}</li>)}</ul> : <p className="small muted">No conditions recorded for these picks.</p>}
            {deps.length > 0 && <><h3 className="label">dependencies</h3><ul className="clean small">{deps.map((d) => <li key={d}>{d}</li>)}</ul></>}
          </section>
          <section className="panel">
            <h2 className="box-title">in this stack</h2>
            <table className="simple">
              <tbody>{selected.map((r) => <tr key={r.id}><td><Link to={`/r/${r.id}`}>{r.name}</Link></td><td><FreeTypeBadge t={r.freeType} /></td><td className="small muted" style={{ whiteSpace: "nowrap" }}>{r.lastVerified}</td></tr>)}</tbody>
            </table>
          </section>
          {alts.length > 0 && (
            <section className="panel">
              <h2 className="box-title">alternatives to consider</h2>
              <Voice line={pick('alternative')} />
              <div className="chips" style={{ marginTop: 10 }}>{alts.map((a) => <Link key={a.id} className="chip" to={`/r/${a.id}`}>{a.name}</Link>)}</div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
