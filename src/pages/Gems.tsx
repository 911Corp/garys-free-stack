import { Link } from 'react-router-dom';
import { resources } from '../core/catalog';
import { MonoLogo, FreeTypeBadge, Voice } from '../components/bits';
import { X_HANDLE } from '../config';

export default function Gems() {
  const gems = resources.filter((r) => r.gem);
  return (
    <div className="stack-y">
      <h1>Hidden gems</h1>
      <p className="ink2 prose">Small, independent or under-the-radar tools that punch above their price ($0). Each one is in the verified catalog, with sources. Picked by Jarvis, overhyped by Gary.</p>
      <div className="grid two">
        {gems.map((r) => {
          const post = `hidden gem: ${r.name}. ${r.tagline} ${location.origin}${location.pathname}#/r/${r.id} via @${X_HANDLE}`;
          return (
            <article key={r.id} className="panel stack-y">
              <div className="row"><MonoLogo r={r} /><div><h2 style={{ margin: 0 }}><Link to={`/r/${r.id}`}>{r.name}</Link></h2><span className="small ink2">{r.tagline}</span></div></div>
              <div className="row"><FreeTypeBadge t={r.freeType} />{r.license && <span className="pill">{r.license}</span>}</div>
              <Voice line={{ who: 'jarvis', text: r.gem! }} />
              <div className="row"><Link className="btn small" to={`/r/${r.id}`}>full sheet</Link><a className="btn small ghost" target="_blank" rel="noopener" href={`https://x.com/intent/post?${new URLSearchParams({ text: post })}`}>post on X</a></div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
