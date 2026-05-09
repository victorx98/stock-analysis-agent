---
name: investment-thesis-synthesis
description: Synthesize a complete stock research decision brief from SEC filings, trusted news, market trends, prior summaries, and risks. Use at the end of each ticker run to produce signal.json, decision-brief.md, and the updated summary.html watchlist.
---

# Investment Thesis Synthesis

## Procedure

1. Read all rule files listed in root `AGENTS.md`.
2. Read the prior `stocks/<TICKER>/summary.html`.
3. Read current run artifacts.
4. Build an evidence table before choosing a signal.
5. Complete `valuation-analysis.md`: classify the business, choose appropriate valuation model(s), estimate bear/base/bull value ranges where possible, judge margin of safety, and run cheap-trap checks.
6. Complete `leadership-analysis.md`: identify the CEO, founder status, pre-CEO background, execution pattern, strategic clarity, unique advantages, and leadership risks.
7. Start the summary with a plain-English bottom line for a non-financial reader.
8. Explain how the stock can make money, how it can lose money, and what must happen next.
9. Include bull case, bear case, risks, contrary evidence, and invalidation triggers.
10. Use a directional signal when the evidence supports a clear risk/reward skew; do not default to `hold_neutral`.
11. Use `insufficient_evidence` if evidence is weak or source quality is poor, including missing valuation or CEO evidence that materially blocks the call.
12. Update `signal.json`, `decision-brief.md`, and `summary.html`.
13. Run `npm run build:index` so root `index.html` can list updated summaries through ignored `index-data.js`.

## Output checklist

- Signal and confidence are justified by evidence.
- The bottom line is understandable without a finance background.
- The money-making path and money-losing path are explicit.
- Valuation classification, model fit, margin of safety, and cheap-trap checks are explicit.
- CEO/leadership classification is supported by sourced facts, not reputation alone.
- No unsupported claims remain.
- Missing information is explicit.
- Watch items are actionable for the next run.
- Research-only disclaimer is included.
