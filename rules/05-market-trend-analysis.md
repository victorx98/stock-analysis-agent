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

## Output expectations

Update `market-trend.md` with:

1. Latest price and date.
2. Metric table.
3. Trend label.
4. Momentum interpretation.
5. Supportive and contradictory technical evidence.
