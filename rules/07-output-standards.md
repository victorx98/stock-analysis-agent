# Output Standards

## Final decision brief structure

Every `decision-brief.md` must use this structure:

```markdown
# <TICKER> Decision Brief - <RUN_DATE>

## Executive summary

## Plain-English bottom line

## How this can make money

## How this can lose money

## Current signal
- Signal:
- Time horizon:
- Confidence:
- Prior signal:
- Change since prior run:

## Evidence table
| Claim | Evidence | Source tier | Bull/Bear/Neutral | Confidence |

## SEC filing takeaways

## News and catalyst takeaways

## Valuation takeaways

## CEO and leadership takeaways

## Market trend takeaways

## Bull case

## Bear case

## Key risks

## Invalidation triggers

## What to watch next run

## Missing information

## Research-only disclaimer
```

## Summary file structure

Every `stocks/<TICKER>/summary.html` must be a complete standalone HTML document that can be opened directly in a browser. It may include inline CSS, semantic tables, inline SVG diagrams, scorecards, and other static visual elements. Do not depend on external JavaScript, CSS CDNs, remote images, or paywalled content.

The top-level `<main>` element must include these metadata attributes:

```html
<main data-ticker="<TICKER>" data-company="<Company Name>" data-last-updated="<RUN_DATE>">
```

The page must include these visible sections:

```text
<TICKER> Research Summary
Last updated: <RUN_DATE>

Current View
Plain-English Bottom Line
Current Signal
Thesis Snapshot
How This Can Make Money
How This Can Lose Money
Key Numbers In Plain English
What Changed In The Latest Run
Key Evidence
Valuation: Is This Cheap Enough?
CEO / Leadership Read
Key Risks
Watch Next Run
Finance Terms Used
Prior Run Links
Research-Only Disclaimer
```

Use tables for evidence, risks, valuation context, and signal data when they improve readability. Use diagrams only when they clarify thesis mechanics, catalyst timelines, risk maps, or financial trend relationships.

Write for a non-financial reader:

- Start with the practical money question, not accounting detail.
- Use short sentences and concrete labels such as "good for the stock", "bad for the stock", and "needs confirmation".
- Explain why each key number matters.
- Avoid unexplained terms like EBITDA, gross margin, dilution, free cash flow, multiple, or guidance.
- If a term is necessary, add it to "Finance Terms Used" with a one-sentence explanation.
- Be decisive when evidence supports it. Do not use `hold_neutral` as a default.

## Root summary index

The root `index.html` is the local directory page for stock summaries. It should stay framework-only and should not hard-code real ticker data. Run:

```bash
npm run build:index
```

to generate the ignored `index-data.js` file from local `stocks/<TICKER>/summary.html` files.

## JSON signal schema

Every `signal.json` must include:

```json
{
  "ticker": "AAPL",
  "runDate": "2026-05-09",
  "signal": "hold_neutral",
  "timeHorizon": "6-12 months",
  "confidence": "medium",
  "summary": "One-paragraph summary.",
  "bottomLine": "Plain-English money-making conclusion.",
  "moneyMakingPath": [],
  "moneyLosingPath": [],
  "valuationAssessment": {
    "classification": "valuation_uncertain",
    "businessType": "",
    "modelsUsed": [],
    "marginOfSafety": "",
    "summary": "",
    "cheapTrapChecks": []
  },
  "leadershipAssessment": {
    "classification": "leadership_unknown",
    "ceoName": "",
    "founderStatus": "",
    "summary": "",
    "strengths": [],
    "risks": []
  },
  "nextEvidenceNeeded": [],
  "supportingEvidence": [],
  "contraryEvidence": [],
  "invalidationTriggers": [],
  "watchNextRun": [],
  "missingInformation": [],
  "plainEnglishDefinitions": {}
}
```
