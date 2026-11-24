# Cost simulator

Source: `src/core/cost.ts`.

## Usage inputs → quota metrics
| Input | Metric(s) |
|---|---|
| Monthly active users | `mau` |
| Requests / month | `requests`, `commands` (assumes 1 Redis command per request) |
| Bandwidth / month | `bandwidth_gb` |
| File storage | `storage_gb` |
| Database size | `db_storage_gb` |
| DB reads / writes per day | `rows_read`, `rows_written` |
| Emails / month | `emails` |
| Function runs / month | `function_invocations` |
| AI requests / tokens per day | `ai_requests`, `ai_tokens` |
| Analytics events / month | `events` |
| Automation runs/day × minutes | `build_minutes` |

Not simulated (shown as such): `errors`, `compute_hours`, `neurons`, `credits`, `builds`, `monitors`, `projects`, per-minute limits.

## Period conversion
Daily quota vs monthly input: monthly ÷ 30. Monthly quota vs daily input: daily × 30. The UI labels every converted figure.

## Per resource
- Inside every simulated quota → `$0` (estimate).
- No pricing data: free software (`fully-free`, OSS, self-hosted, community) → `$0` + hosting caveat; anything else → **unknown**.
- No simulatable quota but the free plan pauses/caps/throttles → `$0` (it cannot bill).
- Over a quota:
  - published per-unit rates → `next plan base + rate × units` (`all-usage` bills every unit, `beyond-included` only the excess);
  - otherwise next plan base price, labelled as a floor;
  - otherwise **unknown**.

## Total
Sum of known amounts. If anything is unknown the total shows `+` and "a floor, not a promise".

## Known simplifications
- Each service is compared with the full usage figure (e.g. all bandwidth), which overestimates split traffic.
- Taxes, currency and regional prices are ignored (USD list prices).
- Next-plan included allowances are not modelled beyond what is listed in `overage`.
