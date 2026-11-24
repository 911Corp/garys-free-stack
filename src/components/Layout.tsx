import { useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { CompareDock } from './bits';
import { REPO, VERSION, X_HANDLE } from '../config';

const NAV = [
  ['/explore', 'explore'],
  ['/build', 'stack builder'],
  ['/stacks', 'templates'],
  ['/simulate', 'cost sim'],
  ['/gems', 'hidden gems'],
  ['/apis', 'api directory'],
  ['/saved', 'saved'],
] as const;

export function Layout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  useEffect(() => { setOpen(false); window.scrollTo(0, 0); }, [loc.pathname]);
  return (
    <>
      <a href="#main" className="skip" onClick={(e) => { e.preventDefault(); const m = document.getElementById('main'); m?.focus(); m?.scrollIntoView(); }}>Skip to content</a>
      <header className="topbar">
        <div className="wrap">
          <Link to="/" className="brand" aria-label="Gary's Free Stack home">
            <span className="stamp">$0</span>
            <span className="name">gary's free stack<span className="caret" /></span>
          </Link>
          <button className="btn small ghost menu-btn" aria-expanded={open} aria-controls="nav" onClick={() => setOpen((o) => !o)}>{open ? 'close' : 'menu'}</button>
          <nav id="nav" className={`nav ${open ? 'open' : ''}`} aria-label="Main">
            {NAV.map(([to, label]) => <NavLink key={to} to={to}>{label}</NavLink>)}
          </nav>
        </div>
      </header>
      <main id="main" className="wrap" tabIndex={-1}>{children}</main>
      <CompareDock />
      <footer>
        <div className="wrap">
          <span>ship more. spend less. · v{VERSION} · Built by Gary. Budget approved by Jarvis.</span>
          <span className="row">
            <Link to="/methodology">methodology</Link>
            <Link to="/how-its-built">how it's built ($0)</Link>
            <a href={REPO} rel="noopener">github</a>
            <a href={`https://x.com/${X_HANDLE}`} rel="noopener">@{X_HANDLE}</a>
          </span>
        </div>
      </footer>
    </>
  );
}
