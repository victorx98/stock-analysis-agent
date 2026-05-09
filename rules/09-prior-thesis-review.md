# Prior Thesis Review Rules

## Purpose

Every new ticker run must inspect prior analysis before making a new call. The goal is not to defend old conclusions. The goal is to improve future decisions by checking whether earlier signals, valuation ranges, risks, catalysts, and watch items matched what later happened.

## Required inputs

Before synthesis, review available prior artifacts in this order:

1. `stocks/<TICKER>/summary.html`
2. Prior `stocks/<TICKER>/runs/<PRIOR_RUN>/signal.json`
3. Prior `stocks/<TICKER>/runs/<PRIOR_RUN>/decision-brief.md`
4. Prior `stocks/<TICKER>/runs/<PRIOR_RUN>/valuation-analysis.md`
5. Prior `stocks/<TICKER>/runs/<PRIOR_RUN>/market-trend.md`
6. Prior `stocks/<TICKER>/runs/<PRIOR_RUN>/watchlist-next-run.md`
7. Prior `stocks/<TICKER>/runs/<PRIOR_RUN>/risk-register.md`

If no prior run exists, mark the review as `baseline_no_prior_call`.

## Accuracy labels

Use one of these labels for prior-call accuracy:

- `accurate`: prior thesis direction and key risks matched subsequent evidence.
- `partly_accurate`: prior thesis had useful direction but missed material details or timing.
- `inaccurate`: prior thesis direction was wrong or key assumptions failed.
- `too_early`: prior thesis may still be valid but expected confirmation has not arrived.
- `too_late`: prior thesis recognized evidence only after much of the move or deterioration happened.
- `still_untested`: not enough time or evidence has passed to judge.
- `baseline_no_prior_call`: first run or no usable prior artifacts.

## What to score

Evaluate at least:

- prior signal direction and confidence
- price change since the prior run and whether it matched the thesis
- valuation range versus current price and newly available fundamentals
- whether prior invalidation triggers fired
- whether prior watch items were answered
- whether prior risk weighting was too low, too high, or appropriate
- whether the prior model choice was appropriate for the business type
- whether management/CEO assessment held up

Do not score a prior call only by short-term price movement. A stock can move against a thesis for noise reasons. Explain whether price movement confirmed fundamentals, contradicted fundamentals, or remains inconclusive.

## Required output

`thesis-review.md` must include:

1. Prior artifact inventory.
2. Prior signal, confidence, valuation classification, and key watch items.
3. Current evidence used to judge the prior call.
4. Accuracy label.
5. What the prior analysis got right.
6. What the prior analysis got wrong or missed.
7. Why it was wrong, early, late, or still untested.
8. Lesson applied in the current run.
9. Changes to model weighting, risk weighting, confidence, or watch items.

## Summary requirement

The new `summary.html` must include a visible historical trend and prior-call review section. It should summarize:

- run dates
- signal history
- price trend history
- valuation classification history
- key thesis changes
- prior-call accuracy and lessons learned

Use a table where possible. If there is enough data, include a simple static trend visualization or scorecard. Keep it plain-English and avoid implying precision that the data does not support.
