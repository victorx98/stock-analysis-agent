---
name: sec-filings-review
description: Review SEC filings for a stock analysis run. Use when analyzing 10-K, 10-Q, 8-K, DEF 14A, S-1, S-3, 424B, Forms 3/4/5, 13D, or 13G artifacts, extracting material changes, risk factor updates, financial health signals, dilution, governance, filing-based watch items, and overlooked filing clues for edge hypotheses.
---

# SEC Filings Review

## Procedure

1. Read `rules/03-sec-filings-analysis.md` before summarizing filings.
2. Build a filing timeline from raw SEC submission data.
3. Prioritize 10-K, 10-Q, 8-K, proxy, offering, and ownership filings.
4. Extract material changes that affect revenue, margin, liquidity, dilution, legal/regulatory risk, governance, valuation, CEO incentives, ownership alignment, insider trading activity, company buybacks, or guidance.
5. Compare against the prior run summary when available.
6. Run an edge extraction pass for overlooked footnotes, contract terms, risk-factor wording shifts, hidden dilution mechanics, customer/supplier dependencies, and segment clues.
7. Write standard findings to `sec-filings.md` using facts first and interpretations second.
8. Write filing-based edge hypotheses, verification attempts, and disproved ideas to `edge-lab.md`.

## Output checklist

- Filing inventory with dates and accession numbers.
- Material positives.
- Material negatives.
- Neutral but important changes.
- CEO, proxy, compensation, ownership, and governance observations when available.
- Recent management-team stock purchases/sales, with transaction context when available.
- Company buyback authorization, execution, and share-count effect when available.
- Filing-based edge hypotheses and disconfirming evidence.
- Open questions for the next run.
- Source paths or SEC URLs for each important claim.
