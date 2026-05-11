# Long-Term Stock Analysis Codex Framework

This repository is a Codex-ready framework for repeatable long-term stock analysis. It is designed to continuously collect SEC filings, trusted news, market trend data, and prior run artifacts, then guide Codex through a structured analysis process that produces a source-backed, plain-English view of whether a stock has an attractive chance to make money over the chosen time horizon.

## Core idea

Each stock ticker has its own folder under `stocks/`. That folder stores:

- `summary.html`: the most recent visual thesis summary and what to watch next.
- `index.html`: generated local index of all analysis runs for the ticker.
- `profile.json`: ticker metadata and company-specific source hints.
- `data/`: raw and processed data collected across runs.
- `runs/YYYY-MM-DD/`: one folder per analysis run, containing all artifacts for that run.

The repository root also has `index.html`, a local browser entry point for stock index pages. Run `npm run build:index` after adding or updating ticker folders to generate the ignored `index-data.js` file and each ignored `stocks/<TICKER>/index.html` page.

Summaries are written for non-financial readers. They should start with the bottom line, explain how the stock can make money, explain how it can lose money, state whether the stock is cheap enough under an appropriate valuation model, assess CEO/leadership quality, review recent management-team stock purchases/sales and company buybacks, review whether prior calls were accurate, and define any necessary finance terms in plain language. CEO research should cover prior success and failure patterns, observable management style, and the CEO's main current-company goal. The framework is opportunity-seeking and should use directional signals when evidence supports them, while still documenting uncertainty and downside risk.

Codex should read `AGENTS.md` first, then follow the linked rule files and relevant skills under `.agents/skills/`.

## Repository layout

```text
.
├── AGENTS.md
├── index.html
├── README.md
├── package.json
├── .env.example
├── config/
│   ├── watchlist.json
│   ├── trusted-news-sources.json
│   ├── signal-policy.json
│   └── run-profile.json
├── rules/
│   ├── 00-operating-principles.md
│   ├── 01-data-collection.md
│   ├── 02-source-quality.md
│   ├── 03-sec-filings-analysis.md
│   ├── 04-news-and-catalyst-analysis.md
│   ├── 05-market-trend-analysis.md
│   ├── 06-signal-methodology.md
│   ├── 07-output-standards.md
│   ├── 08-valuation-and-leadership.md
│   └── 09-prior-thesis-review.md
├── .agents/
│   └── skills/
├── tools/
│   ├── init-ticker.mjs
│   ├── fetch-sec-filings.mjs
│   ├── fetch-trusted-news.mjs
│   ├── fetch-market-trends.mjs
│   ├── create-run-analysis.mjs
│   ├── run-pipeline.mjs
│   └── lib/
└── stocks/
    ├── README.md
    └── _TEMPLATE/
```

## First-time setup

1. Install Node.js 20 or newer.
2. Copy `.env.example` to `.env` and set values.
3. Edit `config/watchlist.json` with the tickers you want to track.
4. Initialize a ticker folder:

```bash
npm run init:ticker -- --ticker AAPL --company "Apple Inc."
```

5. Run the full pipeline for a ticker:

```bash
npm run pipeline -- --ticker AAPL
```

6. Open the generated run folder under `stocks/AAPL/runs/YYYY-MM-DD/` and ask Codex to complete the source-backed analysis using the artifacts and rules.
7. After Codex updates `stocks/AAPL/summary.html`, refresh the local root and ticker index pages:

```bash
npm run build:index
```

8. Open `index.html` in a browser to navigate to available stock summaries.

## What the tools do

The tools are intentionally lightweight and dependency-free. They load `.env` automatically, collect and structure raw inputs, and leave the qualitative analysis to Codex using repository rules.

- `init-ticker.mjs`: creates a ticker folder from `_TEMPLATE`.
- `fetch-sec-filings.mjs`: downloads SEC submissions metadata for a ticker.
- `fetch-company-info.mjs`: collects company profile, market cap, share-count, sector/industry, and valuation inputs from Massive and Alpha Vantage when keys are configured.
- `fetch-trusted-news.mjs`: collects trusted-source news using Massive stock news, Alpha Vantage news sentiment, optional NewsAPI, and configured RSS feeds.
- `fetch-market-trends.mjs`: collects daily market prices and computes basic trend metrics, preferring Massive aggregate bars, then Alpha Vantage, then Stooq fallback.
- `create-run-analysis.mjs`: creates run artifacts and analysis templates, including valuation, leadership, and prior-thesis review files.
- `build-index.mjs`: scans local stock folders, generates ignored `index-data.js` directory data for root `index.html`, and writes ignored `stocks/<TICKER>/index.html` pages with run history and important conclusions.
- `run-pipeline.mjs`: executes the standard collection and analysis-prep flow.

Common collection tool definitions live in `tools/lib/collection-tools.mjs`; pipeline code and run templates should reuse that registry instead of duplicating command/source lists. Each pipeline run writes an audit trail into the run folder:

- `run-metadata.json`: tool versions, commands, tool run status, files created, sources used, skipped sources, and known failures.
- `source-inventory.md`: reader-friendly source inventory plus tool runs, skipped sources, and tool/source issues.
- `decision-brief.md`: a short `Collection and Tooling Notes` section summarizing material collection gaps.

## Important limitations

This framework is for research support. It does not place trades and does not guarantee investment performance. Every buy/sell/hold signal must be treated as a research hypothesis requiring human review.
