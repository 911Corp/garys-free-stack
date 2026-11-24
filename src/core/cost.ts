import type { Metric, Pricing, Quota, Resource } from './schema';

export interface Usage {
  mau: number;
  monthlyRequests: number;
  bandwidthGb: number;
  storageGb: number;
  dbStorageGb: number;
  dbReadsPerDay: number;
  dbWritesPerDay: number;
  emailsPerMonth: number;
  functionInvocations: number;
  aiRequestsPerDay: number;
  aiTokensPerDay: number;
  analyticsEvents: number;
  automationRunsPerDay: number;
  minutesPerRun: number;
}

export const defaultUsage = (): Usage => ({
  mau: 500, monthlyRequests: 200_000, bandwidthGb: 2, storageGb: 0.5, dbStorageGb: 0.1, dbReadsPerDay: 20_000, dbWritesPerDay: 1_000,
  emailsPerMonth: 500, functionInvocations: 100_000, aiRequestsPerDay: 100, aiTokensPerDay: 50_000, analyticsEvents: 20_000,
  automationRunsPerDay: 4, minutesPerRun: 2,
});

export const USAGE_FIELDS: { key: keyof Usage; label: string; max: number; step: number; unit?: string }[] = [
  { key: 'mau', label: 'Monthly active users', max: 200_000, step: 100 },
  { key: 'monthlyRequests', label: 'Requests / month', max: 20_000_000, step: 10_000 },
  { key: 'bandwidthGb', label: 'Bandwidth / month', max: 500, step: 1, unit: 'GB' },
  { key: 'storageGb', label: 'File storage', max: 100, step: 0.5, unit: 'GB' },
  { key: 'dbStorageGb', label: 'Database size', max: 50, step: 0.1, unit: 'GB' },
  { key: 'dbReadsPerDay', label: 'DB reads / day', max: 10_000_000, step: 1_000 },
  { key: 'dbWritesPerDay', label: 'DB writes / day', max: 1_000_000, step: 500 },
  { key: 'emailsPerMonth', label: 'Emails / month', max: 100_000, step: 100 },
  { key: 'functionInvocations', label: 'Function runs / month', max: 10_000_000, step: 10_000 },
  { key: 'aiRequestsPerDay', label: 'AI requests / day', max: 50_000, step: 10 },
  { key: 'aiTokensPerDay', label: 'AI tokens / day', max: 10_000_000, step: 1_000 },
  { key: 'analyticsEvents', label: 'Analytics events / month', max: 5_000_000, step: 1_000 },
  { key: 'automationRunsPerDay', label: 'Automation runs / day', max: 500, step: 1 },
  { key: 'minutesPerRun', label: 'Minutes per run', max: 60, step: 1, unit: 'min' },
];

interface Mapped { value: number; approx: string | null }

/** Maps a quota to the user's usage on the quota's period. Returns null when we have no honest way to estimate. */
export function usageFor(q: Quota, u: Usage): Mapped | null {
  const perMonth = (m: number): Mapped => (q.period === 'day' ? { value: m / 30, approx: 'monthly usage ÷ 30, assumes even traffic' } : { value: m, approx: null });
  const perDay = (d: number): Mapped => (q.period === 'month' ? { value: d * 30, approx: 'daily usage × 30' } : { value: d, approx: null });
  const table: Partial<Record<Metric, () => Mapped>> = {
    requests: () => perMonth(u.monthlyRequests),
    bandwidth_gb: () => perMonth(u.bandwidthGb),
    storage_gb: () => ({ value: u.storageGb, approx: null }),
    db_storage_gb: () => ({ value: u.dbStorageGb, approx: null }),
    mau: () => ({ value: u.mau, approx: null }),
    emails: () => perMonth(u.emailsPerMonth),
    function_invocations: () => perMonth(u.functionInvocations),
    ai_requests: () => perDay(u.aiRequestsPerDay),
    ai_tokens: () => perDay(u.aiTokensPerDay),
    events: () => perMonth(u.analyticsEvents),
    commands: () => ({ ...perMonth(u.monthlyRequests), approx: 'assumes 1 command per request' }),
    rows_read: () => perDay(u.dbReadsPerDay),
    rows_written: () => perDay(u.dbWritesPerDay),
    build_minutes: () => ({ value: u.automationRunsPerDay * u.minutesPerRun * 30, approx: 'runs/day × minutes × 30' }),
  };
  if (q.period === 'minute') return null;
  const f = table[q.metric];
  return f ? f() : null;
}

export type Level = 'ok' | 'near' | 'over' | 'na';
export interface QuotaCheck { quota: Quota; used: number | null; ratio: number | null; level: Level; approx: string | null }
export interface ResourceCost {
  id: string;
  checks: QuotaCheck[];
  level: Level;
  usd: number | null;
  costNote: string;
  confidence: 'exact' | 'estimate' | 'unknown';
}
export interface StackCost { rows: ResourceCost[]; totalUsd: number; complete: boolean; worst: Level }

const SOFTWARE: Resource['freeType'][] = ['fully-free', 'free-open-source', 'self-hosted', 'community-edition'];

export function costForResource(r: Resource, p: Pricing | undefined, u: Usage): ResourceCost {
  if (!p) {
    if (SOFTWARE.includes(r.freeType)) return { id: r.id, checks: [], level: 'ok', usd: 0, confidence: 'exact', costNote: r.flags.potentialHostingCosts ? 'Software is free. Server costs depend on where you run it.' : 'Free software.' };
    return { id: r.id, checks: [], level: 'na', usd: null, confidence: 'unknown', costNote: 'No verified quota data yet. Cost cannot be calculated reliably.' };
  }
  const checks: QuotaCheck[] = p.quotas.map((q) => {
    const m = usageFor(q, u);
    if (!m) return { quota: q, used: null, ratio: null, level: 'na', approx: null };
    const ratio = q.limit === 0 ? Infinity : m.value / q.limit;
    return { quota: q, used: m.value, ratio, level: ratio > 1 ? 'over' : ratio >= 0.8 ? 'near' : 'ok', approx: m.approx };
  });
  const evaluated = checks.filter((c) => c.level !== 'na');
  const level: Level = evaluated.some((c) => c.level === 'over') ? 'over' : evaluated.some((c) => c.level === 'near') ? 'near' : evaluated.length ? 'ok' : 'na';
  if (level !== 'over') {
    const partial = checks.some((c) => c.level === 'na');
    const capped = p.onExceed === 'pause' || p.onExceed === 'hard-cap' || p.onExceed === 'throttled';
    if (!evaluated.length && capped) return { id: r.id, checks, level, usd: 0, confidence: 'estimate', costNote: 'Quotas not simulated, but this free plan stops or throttles instead of billing.' };
    return { id: r.id, checks, level, usd: 0, confidence: evaluated.length ? 'estimate' : 'unknown',
      costNote: evaluated.length ? (partial ? '$0 on the quotas we can simulate. Some quotas are not simulated.' : '$0: inside every simulated quota.') : 'No simulated quota matches your inputs. Assumed $0, unverified.' };
  }
  const overMetrics = new Set(checks.filter((c) => c.level === 'over').map((c) => c.quota.metric));
  const overage = p.overage.filter((o) => overMetrics.has(o.metric));
  const behaviour = p.onExceed === 'pause' ? 'On the free plan the service pauses instead of billing.' : p.onExceed === 'hard-cap' ? 'On the free plan requests stop at the cap.' : p.onExceed === 'throttled' ? 'On the free plan requests get rate limited.' : '';
  if (overage.length) {
    let usd = p.nextPlan?.usdPerMonth ?? 0;
    for (const o of overage) {
      const c = checks.find((x) => x.quota.metric === o.metric && x.level === 'over')!;
      const monthly = c.quota.period === 'day' ? c.used! * 30 : c.used!;
      const limitMonthly = c.quota.period === 'day' ? c.quota.limit * 30 : c.quota.limit;
      const units = o.billing === 'all-usage' ? monthly : Math.max(0, monthly - limitMonthly);
      usd += (units / o.unitSize) * o.usdPerUnit;
    }
    return { id: r.id, checks, level, usd: round(usd), confidence: 'estimate', costNote: `Over the free quota. Estimate from published rates (${overage.map((o) => o.label).join('; ')})${p.nextPlan ? ` on ${p.nextPlan.name}` : ''}. ${behaviour}`.trim() };
  }
  if (p.nextPlan) return { id: r.id, checks, level, usd: p.nextPlan.usdPerMonth, confidence: 'estimate', costNote: `Over the free quota. Next plan ${p.nextPlan.name}: $${p.nextPlan.usdPerMonth}/month base. Usage charges may apply on top. ${behaviour}`.trim() };
  return { id: r.id, checks, level, usd: null, confidence: 'unknown', costNote: `Over the free quota. No reliable paid price recorded. ${behaviour}`.trim() };
}

export function costForStack(rs: Resource[], pricing: Map<string, Pricing>, u: Usage): StackCost {
  const rows = rs.map((r) => costForResource(r, pricing.get(r.id), u));
  const totalUsd = round(rows.reduce((a, r) => a + (r.usd ?? 0), 0));
  const complete = rows.every((r) => r.usd !== null && r.confidence !== 'unknown');
  const rank: Record<Level, number> = { over: 3, near: 2, ok: 1, na: 0 };
  const worst = rows.reduce<Level>((w, r) => (rank[r.level] > rank[w] ? r.level : w), 'na');
  return { rows, totalUsd, complete, worst };
}

/** Largest multiplier of current usage before the first simulated quota breaks. */
export function headroom(rows: ResourceCost[]): { factor: number; quota: string; id: string } | null {
  let best: { factor: number; quota: string; id: string } | null = null;
  for (const r of rows) for (const c of r.checks) {
    if (c.ratio == null || c.ratio === 0 || !isFinite(c.ratio)) continue;
    const f = 1 / c.ratio;
    if (!best || f < best.factor) best = { factor: f, quota: c.quota.label, id: r.id };
  }
  return best;
}

const round = (n: number) => Math.round(n * 100) / 100;
