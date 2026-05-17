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

## Prior thesis review

## Collection and Tooling Notes

## Evidence table
| Claim | Evidence | Source tier | Bull/Bear/Neutral | Confidence |

## Edge Lab Summary

## SEC filing takeaways

## News and catalyst takeaways

## Valuation takeaways

## CEO and leadership takeaways

## Insider and buyback takeaways

## Market trend takeaways

## Bull case

## Bear case

## Key risks

## Invalidation triggers

## What to watch next run

## Missing information

## Research-only disclaimer
```

The "CEO and leadership takeaways" section must briefly answer:

- What the CEO's prior success and failure stories suggest about current execution quality.
- What observable personality or management style may influence the company, with source-backed evidence.
- What the CEO appears to be trying to accomplish at the current company and whether that goal is aligned with shareholders.

The "Insider and buyback takeaways" section must briefly answer:

- Whether recent management-team stock purchases or sales support, weaken, or do not change the thesis.
- Whether company stock buybacks are actually shrinking share count or mainly offsetting dilution.
- Whether repurchases look sensible given valuation, balance sheet risk, and reinvestment needs.

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
Historical Trend And Prior Call Review
Key Evidence
Edge Lab: What Public Analysis May Miss
Valuation: Is This Cheap Enough?
CEO / Leadership Read
Insider / Buyback Activity
Key Risks
Watch Next Run
Finance Terms Used
Collection and Tooling Notes
Prior Run Links
Research-Only Disclaimer
```

Use tables for evidence, risks, valuation context, and signal data when they improve readability. Use diagrams only when they clarify thesis mechanics, catalyst timelines, risk maps, or financial trend relationships.

The "Historical Trend And Prior Call Review" section must summarize signal history, price or technical trend history, valuation classification history, key thesis changes, prior-call accuracy, and lessons learned. Use a table where possible and avoid scoring a prior call from short-term price movement alone.

The "CEO / Leadership Read" section must include the CEO's prior-track-record lesson, observable management style, main current-company goal, leadership classification, and main edge or risk.

The "Insider / Buyback Activity" section must summarize recent management-team purchases/sales, buyback authorization and execution, share-count effect, and thesis impact.

The "Edge Lab: What Public Analysis May Miss" section must summarize the consensus view, the strongest variant hypothesis, its verification status, disconfirming evidence, and whether it changed the signal, confidence, or watchlist.

Write for a non-financial reader:

- Start with the practical money question, not accounting detail.
- Use short sentences and concrete labels such as "good for the stock", "bad for the stock", and "needs confirmation".
- Explain why each key number matters.
- Avoid unexplained terms like EBITDA, gross margin, dilution, free cash flow, multiple, or guidance.
- If a term is necessary, add it to "Finance Terms Used" with a one-sentence explanation.
- Be decisive when evidence supports it. Do not use `hold_neutral` as a default.

The "Collection and Tooling Notes" section must briefly state which source/tool gaps matter to the conclusion. Keep full diagnostic detail in `run-metadata.json` and `source-inventory.md`; summarize only material collection failures, skipped sources, or fallback data sources in the reader-facing output.

## Root and stock index pages

The root `index.html` is the local directory page for stock-level indexes. It should stay framework-only and should not hard-code real ticker data. Each row must link to `stocks/<TICKER>/index.html` and show that ticker's latest important conclusion.

Each generated `stocks/<TICKER>/index.html` page must list that ticker's analysis runs with:

- run date
- signal and confidence
- price or trend label when available
- valuation classification when available
- important conclusion
- link to the run's `decision-brief.md`

Run:

```bash
npm run build:index
```

to generate the ignored `index-data.js` file and ignored `stocks/<TICKER>/index.html` pages from local stock artifacts.

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
  "priorThesisReview": {
    "priorSignal": "",
    "priorRunDate": "",
    "accuracy": "baseline_no_prior_call",
    "whatWasRight": [],
    "whatWasWrong": [],
    "why": "",
    "lessonApplied": ""
  },
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
    "priorTrackRecord": {
      "successes": [],
      "failures": [],
      "pattern": "",
      "implicationForCurrentCompany": ""
    },
    "managementStyle": {
      "style": "",
      "evidence": [],
      "likelyImpact": ""
    },
    "currentCompanyGoal": {
      "statedGoal": "",
      "evidence": [],
      "shareholderAlignment": "",
      "riskIfWrong": ""
    },
    "strengths": [],
    "risks": []
  },
  "insiderAndBuybackAssessment": {
    "reviewWindow": "",
    "managementTransactions": {
      "summary": "",
      "purchases": [],
      "sales": [],
      "notableContext": []
    },
    "buybackProgram": {
      "authorization": "",
      "recentExecution": "",
      "shareCountEffect": "",
      "capitalAllocationAssessment": ""
    },
    "thesisImpact": "unknown",
    "missingInformation": []
  },
  "edgeAssessment": {
    "consensusView": "",
    "highestConvictionVariantView": "",
    "edgeStatus": "none_found",
    "signalInfluence": "none",
    "contrarianTheses": []
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
