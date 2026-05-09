# SEC Filings Analysis Rules

## Priority filing types

Review these first when available:

- `10-K`: annual business, risk factors, audited financials.
- `10-Q`: quarterly operating and financial update.
- `8-K`: material events.
- `DEF 14A`: governance, executive compensation, voting matters.
- `S-1`, `S-3`, `424B`: securities offerings and dilution risk.
- `SC 13D`, `SC 13G`, `Form 4`: ownership and insider activity context.

## What to extract

For each material filing:

- filing type
- filing date
- period covered
- accession number
- key changes vs prior comparable filing
- revenue, margin, cash flow, debt, liquidity, and capex signals if available
- risk factor changes
- legal/regulatory updates
- management tone and guidance changes
- CEO or executive changes, founder status if disclosed, compensation incentives, ownership alignment, and governance signals
- share count, dilution, buybacks, dividends

## Change detection

When prior filing text is available, compare:

- risk factor wording changes
- MD&A changes
- segment performance changes
- liquidity and debt language
- management's stated diagnosis of company problems and priorities
- going concern or impairment language
- customer concentration changes
- geographic, supply chain, or regulatory exposure

## Output expectations

Update `sec-filings.md` with:

1. SEC source inventory.
2. Filing timeline.
3. Material new information.
4. Deterioration/improvement signals.
5. CEO, governance, incentive, and management clarity signals when available.
6. Open questions for the next run.
