# Data Collection Rules

## Collection order

For each ticker run:

1. SEC submissions and recent filing metadata.
2. Company profile and investor relations links if configured.
3. Current price, market capitalization if available, and share-count context needed for valuation.
4. Company leadership sources, including proxy statements, CEO biographies, shareholder letters, and earnings call transcripts when available.
5. Recent ownership and capital-return sources, including Forms 3/4/5, 10-K/10-Q share repurchase tables, 8-K buyback authorizations, and company repurchase announcements when available.
6. Trusted news and macro/regulatory sources.
7. Daily market prices and trend metrics.
8. Prior run summary and prior watch items.
9. Prior signals, prior decision briefs, prior valuation ranges, prior price trend labels, and prior invalidation triggers.

## Raw data preservation

- Store raw SEC data under `stocks/<TICKER>/data/raw/sec/`.
- Store raw news data under `stocks/<TICKER>/data/raw/news/`.
- Store raw market data under `stocks/<TICKER>/data/raw/market/`.
- Store normalized or derived data under `stocks/<TICKER>/data/processed/`.
- Store run-specific output under `stocks/<TICKER>/runs/<RUN_DATE>/`.
- Store valuation, CEO, insider transaction, and buyback source notes in the run artifacts when raw data cannot be collected automatically.
- Store prior-thesis review and lessons learned in `stocks/<TICKER>/runs/<RUN_DATE>/thesis-review.md`.

## Missing data

If a tool cannot collect a source, record:

- source name
- attempted method
- error or limitation
- whether the missing data affects the final signal
- fallback source, if any

Missing current price, share count, financial statements, peer context, CEO evidence, insider transaction evidence, or buyback evidence must be treated as material if it prevents a valuation, leadership, ownership, or capital-return conclusion.

Missing prior-run data must be documented. For a first run, explicitly mark prior-call review as baseline with no prior judgment to score.

## API keys and rate limits

- Do not hardcode API keys.
- Read keys from environment variables.
- Respect rate limits and robots policies.
- Do not scrape paywalled article bodies.
- Prefer official APIs and RSS feeds.

## Repeatability

Every run must include a `run-metadata.json` file with:

- ticker
- company name
- run date
- tool versions
- commands executed
- per-tool run records, including status and exit code
- source files created
- sources used, skipped sources, and fallback sources
- known failures

Use the shared collection tool registry under `tools/lib/collection-tools.mjs` for standard pipeline steps. Do not recreate ad hoc command lists in each script; add or change common collectors in the registry so pipeline behavior, run metadata, and source inventory stay aligned.
