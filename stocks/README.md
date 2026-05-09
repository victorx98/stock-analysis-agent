# Stocks Directory

Create one folder per ticker, using the uppercase stock ticker as the folder name.

Example:

```text
stocks/AAPL/
├── profile.json
├── summary.md
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
