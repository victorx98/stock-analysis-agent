---
name: investment-thesis-synthesis
description: Synthesize a complete stock research decision brief from SEC filings, trusted news, market trends, prior summaries, and risks. Use at the end of each ticker run to produce signal.json, decision-brief.md, and the updated summary.html watchlist.
---

# Investment Thesis Synthesis

## Procedure

1. Read all rule files listed in root `AGENTS.md`.
2. Read the prior `stocks/<TICKER>/summary.html`.
3. Read prior run artifacts, especially `signal.json`, `decision-brief.md`, `valuation-analysis.md`, `insider-and-buybacks.md`, `market-trend.md`, `risk-register.md`, and `watchlist-next-run.md`.
4. Complete `thesis-review.md`: score prior judgment accuracy, explain what was right or wrong, and state the lesson applied in this run. If this is the first run, mark it `baseline_no_prior_call`.
5. Read current run artifacts.
6. Build an evidence table before choosing a signal.
7. Complete `valuation-analysis.md`: classify the business, choose appropriate valuation model(s), estimate bear/base/bull value ranges where possible, judge margin of safety, and run cheap-trap checks.
8. Complete `leadership-analysis.md`: identify the CEO, founder status, pre-CEO background, prior success and failure patterns, observable management style, current-company goal, execution pattern, strategic clarity, unique advantages, and leadership risks.
9. Complete `insider-and-buybacks.md`: review recent management-team stock purchases/sales, distinguish transaction types, check buyback authorization and execution, and judge share-count effect.
10. Start the summary with a plain-English bottom line for a non-financial reader.
11. Explain how the stock can make money, how it can lose money, and what must happen next.
12. Include bull case, bear case, risks, contrary evidence, invalidation triggers, and prior-thesis review.
13. Use a directional signal when the evidence supports a clear risk/reward skew; do not default to `hold_neutral`.
14. Use `insufficient_evidence` if evidence is weak or source quality is poor, including missing valuation, CEO, insider transaction, or buyback evidence that materially blocks the call.
15. Update `signal.json`, `decision-brief.md`, and `summary.html`; the summary must include a historical trend and prior-call reflection section.
16. Run `npm run build:index` so root `index.html` can list updated summaries through ignored `index-data.js`.

## Output checklist

- Signal and confidence are justified by evidence.
- The bottom line is understandable without a finance background.
- The money-making path and money-losing path are explicit.
- Valuation classification, model fit, margin of safety, and cheap-trap checks are explicit.
- CEO/leadership classification is supported by sourced facts, not reputation alone, and answers the prior-track-record, management-style, and current-goal questions.
- Insider transaction and buyback conclusions are explicit, including whether activity supports, weakens, or does not change the thesis.
- Prior-thesis accuracy is scored, with what was right, what was wrong, why, and what changed in this run.
- The summary includes historical signal/price/valuation trend and prior-call reflection.
- No unsupported claims remain.
- Missing information is explicit.
- Watch items are actionable for the next run.
- Research-only disclaimer is included.
