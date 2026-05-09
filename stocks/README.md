# Stocks Directory

Create one folder per ticker, using the uppercase stock ticker as the folder name.

Example:

```text
stocks/AAPL/
├── index.html
├── profile.json
├── summary.html
├── data/
│   ├── raw/
│   │   ├── sec/
│   │   ├── news/
│   │   └── market/
│   └── processed/
└── runs/
    └── 2026-05-09/
```

Each run folder should include valuation, leadership, and prior-thesis review artifacts in addition to the SEC, news, market, risk, signal, and decision brief files. `valuation-analysis.md` records the model family used for the company's industry/business type and whether the current price is cheap enough. `leadership-analysis.md` records CEO background, founder status, strategic clarity, execution evidence, and leadership risks. `thesis-review.md` scores whether earlier judgments were accurate, inaccurate, early, late, or still untested, and records lessons for the current run.

Use `_TEMPLATE/` only as the source for new ticker folders. Do not write real analysis into `_TEMPLATE/`.

Run `npm run build:index` from the repository root after adding or updating ticker summaries or run artifacts. The command creates ignored `index-data.js` directory data for the root `index.html` page and ignored `stocks/<TICKER>/index.html` pages for ticker-level run indexes.
