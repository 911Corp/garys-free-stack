import type { Resource, Rule, Role } from './schema';
import { stackIds, type Stack } from './stack';

export interface Finding {
  severity: 'info' | 'warn' | 'error';
  kind: 'requires' | 'conflict' | 'overlap' | 'pairs' | 'terms' | 'durability' | 'status';
  message: string;
  ids: string[];
  ruleId: string;
  source?: { label: string; url: string } | null;
  suggestions?: string[];
}

/** "server-runtime" is satisfied by "server-runtime:node"; "a|b" means either. */
export function satisfies(requirement: string, provided: Set<string>): boolean {
  return requirement.split('|').some((req) => [...provided].some((p) => p === req || p.startsWith(req + ':')));
}

export function analyzeStack(stack: Stack, byId: Map<string, Resource>, rules: Rule[], catalog: Resource[]): Finding[] {
  const ids = stackIds(stack).filter((id) => byId.has(id));
  const sel = ids.map((id) => byId.get(id)!);
  const out: Finding[] = [];
  const slotOf = (id: string): Role[] => (Object.entries(stack.slots) as [Role, string[]][]).filter(([, l]) => l?.includes(id)).map(([r]) => r);

  // 1. Requirements (generic, from each resource's compat.requires)
  for (const r of sel) {
    const others = new Set(sel.filter((o) => o.id !== r.id).flatMap((o) => o.compat.provides));
    for (const req of r.compat.requires) {
      if (!satisfies(req, others)) {
        const suggestions = catalog.filter((c) => c.id !== r.id && satisfies(req, new Set(c.compat.provides))).slice(0, 4).map((c) => c.id);
        out.push({ severity: 'warn', kind: 'requires', ruleId: `requires:${r.id}:${req}`, ids: [r.id],
          message: `${r.name} needs "${req.replace(/\|/g, '" or "')}". Nothing in this stack provides it yet.`, suggestions });
      }
    }
  }

  // 2. Documented rules
  const needsServer = sel.some((r) => r.compat.requires.some((q) => q.startsWith('server-runtime')));
  const token = (t: string, a: string): boolean => {
    if (t === '@commercial') return stack.project.commercial;
    if (t === '@sensitive') return stack.project.sensitive;
    if (t === '@always-on') return stack.project.alwaysOn;
    if (t === '@needs-server') return needsServer;
    if (t.startsWith('@slot:')) return slotOf(a).includes(t.slice(6) as Role);
    return ids.includes(t);
  };
  const firedTerms = new Set<string>();
  for (const rule of rules) {
    if (!ids.includes(rule.when.a)) continue;
    if (rule.when.b && !token(rule.when.b, rule.when.a)) continue;
    if (rule.kind === 'terms') firedTerms.add(rule.when.a);
    out.push({ severity: rule.severity, kind: rule.kind, message: rule.message, ids: [rule.when.a, ...(rule.when.b && !rule.when.b.startsWith('@') ? [rule.when.b] : [])], ruleId: rule.id, source: rule.source });
  }

  // 3. Commercial terms from flags (only when no explicit rule already covered the resource)
  if (stack.project.commercial) {
    for (const r of sel) {
      if (firedTerms.has(r.id)) continue;
      if (r.flags.commercialUse === false) out.push({ severity: 'error', kind: 'terms', ruleId: `terms:${r.id}`, ids: [r.id], message: `${r.name}: commercial use is not allowed on this free offer.` });
    }
    const unknown = sel.filter((r) => r.flags.commercialUse === null && !firedTerms.has(r.id));
    if (unknown.length) out.push({ severity: 'info', kind: 'terms', ruleId: 'terms:unknown', ids: unknown.map((r) => r.id), message: `Commercial terms not stated on the pages we checked for: ${unknown.map((r) => r.name).join(', ')}. Read their terms before launch.` });
  }

  // 4. Durability of the $0 claim
  for (const r of sel) {
    if (r.freeType === 'free-trial' || r.freeType === 'free-credits' || r.freeType === 'student-only')
      out.push({ severity: 'warn', kind: 'durability', ruleId: `durable:${r.id}`, ids: [r.id], message: `${r.name} is ${r.freeType.replace('-', ' ')}: not a permanent $0.` });
    if (r.status !== 'verified')
      out.push({ severity: r.status === 'discontinued' ? 'error' : 'info', kind: 'status', ruleId: `status:${r.id}`, ids: [r.id], message: `${r.name} data status: ${r.status.replace('-', ' ')}. ${r.notes ?? 'Double-check before relying on it.'}` });
  }
  const hostingCost = sel.filter((r) => r.flags.potentialHostingCosts);
  if (hostingCost.length) out.push({ severity: 'info', kind: 'durability', ruleId: 'durable:hosting', ids: hostingCost.map((r) => r.id), message: `Free software, but it needs a server: ${hostingCost.map((r) => r.name).join(', ')}. The server is where costs can appear.` });

  // 5. Overlap inside a slot (two picks providing the same capability)
  for (const [role, list] of Object.entries(stack.slots) as [Role, string[]][]) {
    if (!list || list.length < 2 || role === 'frontend' || role === 'extras') continue;
    const rs = list.map((id) => byId.get(id)).filter(Boolean) as Resource[];
    for (let i = 0; i < rs.length; i++) for (let j = i + 1; j < rs.length; j++) {
      const shared = rs[i].compat.provides.filter((p) => rs[j].compat.provides.includes(p));
      if (shared.length && !out.some((f) => f.kind === 'overlap' && f.ids.includes(rs[i].id) && f.ids.includes(rs[j].id)))
        out.push({ severity: 'info', kind: 'overlap', ruleId: `overlap:${rs[i].id}:${rs[j].id}`, ids: [rs[i].id, rs[j].id], message: `${rs[i].name} and ${rs[j].name} both provide ${shared.join(', ')} in ${role}. Fine as a fallback, redundant otherwise.` });
    }
  }
  const order = { error: 0, warn: 1, info: 2 };
  return out.sort((a, b) => order[a.severity] - order[b.severity]);
}
