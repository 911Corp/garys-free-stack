import { useState } from 'react';
import { Link } from 'react-router-dom';
import { resources } from '../core/catalog';
import { ResourceCard, Voice } from '../components/bits';
import { pick } from '../core/voice';

const pool = resources.filter((r) => r.status === 'verified');
export default function RandomPick() {
  const roll = () => pool[Math.floor(Math.random() * pool.length)];
  const [r, setR] = useState(roll);
  const [n, setN] = useState(0);
  return (
    <div className="stack-y" style={{ maxWidth: 520 }}>
      <h1>Random discovery</h1>
      <Voice line={pick('random', n)} />
      <ResourceCard r={r} />
      <div className="row"><button className="btn primary" onClick={() => { setR(roll()); setN((x) => x + 1); }}>roll again</button><Link className="btn ghost" to="/gems">hidden gems</Link></div>
    </div>
  );
}
