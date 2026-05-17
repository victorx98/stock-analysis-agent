---
name: technical-trend-review
description: Analyze stock price trend metrics for long-term equity research. Use when reviewing daily prices, moving averages, RSI, returns, drawdowns, momentum confirmation, or market trend artifacts produced by the Node.js market tools.
---

# Technical Trend Review

## Procedure

1. Read `rules/05-market-trend-analysis.md`.
2. Inspect `market-trend.md` and raw/processed market data.
3. Verify whether enough history exists for 20/50/200-day moving averages and RSI.
4. Assign one trend label from the allowed list.
5. Explain whether technicals confirm, contradict, or are neutral to the fundamental thesis.
6. Identify perception mismatches where price action may reveal a narrative outrunning evidence or fundamentals the market has not noticed.
7. Carry plausible perception mismatch ideas into `edge-lab.md` as hypotheses, not proof.

## Output checklist

- Latest price date and close.
- SMA and RSI metrics.
- Return windows.
- Trend label.
- Momentum interpretation.
- Contradictory signals.
- Perception mismatch ideas to test in `edge-lab.md`.
