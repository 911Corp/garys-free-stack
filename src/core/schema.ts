import { z } from 'zod';

/**
 * Data contract for the Free Stack catalog.
 * Rule zero: unknown is a valid value. `null` means "not verified / not stated
 * by an official source". Never fill a null with a guess.
 */

import { CATEGORIES, FREE_TYPES, METRICS, PERIODS, ROLES, STATUSES } from './constants';
export { CATEGORIES, FREE_TYPES, METRICS, PERIODS, ROLES, STATUSES };

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD');
const url = z.string().url();
const triState = z.boolean().nullable(); // true | false | null (unknown)

export const SourceSchema = z.object({
  label: z.string().min(2),
  url,
  checkedAt: isoDate,
});

export const ResourceSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  tagline: z.string().min(4).max(90),
  description: z.string().min(20),
  categories: z.array(z.enum(CATEGORIES)).min(1),
  tags: z.array(z.string()).min(1),
  roles: z.array(z.enum(ROLES)),
  website: url,
  docs: url.nullable(),
  repo: url.nullable(),
  pricingUrl: url.nullable(),
  freeType: z.enum(FREE_TYPES),
  flags: z.object({
    noCard: triState,
    noAccount: triState,
    commercialUse: triState,
    openSource: triState,
    selfHostable: triState,
    localFirst: triState,
    potentialHostingCosts: triState,
    usageBased: triState,
  }),
  license: z.string().nullable(),
  complexity: z.enum(['easy', 'medium', 'advanced']),
  compat: z.object({
    provides: z.array(z.string()),
    requires: z.array(z.string()),
  }),
  restrictions: z.array(z.string()),
  pros: z.array(z.string()),
  cons: z.array(z.string()),
  alternatives: z.array(z.string()),
  status: z.enum(STATUSES),
  lastVerified: isoDate,
  sources: z.array(SourceSchema).min(1),
  gem: z.string().optional(),
  notes: z.string().optional(),
});

export const QuotaSchema = z.object({
  metric: z.enum(METRICS),
  limit: z.number().nonnegative(),
  period: z.enum(PERIODS),
  label: z.string(),
  scope: z.string().optional(),
});

export const OverageSchema = z.object({
  metric: z.enum(METRICS),
  usdPerUnit: z.number().positive(),
  unitSize: z.number().positive(),
  label: z.string(),
  /** all-usage: rate applies to every unit once on the paid plan. beyond-included: only units above the free quota. */
  billing: z.enum(['all-usage', 'beyond-included']),
  requiresPlan: z.string().optional(),
});

export const PricingSchema = z.object({
  id: z.string(),
  plan: z.string(),
  quotas: z.array(QuotaSchema),
  onExceed: z.enum(['pause', 'hard-cap', 'billed', 'throttled', 'unknown']),
  onExceedNote: z.string().optional(),
  nextPlan: z.object({ name: z.string(), usdPerMonth: z.number().nonnegative(), note: z.string().optional() }).nullable(),
  overage: z.array(OverageSchema),
  caveats: z.array(z.string()),
  sources: z.array(SourceSchema).min(1),
});

export const RuleSchema = z.object({
  id: z.string(),
  kind: z.enum(['requires', 'conflict', 'overlap', 'pairs', 'terms']),
  description: z.string(),
  when: z.object({
    a: z.string(),
    b: z.string().optional(),
  }),
  severity: z.enum(['info', 'warn', 'error']),
  message: z.string(),
  source: z.object({ label: z.string(), url }).nullable(),
});

export const TemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  pitch: z.string(),
  keywords: z.array(z.string()),
  slots: z.partialRecord(z.enum(ROLES), z.array(z.string())),
  conditions: z.array(z.string()),
  limits: z.array(z.string()),
  indirectCosts: z.array(z.string()),
  jarvis: z.string(),
});

export const ImportedApiSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  auth: z.string().nullable(),
  https: z.boolean().nullable(),
  cors: z.string().nullable(),
  url,
});

export type Source = z.infer<typeof SourceSchema>;
export type Resource = z.infer<typeof ResourceSchema>;
export type Pricing = z.infer<typeof PricingSchema>;
export type Quota = z.infer<typeof QuotaSchema>;
export type Rule = z.infer<typeof RuleSchema>;
export type Template = z.infer<typeof TemplateSchema>;
export type ImportedApi = z.infer<typeof ImportedApiSchema>;
export type Role = (typeof ROLES)[number];
export type FreeType = (typeof FREE_TYPES)[number];
export type Metric = (typeof METRICS)[number];
export type Status = (typeof STATUSES)[number];
