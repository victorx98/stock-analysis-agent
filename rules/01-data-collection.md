# Data Collection Rules

## Collection order

For each ticker run:

1. SEC submissions and recent filing metadata.
2. Company profile and investor relations links if configured.
3. Trusted news and macro/regulatory sources.
4. Daily market prices and trend metrics.
5. Prior run summary and prior watch items.

## Raw data preservation

- Store raw SEC data under `stocks/<TICKER>/data/raw/sec/`.
- Store raw news data under `stocks/<TICKER>/data/raw/news/`.
- Store raw market data under `stocks/<TICKER>/data/raw/market/`.
- Store normalized or derived data under `stocks/<TICKER>/data/processed/`.
- Store run-specific output under `stocks/<TICKER>/runs/<RUN_DATE>/`.

## Missing data

If a tool cannot collect a source, record:

- source name
- attempted method
- error or limitation
- whether the missing data affects the final signal
- fallback source, if any

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
