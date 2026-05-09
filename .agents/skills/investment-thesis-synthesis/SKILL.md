---
name: investment-thesis-synthesis
description: Synthesize a complete stock research decision brief from SEC filings, trusted news, market trends, prior summaries, and risks. Use at the end of each ticker run to produce signal.json, decision-brief.md, and the updated summary.md watchlist.
---

# Investment Thesis Synthesis

## Procedure

1. Read all rule files listed in root `AGENTS.md`.
2. Read the prior `stocks/<TICKER>/summary.md`.
3. Read current run artifacts.
4. Build an evidence table before choosing a signal.
5. Include bull case, bear case, risks, contrary evidence, and invalidation triggers.
6. Use `insufficient_evidence` if evidence is weak or source quality is poor.
7. Update `signal.json`, `decision-brief.md`, and `summary.md`.

## Output checklist

- Signal and confidence are justified by evidence.
- No unsupported claims remain.
- Missing information is explicit.
- Watch items are actionable for the next run.
- Research-only disclaimer is included.
