# Output Standards

## Final decision brief structure

Every `decision-brief.md` must use this structure:

```markdown
# <TICKER> Decision Brief - <RUN_DATE>

## Executive summary

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

Every `stocks/<TICKER>/summary.md` must use this structure:

```markdown
# <TICKER> Latest Research Summary

Last updated: <RUN_DATE>

## Current view

## Current signal

## Thesis snapshot

## What changed in the latest run

## Key evidence

## Key risks

## Watch next run

## Prior run links
```

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
  "supportingEvidence": [],
  "contraryEvidence": [],
  "invalidationTriggers": [],
  "watchNextRun": [],
  "missingInformation": []
}
```
