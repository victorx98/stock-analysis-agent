# Market Trend Analysis Rules

## Technical metrics

Use these default metrics when enough price history exists:

- latest close
- 20-day simple moving average
- 50-day simple moving average
- 200-day simple moving average
- 1-month return
- 3-month return
- 6-month return
- 12-month return
- 14-day RSI
- drawdown from 52-week high

## Trend interpretation

Use cautious, evidence-based labels:

- `uptrend`: latest close above key moving averages and medium/long returns positive.
- `weak_uptrend`: mixed but improving trend metrics.
- `sideways`: no clear directional trend.
- `weak_downtrend`: mixed but deteriorating trend metrics.
- `downtrend`: latest close below key moving averages and medium/long returns negative.
- `insufficient_data`: not enough data.

## Do not overfit

Technical signals are supporting evidence, not the whole thesis. Never issue a buy/sell signal from price action alone unless the task is explicitly technical-only.

## Perception mismatch checks

Use technicals to identify possible market-perception gaps:

- price strength without fundamental proof, which may mean narrative is outrunning evidence
- fundamental improvement without price confirmation, which may mean the market has not noticed
- high short interest or extreme momentum when available, which may indicate crowded positioning
- trend changes around obscure filings, product data, customer clues, or policy events that normal news coverage may have missed

Carry plausible perception gaps into `edge-lab.md`; do not treat the chart itself as proof.

## Output expectations

Update `market-trend.md` with:

1. Latest price and date.
2. Metric table.
3. Trend label.
4. Momentum interpretation.
5. Supportive and contradictory technical evidence.
6. Perception mismatch ideas to test in `edge-lab.md`.
