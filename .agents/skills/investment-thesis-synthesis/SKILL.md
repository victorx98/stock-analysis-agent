---
name: investment-thesis-synthesis
description: Synthesize a complete stock research decision brief from SEC filings, trusted news, market trends, prior summaries, and risks. Use at the end of each ticker run to produce signal.json, decision-brief.md, and the updated summary.html watchlist.
---

# Investment Thesis Synthesis

## Procedure

1. Read all rule files listed in root `AGENTS.md`.
2. Read the prior `stocks/<TICKER>/summary.html`.
3. Read prior run artifacts, especially `signal.json`, `decision-brief.md`, `valuation-analysis.md`, `market-trend.md`, `risk-register.md`, and `watchlist-next-run.md`.
4. Complete `thesis-review.md`: score prior judgment accuracy, explain what was right or wrong, and state the lesson applied in this run. If this is the first run, mark it `baseline_no_prior_call`.
5. Read current run artifacts.
6. Build an evidence table before choosing a signal.
7. Complete `valuation-analysis.md`: classify the business, choose appropriate valuation model(s), estimate bear/base/bull value ranges where possible, judge margin of safety, and run cheap-trap checks.
8. Complete `leadership-analysis.md`: identify the CEO, founder status, pre-CEO background, execution pattern, strategic clarity, unique advantages, and leadership risks.
9. Start the summary with a plain-English bottom line for a non-financial reader.
10. Explain how the stock can make money, how it can lose money, and what must happen next.
11. Include bull case, bear case, risks, contrary evidence, invalidation triggers, and prior-thesis review.
12. Use a directional signal when the evidence supports a clear risk/reward skew; do not default to `hold_neutral`.
13. Use `insufficient_evidence` if evidence is weak or source quality is poor, including missing valuation or CEO evidence that materially blocks the call.
14. Update `signal.json`, `decision-brief.md`, and `summary.html`; the summary must include a historical trend and prior-call reflection section.
15. Run `npm run build:index` so root `index.html` can list updated summaries through ignored `index-data.js`.

## Output checklist

- Signal and confidence are justified by evidence.
- The bottom line is understandable without a finance background.
- The money-making path and money-losing path are explicit.
- Valuation classification, model fit, margin of safety, and cheap-trap checks are explicit.
- CEO/leadership classification is supported by sourced facts, not reputation alone.
- Prior-thesis accuracy is scored, with what was right, what was wrong, why, and what changed in this run.
- The summary includes historical signal/price/valuation trend and prior-call reflection.
- No unsupported claims remain.
- Missing information is explicit.
- Watch items are actionable for the next run.
- Research-only disclaimer is included.
