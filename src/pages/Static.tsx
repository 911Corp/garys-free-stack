import { Link } from 'react-router-dom';
import { FREE_TYPE_META, STATUS_META, catalogStats, rules } from '../core/catalog';
import { FREE_TYPES, STATUSES } from '../core/constants';
import { Voice } from '../components/bits';
import { pick } from '../core/voice';
import { REPO, VERSION, issueUrl } from '../config';

export function Methodology() {
  const s = catalogStats();
  return (
    <div className="prose stack-y">
      <h1>Methodology</h1>
      <p>Free Stack exists to answer one question honestly: <em>can I build this for $0, and where does it stop being free?</em> These are the rules behind every sheet.</p>
      <h2 className="box-title">data rules</h2>
      <ul className="clean">
        <li>Quotas, prices and terms come only from official pages: pricing pages, docs, license files in the official repo.</li>
        <li>Every resource carries its sources with a check date. Current catalog: {s.total} resources, {s.verified} verified, latest check {s.lastVerified}.</li>
        <li>If an official page does not say it, the value is <em>unknown</em>. Unknown never passes a filter and never counts as $0 in a total.</li>
        <li>Descriptions, pros, cons, complexity and gem notes are editorial and labelled as such.</li>
        <li>No affiliate links today. If that changes, every affiliate link will be labelled, and partners will never change rankings.</li>
      </ul>
      <h2 className="box-title">types of free</h2>
      <table className="simple"><tbody>{FREE_TYPES.map((t) => <tr key={t}><td className="mono small" style={{ width: 190 }}>{FREE_TYPE_META[t].label}</td><td className="small">{FREE_TYPE_META[t].hint}{FREE_TYPE_META[t].durable ? '' : ' Not a durable $0.'}</td></tr>)}</tbody></table>
      <p className="small muted">Open source is not the same as free to host. A free trial is not a free plan. Temporary credits are not a durable $0.</p>
      <h2 className="box-title">data status</h2>
      <table className="simple"><tbody>{STATUSES.map((x) => <tr key={x}><td className="mono small" style={{ width: 190 }}>{STATUS_META[x].label}</td><td className="small">{{ verified: 'Checked against official sources on the listed date.', 'needs-review': 'Something is ambiguous or incomplete on the official page. Read the note.', 'pricing-changed': 'A change was detected and awaits human review.', discontinued: 'Service shut down or announced end of life.', unverified: 'Imported or suggested, not checked yet.' }[x]}</td></tr>)}</tbody></table>
      <h2 className="box-title">compatibility engine</h2>
      <p>Compatibility is computed from data, not generated text:</p>
      <ul className="clean">
        <li><strong>Requirements</strong>: each resource lists capabilities it provides and requires (for example a Discord bot requires a Node.js server runtime). Missing requirements become warnings with options from the catalog.</li>
        <li><strong>Documented rules</strong>: {rules.length} explicit rules, each with an official source (for example GitHub Pages forbidding commercial SaaS on free hosting).</li>
        <li><strong>Terms</strong>: your project context (commercial, sensitive data, 24/7) is checked against each resource's terms.</li>
        <li><strong>Overlap and durability</strong>: two tools doing the same job in a slot, trials, temporary credits, hosting costs.</li>
      </ul>
      <p>No warning means no documented problem. It does not mean guaranteed compatibility.</p>
      <h2 className="box-title">cost simulator</h2>
      <ul className="clean">
        <li>Your usage is compared to each documented quota. Daily quotas are compared to monthly usage divided by 30 (even traffic assumed), and said so.</li>
        <li>Over a quota: if a published per-unit rate exists, it is applied; otherwise the next plan's base price is shown, marked as a floor. Without a published price, the cost is unknown and the total gets a "+".</li>
        <li>Each service is compared with your full usage figure (for example all bandwidth). When traffic is split across services, this overestimates. Better safe than billed.</li>
        <li>Free plans that pause or cap instead of billing count as $0, with the pause called out.</li>
        <li>Quotas we cannot map to your inputs (CPU hours, neurons, builds) are shown as "not simulated".</li>
      </ul>
      <h2 className="box-title">help keep it true</h2>
      <div className="row">
        <a className="btn small" href={issueUrl('[outdated] ', 'Resource id:\nWhat changed (official link):\n', 'data-report')} target="_blank" rel="noopener">report outdated info</a>
        <a className="btn small" href={issueUrl('[suggest] ', 'Name:\nOfficial site:\nOfficial pricing / license link:\nWhy it is useful:\n', 'suggestion')} target="_blank" rel="noopener">suggest a resource</a>
      </div>
    </div>
  );
}

export function HowItsBuilt() {
  const rows: [string, string, string][] = [
    ['Frontend', 'React + TypeScript + Vite', '$0 (MIT)'],
    ['Catalog', 'JSON files validated by Zod schemas at build time', '$0'],
    ['Search', 'MiniSearch, runs in your browser', '$0 (MIT)'],
    ['Storage', 'localStorage in your browser (favorites, stacks)', '$0'],
    ['Hosting', 'GitHub Pages (public repo, non-commercial site)', '$0'],
    ['CI / data checks', 'GitHub Actions on a public repo: tests, schema validation, weekly link check', '$0'],
    ['AI', 'None at runtime. Gary and Jarvis lines are hand written.', '$0'],
    ['Accounts / backend', 'None', '$0'],
    ['Domain', 'github.io subdomain', '$0'],
  ];
  return (
    <div className="prose stack-y">
      <h1>How Free Stack is built</h1>
      <p>A site about free stacks should run on one. Here is the whole bill.</p>
      <table className="simple"><thead><tr><th>layer</th><th>choice</th><th>cost / month</th></tr></thead><tbody>{rows.map(([a, b, c]) => <tr key={a}><td className="mono small">{a}</td><td>{b}</td><td className="mono">{c}</td></tr>)}</tbody><tfoot><tr><td className="mono"><strong>total</strong></td><td /><td className="mono"><strong>$0.00</strong></td></tr></tfoot></table>
      <p className="small muted">Limits we live with: GitHub Pages soft limit of 100 GB bandwidth per month and 1 GB site size. If Free Stack ever adds paid features, GitHub Pages terms say we must move to another host first.</p>
      <Voice line={{ who: 'jarvis', text: 'infrastructure: $0. emotional damage: unpriced.' }} />
      <p>Source code: <a href={REPO} target="_blank" rel="noopener">{REPO.replace('https://', '')}</a> · version {VERSION}</p>
    </div>
  );
}

export function NotFound() {
  return <div className="stack-y"><h1>404</h1><Voice line={pick('notFound', Date.now())} /><Link className="btn" to="/explore">explore the catalog</Link></div>;
}
