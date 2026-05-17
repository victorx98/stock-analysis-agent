# SEC Filings Analysis Rules

## Priority filing types

Review these first when available:

- `10-K`: annual business, risk factors, audited financials.
- `10-Q`: quarterly operating and financial update.
- `8-K`: material events.
- `DEF 14A`: governance, executive compensation, voting matters.
- `S-1`, `S-3`, `424B`: securities offerings and dilution risk.
- `SC 13D`, `SC 13G`, Forms `3`, `4`, and `5`: ownership and insider activity context.

## Edge extraction pass

After the standard filing review, run a second pass asking what a normal summary might miss:

- footnote changes that alter economics without changing headline revenue or EPS
- unusual contract terms, penalties, minimum commitments, or customer concentration clues
- dilution mechanics hidden in warrants, convertibles, ATM programs, earnouts, stock compensation, or preferred shares
- risk-factor wording that became more specific, more urgent, or quietly disappeared
- related-party, customer, supplier, geographic, or regulatory dependencies that could create a variant view
- segment disclosures where a small line item could become material or where a large segment is masking deterioration

Any such idea belongs in `edge-lab.md` until verified or disproved.

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
- recent management-team stock sales and purchases, including whether they are open-market transactions, option exercises, tax withholding, planned sales, gifts, or grants
- share count, dilution, buybacks, buyback authorizations, buyback execution, dividends

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
6. Insider transaction and company buyback signals when available.
7. Filing-based edge hypotheses or disproved edge ideas.
8. Open questions for the next run.
