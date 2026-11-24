# Known limitations (v0.1)

- **Catalog size**: 71 verified resources. Phase 3 target is 100 to 200. Coverage is thin in design assets, game dev and open data.
- **Logos**: generated monograms, not official logos (avoids trademark and hotlinking issues).
- **Unknowns**: many free tiers do not state card requirements or commercial terms on their pricing page; they show as unknown. That is honest, but it makes the "no card" and "commercial" filters strict.
- **Rate limits**: Gemini free tier limits live on a separate page not captured yet; Groq table labels are ambiguous.
- **Cost simulator**: full usage applied to each service (overestimates split traffic); some metrics not simulated; USD list prices, no taxes.
- **Compatibility**: capability-level only, not SDK or version level. No warning ≠ guaranteed.
- **API directory**: 2,500+ entries from public-apis are unverified and may be stale.
- **Report / suggest buttons** open GitHub issues on `911Corp/garys-free-stack`: they work once that repo exists.
- **Storage**: favorites and stacks live in the browser (localStorage). Clearing site data deletes them; use JSON export.
- **Link checker**: some sites (Unsplash, CoinGecko, Phaser) refuse bots with 401/403: those need a human look, not a fix.
- **Bundle**: main JS ~137 kB gzipped; the API directory loads on demand (~134 kB gzipped).
