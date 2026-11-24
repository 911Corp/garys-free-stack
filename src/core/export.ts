import type { Resource } from './schema';
import type { Stack } from './stack';
import type { StackCost } from './cost';
import type { Finding } from './compat';
import { ROLE_META } from './catalog';

const yn = (v: boolean | null) => (v === true ? 'yes' : v === false ? 'no' : 'unknown');

export function stackToMarkdown(stack: Stack, byId: Map<string, Resource>, findings: Finding[], cost: StackCost | null, url: string): string {
  const lines = [`# ${stack.name}`, '', `Built with Gary's Free Stack. ${url}`, ''];
  for (const [role, ids] of Object.entries(stack.slots)) {
    if (!ids?.length) continue;
    lines.push(`## ${ROLE_META[role as keyof typeof ROLE_META].label}`);
    for (const id of ids) {
      const r = byId.get(id);
      if (!r) continue;
      lines.push(`- **${r.name}** (${r.freeType}) ${r.website}`, `  - ${r.tagline}`, `  - credit card required: ${yn(r.flags.noCard === null ? null : !r.flags.noCard)}, commercial use: ${yn(r.flags.commercialUse)}, verified ${r.lastVerified}`);
      for (const x of r.restrictions) lines.push(`  - limit: ${x}`);
    }
    lines.push('');
  }
  if (findings.length) {
    lines.push('## Compatibility notes');
    for (const f of findings) lines.push(`- [${f.severity}] ${f.message}${f.source ? ` (${f.source.url})` : ''}`);
    lines.push('');
  }
  if (cost) {
    lines.push('## Estimated monthly cost', `- total: $${cost.totalUsd}${cost.complete ? '' : ' (incomplete: some costs unknown)'}`);
    for (const r of cost.rows) lines.push(`- ${byId.get(r.id)?.name}: ${r.usd === null ? 'unknown' : '$' + r.usd} (${r.costNote})`);
    lines.push('');
  }
  lines.push('_Data from official pricing pages. Always re-check before you rely on a quota._');
  return lines.join('\n');
}

export function stackToJson(stack: Stack): string {
  return JSON.stringify({ format: 'garys-free-stack/stack@1', ...stack }, null, 2);
}

const csvCell = (v: unknown) => {
  const s = v === null || v === undefined ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
export function resourcesToCsv(list: Resource[]): string {
  const cols = ['id', 'name', 'freeType', 'categories', 'website', 'pricingUrl', 'noCard', 'commercialUse', 'openSource', 'selfHostable', 'license', 'status', 'lastVerified'];
  const rows = list.map((r) => [r.id, r.name, r.freeType, r.categories.join('|'), r.website, r.pricingUrl, yn(r.flags.noCard), yn(r.flags.commercialUse), yn(r.flags.openSource), yn(r.flags.selfHostable), r.license, r.status, r.lastVerified]);
  return [cols, ...rows].map((r) => r.map(csvCell).join(',')).join('\n');
}

export function download(filename: string, content: string | Blob, type = 'text/plain') {
  const blob = typeof content === 'string' ? new Blob([content], { type }) : content;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
