# Data schema

All data lives in `data/` as JSON, validated by Zod (`src/core/schema.ts`) on every build (`npm run validate`) and in tests.

| File | Content |
|---|---|
| `data/resources.json` | Catalog: identity, classification, flags, license, compatibility capabilities, restrictions, pros/cons, alternatives, status, sources |
| `data/pricing.json` | Pricing layer: numeric quotas, behaviour when exceeded, next paid plan, published per-unit rates, caveats, sources |
| `data/rules.json` | Documented compatibility rules, each with an official source |
| `data/templates.json` | $0 stack templates: slots, conditions, limits, indirect costs |
| `data/imports/public-apis.json` | Unverified API layer imported from public-apis (MIT) |

## The `null` rule
Every tri-state flag (`noCard`, `commercialUse`, `openSource`, ...) is `true | false | null`. `null` means **no official source states it**. The UI shows it as *unknown*, filters never let it pass, and the cost engine never counts it as $0.

## Resource (abridged)
```ts
{
  id, name, tagline, description,
  categories: ('infrastructure'|'development'|'ai'|'design'|'data-apis'|'open-source-local')[],
  tags: string[], roles: StackSlot[],
  website, docs|null, repo|null, pricingUrl|null,
  freeType: 'fully-free'|'free-open-source'|'free-tier'|'free-with-limits'|'free-credits'|'free-trial'|'self-hosted'|'community-edition'|'student-only'|'non-commercial-only',
  flags: { noCard, noAccount, commercialUse, openSource, selfHostable, localFirst, potentialHostingCosts, usageBased },  // boolean|null
  license|null, complexity: 'easy'|'medium'|'advanced' (editorial),
  compat: { provides: string[], requires: string[] },
  restrictions[], pros[], cons[], alternatives[ids],
  status: 'verified'|'needs-review'|'pricing-changed'|'discontinued'|'unverified',
  lastVerified: 'YYYY-MM-DD', sources: [{ label, url, checkedAt }], gem?, notes?
}
```

## Pricing
```ts
{ id, plan, quotas: [{ metric, limit, period: 'month'|'day'|'minute'|'total', label, scope? }],
  onExceed: 'pause'|'hard-cap'|'billed'|'throttled'|'unknown', onExceedNote?,
  nextPlan: { name, usdPerMonth, note? } | null,
  overage: [{ metric, usdPerUnit, unitSize, label, billing: 'all-usage'|'beyond-included', requiresPlan? }],
  caveats[], sources[] }
```

## Adding or updating a resource
1. Open the official pricing page, docs and license file.
2. Write only what they say. Anything missing stays `null` / absent.
3. Set `lastVerified` and each source's `checkedAt` to today.
4. `npm run validate && npm test`.
5. Pricing changes go through a pull request (human review): the history of each change is the git history of `data/`.
