# Competitive study (2026-11-24)

What exists, what it does well, and where Free Stack fits.

| Project | Strengths | Weaknesses for our use case | Reuse |
|---|---|---|---|
| **free-for.dev** (ripienaar/free-for-dev) | Huge, community maintained list of SaaS free tiers, ~1,800 lines, very current | One flat Markdown list. No structured fields (card? commercial? quotas?), no dates per entry, no comparison, no stack logic | **No license file in the repo** → all rights reserved by default. Used for discovery only, never copied. |
| **public-apis** (public-apis/public-apis) | 2,500+ APIs with auth / HTTPS / CORS columns, categorized | Says nothing about quotas or commercial terms, many entries stale | **MIT** → imported as an *unverified* layer (`data/imports/public-apis.json`, `/apis` page) with attribution. |
| **GitHub Awesome lists** | Deep curation per topic (self-hosted, selfhosted alternatives, design resources) | Inconsistent format, licenses vary per list (often CC0, sometimes none) | Case by case. awesome-selfhosted is a good discovery source for Phase 4 (check its license before importing). |
| **AlternativeTo** | Great "alternative to X" graph, user votes | Proprietary content, no reuse, ads, pricing info is coarse ("free / freemium") | No reuse. Inspiration for the "alternatives" field. |
| **Open source directories** (OpenAlternative, opensource.builders) | OSS alternatives to SaaS, nice UX | Do not separate "free software" from "free to run" | Inspiration for the self-hosted vs hosting-cost distinction. |
| **Cloud comparators** (vendor calculators) | Precise numbers | One vendor at a time; built to sell | Pricing pages are our primary sources anyway. |
| **Stack builders** (StackShare and similar) | Shows what companies use | Popularity, not cost; no quotas; no compatibility rules | Inspiration for shareable stacks. |

## Gaps Free Stack fills

1. **Structured truth**: every resource has typed fields (type of free, card, commercial use, license, self-host) with `unknown` as a first-class value.
2. **Sources + dates per resource**, and data statuses (Verified, Needs Review, Pricing Changed, Discontinued, Unverified).
3. **Stack Builder with documented compatibility rules**, not generated claims.
4. **Cost simulator** against real quotas, saying which quota breaks first and what happens then (pause, cap, bill).
5. **Honest classification**: trial ≠ free plan, credits ≠ durable $0, open source ≠ free to host.

## Decision
Do not clone a directory. Build a smaller verified core (71 resources in v0.1) plus an explicitly unverified wide layer (public-apis), and grow the verified core over time.
