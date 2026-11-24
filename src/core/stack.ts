import { ROLES } from './constants';
import type { Role } from './schema';

export interface ProjectFlags { commercial: boolean; sensitive: boolean; alwaysOn: boolean }
export interface Stack { name: string; slots: Partial<Record<Role, string[]>>; project: ProjectFlags }

export const emptyStack = (): Stack => ({ name: 'my $0 stack', slots: {}, project: { commercial: false, sensitive: false, alwaysOn: false } });

export const stackIds = (s: Stack): string[] => [...new Set(Object.values(s.slots).flat().filter(Boolean) as string[])];

/** Human-readable URL encoding: s=frontend:react,vite;hosting:github-pages & p=c,s,a & n=name */
export function encodeStack(s: Stack): string {
  const slots = ROLES.filter((r) => s.slots[r]?.length).map((r) => `${r}:${s.slots[r]!.join(',')}`).join(';');
  const p = [s.project.commercial && 'c', s.project.sensitive && 's', s.project.alwaysOn && 'a'].filter(Boolean).join(',');
  const q = new URLSearchParams();
  if (slots) q.set('s', slots);
  if (p) q.set('p', p);
  if (s.name) q.set('n', s.name);
  return q.toString();
}

export function decodeStack(query: string, known?: Set<string>): Stack {
  const q = new URLSearchParams(query);
  const st = emptyStack();
  st.name = (q.get('n') ?? st.name).slice(0, 80);
  for (const part of (q.get('s') ?? '').split(';')) {
    const [role, list] = part.split(':');
    if (!(ROLES as readonly string[]).includes(role) || !list) continue;
    const ids = list.split(',').map((x) => x.trim()).filter((x) => /^[a-z0-9-]+$/.test(x) && (!known || known.has(x)));
    if (ids.length) st.slots[role as Role] = [...new Set(ids)];
  }
  const p = (q.get('p') ?? '').split(',');
  st.project = { commercial: p.includes('c'), sensitive: p.includes('s'), alwaysOn: p.includes('a') };
  return st;
}

export function stackFromJson(raw: unknown, known: Set<string>): Stack | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const st = emptyStack();
  if (typeof o.name === 'string') st.name = o.name.slice(0, 80);
  const slots = (o.slots ?? {}) as Record<string, unknown>;
  for (const r of ROLES) {
    const v = slots[r];
    if (Array.isArray(v)) {
      const ids = v.filter((x): x is string => typeof x === 'string' && known.has(x));
      if (ids.length) st.slots[r] = [...new Set(ids)];
    }
  }
  const p = (o.project ?? {}) as Record<string, unknown>;
  st.project = { commercial: p.commercial === true, sensitive: p.sensitive === true, alwaysOn: p.alwaysOn === true };
  return st;
}
