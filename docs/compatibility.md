# Compatibility engine

Source: `src/core/compat.ts`. Pure function: `analyzeStack(stack, byId, rules, catalog) → Finding[]`.

## Inputs
- The stack: resources per slot, plus project context (`commercial`, `sensitive`, `alwaysOn`).
- Each resource's `compat.provides` / `compat.requires` capability tokens.
- `data/rules.json`: explicit, sourced rules.

## Checks, in order
1. **Requirements.** For each `requires` token, another selected resource must provide it. Matching is prefix based (`server-runtime` is satisfied by `server-runtime:node`), and `a|b` means either. Missing → `warn` with up to 4 catalog options that provide it.
2. **Documented rules.** A rule fires when `when.a` is selected and `when.b` is either selected or a context token is true: `@commercial`, `@sensitive`, `@always-on`, `@needs-server`, `@slot:<role>`. Each rule carries its official source, shown in the UI.
3. **Terms from flags.** In a commercial project, `commercialUse: false` → `error`; `null` → one `info` listing resources whose commercial terms were not found.
4. **Durability.** Trials, credits, student-only → `warn`. Non-verified data status → `info` (`error` if discontinued). Software needing a server → `info`.
5. **Overlap.** Two picks in the same slot providing the same capability → `info`.

## Capability vocabulary (v0.1)
`static-hosting`, `server-runtime:{node,edge,any}`, `sql`, `postgres`, `sqlite`, `nosql`, `kv`, `object-storage`, `auth`, `email`, `smtp`, `newsletter`, `vector-db`, `llm-api`, `llm-local`, `embeddings`, `chat-ui`, `analytics`, `error-tracking`, `uptime`, `ci`, `automation`, `cron`, `ui-framework`, `build-tool`, `css`, `components`, `icons`, `game-engine`, `discord-bot-lib`, `tunnel`, `dns`, `cdn`, `ssl`, `vps`, `search`, `weather-data`, `map-tiles`, `crypto-data`, `images`, ...

## Adding a rule
Only from an official statement. Write the `description` (what the source says), the `message` (what the user should do), the `severity`, and the `source` URL. Add a test in `tests/engines.test.ts` if it encodes non-obvious logic.

## Limits
No warning means no **known** problem, not guaranteed compatibility. SDK-level compatibility (versions, regions, runtimes APIs) is not modelled yet.
