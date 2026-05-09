# Long-Term Stock Analysis Codex Framework

This repository is a Codex-ready framework for repeatable long-term stock analysis. It is designed to continuously collect SEC filings, trusted news, market trend data, and prior run artifacts, then guide Codex through a structured analysis process that produces a source-backed, plain-English view of whether a stock has an attractive chance to make money over the chosen time horizon.

## Core idea

Each stock ticker has its own folder under `stocks/`. That folder stores:

- `summary.html`: the most recent visual thesis summary and what to watch next.
- `profile.json`: ticker metadata and company-specific source hints.
- `data/`: raw and processed data collected across runs.
- `runs/YYYY-MM-DD/`: one folder per analysis run, containing all artifacts for that run.

The repository root also has `index.html`, a local browser entry point for stock summaries. Run `npm run build:index` after adding or updating ticker folders to generate the ignored `index-data.js` file that powers the directory.

Summaries are written for non-financial readers. They should start with the bottom line, explain how the stock can make money, explain how it can lose money, and define any necessary finance terms in plain language. The framework is opportunity-seeking and should use directional signals when evidence supports them, while still documenting uncertainty and downside risk.

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
│   └── 07-output-standards.md
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
7. After Codex updates `stocks/AAPL/summary.html`, refresh the local summary directory:

```bash
npm run build:index
```

8. Open `index.html` in a browser to navigate to available stock summaries.

## What the tools do

The tools are intentionally lightweight and dependency-free. They collect and structure raw inputs; Codex performs the qualitative analysis using repository rules.

- `init-ticker.mjs`: creates a ticker folder from `_TEMPLATE`.
- `fetch-sec-filings.mjs`: downloads SEC submissions metadata for a ticker.
- `fetch-trusted-news.mjs`: collects trusted-source news using optional NewsAPI plus configured RSS feeds.
- `fetch-market-trends.mjs`: collects daily market prices and computes basic trend metrics.
- `create-run-analysis.mjs`: creates run artifacts and analysis templates.
- `build-index.mjs`: scans local stock folders and generates ignored `index-data.js` directory data for root `index.html`.
- `run-pipeline.mjs`: executes the standard collection and analysis-prep flow.

## Important limitations

This framework is for research support. It does not place trades and does not guarantee investment performance. Every buy/sell/hold signal must be treated as a research hypothesis requiring human review.
