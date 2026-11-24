import type { Template } from './schema';
import type { ProjectFlags } from './stack';

/** Deterministic, rule-based matcher. No AI API: keywords in templates.json decide. */
export function matchIdea(idea: string, templates: Template[]): { template: Template; score: number; hits: string[] }[] {
  const text = ` ${idea.toLowerCase().replace(/[^a-z0-9$ -]/g, ' ')} `;
  if (!text.trim()) return [];
  return templates
    .map((t) => {
      const hits = t.keywords.filter((k) => text.includes(` ${k}`) || text.includes(`${k} `) || (k.length > 4 && text.includes(k)));
      return { template: t, score: hits.reduce((a, k) => a + (k.includes(' ') ? 2 : 1), 0), hits };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

export function flagsFromIdea(idea: string): ProjectFlags {
  const t = idea.toLowerCase();
  return {
    commercial: /\b(sell|selling|paid|pricing|customers?|clients?|business|commercial|revenue|monetiz|subscription|saas|shop|store|e-?commerce)\b/.test(t),
    sensitive: /\b(health|medical|patient|bank|finance data|private|personal data|sensitive|password|legal|hr)\b/.test(t),
    alwaysOn: /\b(bot|24\/7|always[- ]on|realtime|real-time|websocket|monitor|cron|scheduled)\b/.test(t),
  };
}
