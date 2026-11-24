# Changelog

## 0.1.1 (2026-11-24)
Pre-launch audit, see `docs/audit-2026-11-24.md`.
- Dependencies upgraded (React 19, React Router 7, Zod 4, Vite 8, Vitest 5): 0 known vulnerabilities.
- Fixed builder input lag, hidden import on empty builder, skip link 404, simulator duplicates, Sentry metric, importer format change (2,493 APIs).
- Accessibility: 0 axe violations on all routes, desktop and mobile. No horizontal overflow at 390 px.
- Data: 7 duplicate caveats removed, OSM and CoinGecko entries corrected, 207 links checked.

## 0.1.0 (2026-11-24)
First usable version. Not deployed.

- Catalog of 71 resources across 6 categories, each verified against official pages on 2026-11-24, with sources and dates. 4 marked Needs Review.
- Pricing layer for 31 services: quotas, behaviour on exceed, next plan, published rates.
- 13 documented compatibility rules + generic requirement, terms, durability and overlap checks.
- 15 documented $0 stack templates.
- Explore (local full-text search, 12 combinable filters), resource sheets, Compare (4 max), Stack Builder, Cost simulator with receipt, Hidden Gems, random discovery, favorites, saved stacks, history.
- Exports: Markdown, JSON (re-importable), CSV; share URLs; X share card (PNG) and prefilled post.
- Unverified API directory: 20 APIs imported from public-apis (MIT).
- Scripts: catalog validation, link checker, stale report, public-apis importer. 25 tests.
- GitHub Actions: CI, weekly data check, manual-only deploy.
