import { z } from 'zod';
import { PricingSchema, ResourceSchema, RuleSchema, TemplateSchema, type Pricing, type Resource, type Rule, type Template } from './schema';

export interface CatalogInput { resources: unknown; pricing: unknown; rules: unknown; templates: unknown }
export interface ValidationResult { errors: string[]; warnings: string[] }

/** Structural + referential validation of the whole catalog. Pure, used by tests and the CLI. */
export function validateCatalog(input: CatalogInput, today = new Date().toISOString().slice(0, 10)): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const parse = <T>(schema: z.ZodType<T>, data: unknown, name: string): T[] => {
    const r = z.array(schema).safeParse(data);
    if (!r.success) {
      for (const i of r.error.issues.slice(0, 30)) errors.push(`${name}[${i.path.join('.')}]: ${i.message}`);
      return [];
    }
    return r.data;
  };
  const resources: Resource[] = parse(ResourceSchema, input.resources, 'resources');
  const pricing: Pricing[] = parse(PricingSchema, input.pricing, 'pricing');
  const rules: Rule[] = parse(RuleSchema, input.rules, 'rules');
  const templates: Template[] = parse(TemplateSchema, input.templates, 'templates');

  const ids = new Set<string>();
  for (const r of resources) {
    if (ids.has(r.id)) errors.push(`duplicate resource id ${r.id}`);
    ids.add(r.id);
  }
  for (const r of resources) {
    for (const a of r.alternatives) if (!ids.has(a)) errors.push(`${r.id}: unknown alternative ${a}`);
    if (r.lastVerified > today) errors.push(`${r.id}: lastVerified in the future`);
    for (const s of r.sources) if (s.checkedAt > today) errors.push(`${r.id}: source checkedAt in the future`);
    if (r.flags.openSource && !r.license) warnings.push(`${r.id}: open source without license`);
    if (r.freeType === 'non-commercial-only' && r.flags.commercialUse === true) errors.push(`${r.id}: non-commercial-only but commercialUse=true`);
    if (r.status === 'verified' && r.sources.length === 0) errors.push(`${r.id}: verified without sources`);
  }
  const pids = new Set<string>();
  for (const p of pricing) {
    if (!ids.has(p.id)) errors.push(`pricing ${p.id}: no matching resource`);
    if (pids.has(p.id)) errors.push(`pricing ${p.id}: duplicate`);
    pids.add(p.id);
  }
  for (const rule of rules) {
    for (const k of [rule.when.a, rule.when.b]) if (k && !k.startsWith('@') && !ids.has(k)) errors.push(`rule ${rule.id}: unknown resource ${k}`);
  }
  const byId = new Map(resources.map((r) => [r.id, r]));
  for (const t of templates) {
    for (const [role, list] of Object.entries(t.slots)) {
      for (const id of list ?? []) {
        const r = byId.get(id);
        if (!r) errors.push(`template ${t.id}: unknown resource ${id}`);
        else if (!r.roles.includes(role as Resource['roles'][number])) warnings.push(`template ${t.id}: ${id} used as ${role} but its roles are ${r.roles.join(',')}`);
      }
    }
  }
  return { errors, warnings };
}
