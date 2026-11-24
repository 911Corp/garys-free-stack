# Gary's Free Stack

> ship more. spend less.

Find, compare and assemble free developer resources into a complete stack, with **real quotas from official pages, a source and a date for every claim, and `unknown` when nobody says**. Part of Gary's Adventures ([@Gary_NGMI](https://x.com/Gary_NGMI)).

## What it does
- **Explore**: local full-text search + combinable filters (category, stack slot, type of free, no card, commercial use, open source, self-host, local-first, account, quotas, complexity, verification age). Unknown never passes a filter.
- **Resource sheets**: type of free, exact quotas, what happens when exceeded, next paid step, restrictions, license, pros/cons, alternatives, sources with check dates, "report outdated" button.
- **Compare**: up to 4 side by side, export Markdown, share URL.
- **Stack Builder**: 12 slots, project context (commercial / sensitive data / 24/7), compatibility findings from documented rules, conditions to stay at $0, dependencies, alternatives, receipt-style cost estimate. Save, export (MD/JSON), import JSON, share URL, X card.
- **Stack templates**: 15 documented $0 stacks, with conditions, limits and indirect costs.
- **Cost simulator**: usage sliders vs documented quotas, which quota breaks first, cost only from published prices.
- **Hidden gems**, random discovery, favorites, saved stacks, history.
- **API directory**: 20 APIs from public-apis (MIT), clearly marked unverified.

## Quick start
```bash
npm install
npm run dev      # http://localhost:5173
npm test
npm run build    # validates the catalog first, then typechecks and builds
```

## Project layout
```
data/                 catalog, pricing, rules, templates (JSON, source of truth)
data/imports/         unverified imported layers
src/core/             pure logic: schema, search, compat engine, cost engine, stack codec, exports, voice
src/pages, components UI (React + TypeScript + Vite, hash routing)
scripts/              validate-catalog, check-links, stale-report, import-public-apis
tests/                vitest suites
docs/                 study, schema, sources, compatibility, cost simulator, deployment, roadmap, limitations
```

## Principles
1. Never invent a quota, price, feature or term. If the official page does not say it, it is `null` and shows as *unknown*.
2. Open source ≠ free to host. Trial ≠ free plan. Credits ≠ durable $0. These distinctions are visible on every card.
3. Compatibility comes from documented rules with sources, not generated claims.
4. No accounts, no backend, no paid API. Free Stack runs on a $0 stack itself (see `/how-its-built`).
5. Partnerships never change rankings. Any future affiliate link will be labelled.

## Docs
- [Competitive study](docs/competitive-study.md)
- [Data schema](docs/data-schema.md) · [Sources](docs/sources.md)
- [Compatibility engine](docs/compatibility.md) · [Cost simulator](docs/cost-simulator.md)
- [Deployment](docs/deployment.md) · [Roadmap](docs/roadmap.md) · [Known limitations](docs/limitations.md)
- [Pre-launch audit](docs/audit-2026-11-24.md) · [Changelog](CHANGELOG.md)

## License
Code MIT. Catalog data CC BY 4.0. Imported public-apis data MIT (upstream).

Built by Gary. Budget approved by Jarvis.
