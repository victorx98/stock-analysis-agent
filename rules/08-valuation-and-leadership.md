# Valuation and Leadership Rules

## Purpose

Every run must answer two practical questions before choosing a signal:

1. Is the stock materially undervalued relative to a conservative estimate of business value?
2. Does the CEO increase or reduce confidence that the company can close the value gap?

The framework should prioritize stocks that appear severely undervalued, but it must avoid cheap-trap conclusions. A low price, low multiple, or large drawdown is not enough by itself.

## Business classification first

Before choosing a valuation model, classify the company using available evidence:

- sector and industry
- business type, such as software, bank, insurer, REIT, commodity producer, biotech, consumer brand, retailer, marketplace, industrial, utility, asset manager, holding company, or turnaround
- lifecycle stage, such as pre-revenue, high-growth unprofitable, scaling toward profitability, mature compounder, cyclical, distressed, or liquidation/NAV case
- revenue quality, such as recurring, transactional, project-based, commodity-linked, regulated, or one-time
- capital intensity and balance sheet risk
- profitability and free cash flow profile

If classification is ambiguous, apply multiple plausible valuation model families and show the range instead of forcing one model.

## Model selection guide

Use the model family that matches the business economics:

- Stable profitable companies: owner earnings or free cash flow DCF, P/E, EV/EBIT, EV/EBITDA, historical multiples, and peer multiples.
- High-growth software or subscription companies: EV/revenue, EV/gross profit, rule-of-40 context, net retention if available, path to free cash flow, and scenario DCF.
- Banks and lenders: P/TBV, P/B, ROE or ROTE, net interest margin, credit losses, deposit stability, regulatory capital, and tangible book growth.
- Insurers: P/B, ROE, underwriting profitability, combined ratio, reserve adequacy, investment portfolio risk, and capital return capacity.
- REITs and real estate operating companies: P/FFO, P/AFFO, dividend coverage, debt maturities, cap rates, occupancy, same-property NOI, and NAV.
- Commodity producers: NAV or DCF using conservative commodity prices, EV/reserves or EV/production, cost curve position, hedge book, and balance sheet durability.
- Industrial and cyclical companies: mid-cycle earnings, normalized EV/EBITDA, replacement value, backlog, operating leverage, and cycle position.
- Consumer brands and retailers: P/E, EV/EBITDA, same-store sales, unit economics, inventory quality, brand strength, margins, and cash conversion.
- Marketplaces and platforms: EV/gross profit, take rate, GMV quality, cohort economics, network effects, and path to operating leverage.
- Biotech, clinical-stage, and pre-revenue companies: cash runway, dilution risk, probability-weighted rNPV, milestone scenarios, and regulatory/clinical risk. Do not call these cheap based on revenue or earnings multiples that do not apply.
- Holding companies, asset managers, and conglomerates: sum-of-the-parts, NAV discount/premium, fee-related earnings where relevant, capital allocation record, and ownership structure.
- Distressed or turnaround companies: liquidation value, debt maturity wall, covenant risk, cash burn, refinancing probability, and dilution scenarios.

## Required valuation output

`valuation-analysis.md` must include:

1. Business classification and why it matters for valuation.
2. Current price and market value inputs used, with date.
3. Valuation model(s) selected and why each is appropriate.
4. Key assumptions, including revenue growth, margin, cash flow, discount rate or required return, normalized earnings, peer set, and terminal multiple where applicable.
5. Bear, base, and bull value ranges, or an explanation of why ranges cannot be estimated.
6. Margin of safety versus current price.
7. Classification: `severely_undervalued`, `moderately_undervalued`, `fairly_valued`, `overvalued`, or `valuation_uncertain`.
8. Cheap-trap checks, including balance sheet pressure, structural decline, dilution risk, governance risk, and missing catalysts.
9. Evidence that could close the valuation gap.

Use conservative assumptions for the base case. A stock should normally require at least roughly 35% upside to a conservative base-case value, plus survivability and identifiable catalysts, before being called `severely_undervalued`. If upside depends only on aggressive assumptions, classify it lower or mark it uncertain.

## Valuation discipline

- Do not mix mismatched peer groups without explaining why.
- Do not use peak margins or peak-cycle earnings as the base case for cyclical companies.
- Do not value banks, insurers, REITs, commodity producers, or pre-revenue biotech companies with generic P/E or EV/revenue shortcuts unless clearly labeled as supplemental.
- Do not call a stock undervalued when the balance sheet can force dilution or distress before the thesis has time to work.
- Treat valuation as a range, not a point estimate.
- Separate `cheap because misunderstood` from `cheap because the business is deteriorating`.

## CEO and leadership review

Every run must assess the current CEO or equivalent top operator. Use sourced evidence, not reputation or personality guesses.

`leadership-analysis.md` must include:

1. CEO name, role start date, and whether the CEO is a founder or co-founder.
2. Ownership and incentive alignment if available from proxy filings or insider ownership data.
3. Career background before becoming CEO, including roles, operating domains, technical expertise, capital allocation experience, and prior successes or failures.
4. Observable management style and execution pattern, supported by actions such as product cadence, cost discipline, M&A, capital returns, hiring, restructuring, or crisis response.
5. Whether recent letters, earnings calls, interviews, filings, or investor presentations show a clear diagnosis of the company's current situation.
6. Any unique advantage the CEO may bring, such as founder vision, domain expertise, customer credibility, engineering depth, regulatory experience, turnaround skill, or capital allocation discipline.
7. Red flags, including vague strategy, repeated missed targets, promotional communication, poor capital allocation, governance concerns, excessive compensation, insider selling without context, or high executive turnover.
8. Leadership classification: `leadership_edge`, `adequate_leadership`, `leadership_risk`, or `leadership_unknown`.

Founder-led status is evidence, not a conclusion. A founder CEO can be a major advantage when ownership, product insight, and execution are strong. It can also be a risk when governance is weak, succession planning is poor, or strategy is unclear.

## Evidence sources for CEO analysis

Prefer:

- DEF 14A proxy statements for biography, ownership, compensation, and governance.
- 10-K and 10-Q discussion for strategy, risk, and operating priorities.
- Company investor relations pages, shareholder letters, and earnings call transcripts.
- Material 8-K filings for CEO changes, employment agreements, restructuring plans, or major strategic shifts.
- Reputable long-form profiles or interviews only as secondary context.

Do not use social-media impressions or unsourced biographical claims as decision-grade evidence.

## Signal implications

Valuation and leadership must influence the final signal:

- `strong_buy_watch` normally requires severe or clear moderate undervaluation, a credible path to close the gap, and no major leadership red flag.
- `buy_watch` can be used when valuation is attractive but some uncertainty remains, or when business quality and CEO execution plausibly justify the current valuation with upside.
- `hold_neutral` is appropriate when valuation is unclear or fair and no strong catalyst exists.
- `sell_watch` or `strong_sell_watch` is appropriate when the stock is expensive relative to realistic outcomes, or when leadership and governance risks undermine the thesis.
- `insufficient_evidence` is appropriate when current price, financial inputs, or CEO evidence are too weak to support a valuation or leadership judgment.
