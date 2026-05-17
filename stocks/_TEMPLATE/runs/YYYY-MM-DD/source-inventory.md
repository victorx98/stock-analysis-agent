# Source Inventory - TICKER - YYYY-MM-DD

| Source | Type | Tier | Path/URL | Status | Notes |
|---|---|---:|---|---|---|
| SEC submissions | Filing metadata | 1 | stocks/TICKER/data/raw/sec/ | pending review | Add latest file path after inspection. |
| Proxy / governance filings | CEO, incentives, ownership | 1 | stocks/TICKER/data/raw/sec/ | pending review | Review DEF 14A, 8-K CEO changes, Forms 3/4/5, incentives, and governance context when available. |
| Insider transactions / buybacks | Forms 3/4/5, 10-K/10-Q repurchase table, 8-K authorizations | 1 | stocks/TICKER/data/raw/sec/ | pending review | Search recent management-team stock purchases/sales and company repurchase authorization/execution. |
| Company profile / investor relations | Business type, CEO bio, strategy | 1 | stocks/TICKER/profile.json | pending review | Confirm business classification, CEO background, prior wins/misses, management style, current goals, and shareholder materials. |
| Broad lead / edge sources | Edge hypotheses | lead-only | stocks/TICKER/runs/YYYY-MM-DD/edge-lab.md | pending review | Search messy and non-consensus sources as leads, then verify or disprove before synthesis. |
| Company info APIs | Company profile / valuation inputs | market data | stocks/TICKER/data/raw/company-info/ | pending review | Massive ticker overview and Alpha Vantage company overview when API keys are configured. |
| Trusted news | News/catalyst | 2 | stocks/TICKER/data/raw/news/ | pending review | Add latest file path after inspection. |
| Market trend | Price data | market data | stocks/TICKER/data/raw/market/ | pending review | Add latest file path after inspection. |

## Tool Runs

| Tool | Command | Status | Exit | Started | Finished | Notes |
|---|---|---|---:|---|---|---|
| No tools recorded yet. |  | pending |  |  |  |  |

## Source Files Created

- None recorded yet.

## Skipped Sources

- None recorded.

## Tool / Source Issues

- None recorded.
