# Data Collection Rules

## Collection order

For each ticker run:

1. SEC submissions and recent filing metadata.
2. Company profile and investor relations links if configured.
3. Current price, market capitalization if available, and share-count context needed for valuation.
4. Company leadership sources, including proxy statements, CEO biographies, shareholder letters, and earnings call transcripts when available.
5. Trusted news and macro/regulatory sources.
6. Daily market prices and trend metrics.
7. Prior run summary and prior watch items.
8. Prior signals, prior decision briefs, prior valuation ranges, prior price trend labels, and prior invalidation triggers.

## Raw data preservation

- Store raw SEC data under `stocks/<TICKER>/data/raw/sec/`.
- Store raw news data under `stocks/<TICKER>/data/raw/news/`.
- Store raw market data under `stocks/<TICKER>/data/raw/market/`.
- Store normalized or derived data under `stocks/<TICKER>/data/processed/`.
- Store run-specific output under `stocks/<TICKER>/runs/<RUN_DATE>/`.
- Store valuation and CEO source notes in the run artifacts when raw data cannot be collected automatically.
- Store prior-thesis review and lessons learned in `stocks/<TICKER>/runs/<RUN_DATE>/thesis-review.md`.

## Missing data

If a tool cannot collect a source, record:

- source name
- attempted method
- error or limitation
- whether the missing data affects the final signal
- fallback source, if any

Missing current price, share count, financial statements, peer context, or CEO evidence must be treated as material if it prevents a valuation or leadership conclusion.

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
- source files created
- known failures
