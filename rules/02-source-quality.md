# Source Quality Rules

## Source tiers

Use these tiers when classifying evidence.

### Tier 1 - Primary decision-grade evidence

- SEC filings and exhibits.
- Company earnings releases and investor presentations.
- Official call transcripts when available from company IR.
- DEF 14A proxy statements, 8-K CEO change filings, and official company leadership biographies.
- Regulator releases.
- Official macroeconomic statistics.

### Tier 2 - Reputable secondary evidence

- Reuters, Associated Press, Financial Times, Wall Street Journal, Bloomberg, CNBC, MarketWatch, and similar reputable outlets.
- Analyst summaries only when clearly labeled as opinion.

### Tier 3A - Lead-only edge sources

- Industry blogs, podcasts, expert commentary, social platforms, forums, and newsletters.
- Job postings, patents, app reviews, customer reviews, supplier/customer chatter, niche datasets, community reports, and non-anonymous specialist commentary.
- These can generate edge hypotheses but must not drive signals alone.

### Tier 3B - Context only

- Anonymous forums, social posts, promotional newsletters, message boards, unsourced screenshots, rumor summaries, and anecdotal claims.
- These may help identify questions only when clearly labeled as lead-only and corroborated elsewhere before affecting a thesis.

## Required checks

For material claims, ask:

1. Is the source primary or secondary?
2. Is the source recent enough for the claim?
3. Does the source directly support the claim?
4. Is there conflicting evidence?
5. Is the claim material to revenue, margin, cash flow, valuation, risk, or investor sentiment?
6. For CEO claims, does the source show observable background, incentives, decisions, or execution instead of unsupported personality judgment?
7. For CEO style or personality claims, is the claim framed as an inference from repeated sourced behavior rather than a psychological diagnosis?
8. For insider transaction claims, does the evidence distinguish open-market buys/sales from grants, option exercises, tax withholding, gifts, and planned trading plans?
9. For buyback claims, does the evidence show actual repurchase execution and share-count effect, not only an authorization headline?
10. For edge hypotheses, is the source being used as a lead, a corroborating source, or decision-grade proof?
11. Has the analysis actively searched for disconfirming evidence before calling an idea an edge?

## Edge evidence gates

- A Tier 3 source can create an `unverified_lead`, but cannot make a hypothesis `verified_edge`.
- A hypothesis can be `partly_verified` when a Tier 3 lead is consistent with at least one higher-quality independent source or a directly observed public data point.
- A hypothesis can be `verified_edge` only when supported by primary evidence, directly observed public data, or multiple independent reputable secondary sources.
- If primary evidence contradicts the lead, label the idea `disproved` unless there is a clear reason the primary evidence is stale or incomplete.
- Preserve rejected ideas in `edge-lab.md` so future runs do not rediscover the same weak thesis.

## Citation practice inside artifacts

Use file paths or URLs under each claim. Example:

```text
Evidence: stocks/AAPL/data/raw/sec/AAPL-submissions-2026-05-09.json
Evidence: https://www.sec.gov/Archives/...
```

Do not cite a source that was not actually inspected.
