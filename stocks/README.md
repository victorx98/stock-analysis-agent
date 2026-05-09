# Stocks Directory

Create one folder per ticker, using the uppercase stock ticker as the folder name.

Example:

```text
stocks/AAPL/
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

Use `_TEMPLATE/` only as the source for new ticker folders. Do not write real analysis into `_TEMPLATE/`.

Run `npm run build:index` from the repository root after adding or updating ticker summaries. The command creates ignored `index-data.js` directory data for the root `index.html` page.
