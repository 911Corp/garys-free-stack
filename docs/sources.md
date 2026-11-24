# Sources

Every resource lists its sources in `data/resources.json` (`sources[]`) and `data/pricing.json`. All v0.1 sources were checked on **2026-11-24**.

Source types used, in order of preference:
1. Official pricing pages (e.g. supabase.com/pricing, neon.com/pricing, vercel.com/pricing).
2. Official documentation pages for limits (e.g. GitHub Pages limits, Render free docs, Cloudflare Workers pricing).
3. License files in the official repository (shallow clones, `LICENSE*` read verbatim).
4. Catalogs whose license allows reuse: public-apis (MIT), imported as unverified.

Not used as sources: blog posts, aggregators, AI answers, free-for.dev content (no license).

Terms respected: link checks send a clear User-Agent, 4 parallel requests max, HEAD first. No scraping of pages that forbid it; pricing change detection is a human review of flagged pages.

## Items marked Needs Review in v0.1
- `groq`: the rate-limit table mixes Free and Developer labels.
- `oracle-always-free`: landing page does not list Always Free capacities.
- `open-webui`: custom license, needs full legal reading.
- `coingecko-api`: pricing page unreachable during verification.
