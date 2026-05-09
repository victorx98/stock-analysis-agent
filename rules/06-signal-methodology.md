# Signal Methodology

## Allowed labels

Use only these labels:

- `strong_buy_watch`
- `buy_watch`
- `hold_neutral`
- `sell_watch`
- `strong_sell_watch`
- `insufficient_evidence`

## Signal inputs

Consider these dimensions:

1. Fundamental direction: revenue, margins, cash flow, balance sheet.
2. Valuation context: multiple expansion/contraction risk, relative valuation if available.
3. SEC filing changes: risk factors, liquidity, management discussion, dilution.
4. Catalysts: events likely to change expectations.
5. Market trend: price/momentum confirmation or contradiction.
6. Risk/reward: upside drivers vs downside scenarios.
7. Prior thesis: whether new evidence confirms or weakens the previous view.

## Minimum evidence rules

Do not issue directional signals unless:

- at least one primary source was reviewed, or the lack of primary data is explicitly justified;
- at least three independent evidence items support the conclusion;
- contrary evidence is included;
- invalidation triggers are stated;
- the time horizon is clear.

Use `insufficient_evidence` when data quality is too weak.

## Confidence

Use:

- `low`: limited data, mixed evidence, or high uncertainty.
- `medium`: multiple aligned sources but meaningful uncertainty remains.
- `high`: strong primary evidence, consistent trend, and clear invalidation triggers.

Avoid `high` confidence for event-driven or highly volatile stocks unless evidence is unusually strong.
