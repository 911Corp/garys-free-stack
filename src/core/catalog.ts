import resourcesJson from '../../data/resources.json';
import pricingJson from '../../data/pricing.json';
import rulesJson from '../../data/rules.json';
import templatesJson from '../../data/templates.json';
import type { Pricing, Resource, Rule, Template, FreeType, Role, Status } from './schema';

export const resources = resourcesJson as Resource[];
export const pricing = pricingJson as Pricing[];
export const rules = rulesJson as Rule[];
export const templates = templatesJson as Template[];

export const byId = new Map(resources.map((r) => [r.id, r]));
export const pricingById = new Map(pricing.map((p) => [p.id, p]));

export const FREE_TYPE_META: Record<FreeType, { label: string; durable: boolean; hint: string }> = {
  'fully-free': { label: 'Fully Free', durable: true, hint: 'No paid plan needed for the core use.' },
  'free-open-source': { label: 'Free & Open Source', durable: true, hint: 'Open source license. Hosting may still cost money.' },
  'free-tier': { label: 'Free Tier', durable: true, hint: 'Permanent free plan with quotas.' },
  'free-with-limits': { label: 'Free with Limits', durable: true, hint: 'Free, but caps or usage rules apply.' },
  'free-credits': { label: 'Free Credits', durable: false, hint: 'Temporary credits. Not a durable $0.' },
  'free-trial': { label: 'Free Trial', durable: false, hint: 'Ends after a period. Not a free plan.' },
  'self-hosted': { label: 'Self-hosted', durable: true, hint: 'Free software, you provide the server.' },
  'community-edition': { label: 'Community Edition', durable: true, hint: 'Free edition of a commercial product.' },
  'student-only': { label: 'Student Only', durable: false, hint: 'Requires student status.' },
  'non-commercial-only': { label: 'Non-commercial Only', durable: true, hint: 'Free for personal or non-commercial use only.' },
};

export const STATUS_META: Record<Status, { label: string; tone: 'ok' | 'warn' | 'bad' | 'muted' }> = {
  verified: { label: 'Verified', tone: 'ok' },
  'needs-review': { label: 'Needs Review', tone: 'warn' },
  'pricing-changed': { label: 'Pricing Changed', tone: 'warn' },
  discontinued: { label: 'Discontinued', tone: 'bad' },
  unverified: { label: 'Unverified', tone: 'muted' },
};

export const ROLE_META: Record<Role, { label: string; hint: string }> = {
  frontend: { label: 'Frontend', hint: 'Framework, UI kit, build tool' },
  backend: { label: 'Backend', hint: 'Server code, functions, bots' },
  hosting: { label: 'Hosting', hint: 'Where it runs' },
  database: { label: 'Database', hint: 'Where the data lives' },
  auth: { label: 'Authentication', hint: 'Sign-in and users' },
  storage: { label: 'Storage', hint: 'Files and uploads' },
  ai: { label: 'AI', hint: 'Models, inference, vectors' },
  analytics: { label: 'Analytics', hint: 'Who visits' },
  email: { label: 'Email', hint: 'Transactional and newsletters' },
  monitoring: { label: 'Monitoring', hint: 'Errors and uptime' },
  automation: { label: 'Automation', hint: 'CI, cron, workflows' },
  extras: { label: 'Extras', hint: 'Data, design, tunnels, tools' },
};

export const CATEGORY_META: Record<Resource['categories'][number], string> = {
  infrastructure: 'Infrastructure',
  development: 'Development',
  ai: 'AI',
  design: 'Design & creative',
  'data-apis': 'Data & APIs',
  'open-source-local': 'Open source & local-first',
};

export const catalogStats = () => ({
  total: resources.length,
  verified: resources.filter((r) => r.status === 'verified').length,
  withQuotas: pricing.filter((p) => p.quotas.length).length,
  lastVerified: resources.map((r) => r.lastVerified).sort().at(-1) ?? null,
});
