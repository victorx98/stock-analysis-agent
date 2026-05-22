---
name: investment-thesis-synthesis
description: Synthesize a complete stock research decision brief from SEC filings, trusted news, market trends, prior summaries, and risks. Use at the end of each ticker run to produce signal.json, decision-brief.md, and the updated summary.html watchlist.
---

# Investment Thesis Synthesis

## Procedure

1. Read all rule files listed in root `AGENTS.md`.
2. Read the prior `stocks/<TICKER>/summary.html`.
3. Read prior run artifacts, especially `signal.json`, `decision-brief.md`, `valuation-analysis.md`, `insider-and-buybacks.md`, `market-trend.md`, `risk-register.md`, and `watchlist-next-run.md`.
4. Read prior `edge-lab.md` when available and score whether prior edge hypotheses were verified, disproved, too early, too late, or noise.
5. Complete `thesis-review.md`: score prior judgment accuracy, explain what was right or wrong, and state the lesson applied in this run. If this is the first run, mark it `baseline_no_prior_call`.
6. Read current run artifacts, including `edge-lab.md`.
7. Build an evidence table before choosing a signal.
8. Complete `valuation-analysis.md`: classify the business, choose appropriate valuation model(s), estimate bear/base/bull value ranges where possible, judge margin of safety, and run cheap-trap checks.
9. Complete `leadership-analysis.md`: identify the CEO, founder status, pre-CEO background, prior success and failure patterns, observable management style, current-company goal, execution pattern, strategic clarity, unique advantages, and leadership risks.
10. Complete `insider-and-buybacks.md`: review recent management-team stock purchases/sales, distinguish transaction types, check buyback authorization and execution, and judge share-count effect.
11. Complete `edge-lab.md`: state the consensus view, top variant hypotheses, verification attempts, disconfirming evidence, and signal impact.
12. Start the summary with a plain-English bottom line for a non-financial reader.
13. Explain how the stock can make money, how it can lose money, and what must happen next.
14. Include bull case, bear case, risks, contrary evidence, invalidation triggers, prior-thesis review, and edge-lab summary.
15. Use a directional signal when the evidence supports a clear risk/reward skew; do not default to `hold_neutral`.
16. Use `insufficient_evidence` if evidence is weak or source quality is poor, including missing valuation, CEO, insider transaction, buyback, or edge-gating evidence that materially blocks the call.
17. Update `signal.json`, `decision-brief.md`, and `summary.html`; the summary must use the canonical `stocks/_TEMPLATE/summary.html` style and include a historical trend, prior-call reflection, edge-lab section, and end-of-report source appendix.
18. Run `npm run build:index` so root `index.html` can list updated summaries through ignored `index-data.js`.

## Output checklist

- Signal and confidence are justified by evidence.
- The bottom line is understandable without a finance background.
- The money-making path and money-losing path are explicit.
- Valuation classification, model fit, margin of safety, and cheap-trap checks are explicit.
- CEO/leadership classification is supported by sourced facts, not reputation alone, and answers the prior-track-record, management-style, and current-goal questions.
- Insider transaction and buyback conclusions are explicit, including whether activity supports, weakens, or does not change the thesis.
- Prior-thesis accuracy is scored, with what was right, what was wrong, why, and what changed in this run.
- Edge assessment is explicit, including consensus view, strongest variant view, verification status, disconfirming evidence, and signal influence.
- The summary includes historical signal/price/valuation trend and prior-call reflection.
- `decision-brief.md` and `summary.html` include a Source Appendix listing inspected SEC filing names or local files, news links, company materials, market data files or provider URLs, broad-lead sources, and material source gaps.
- `summary.html` preserves the canonical summary template style unless the template itself was intentionally updated.
- No unsupported claims remain.
- Missing information is explicit.
- Watch items are actionable for the next run.
- Research-only disclaimer is included.
