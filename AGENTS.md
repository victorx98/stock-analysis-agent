# AGENTS.md - Long-Term Stock Analysis Framework

## Mission

Use this repository to run repeatable, source-backed, long-term stock analysis. For each stock, continuously collect SEC filings, trusted news, market data, and prior analysis artifacts. Synthesize them into a cautious investment research brief with trend assessment, signal status, risks, and items to watch next run.

This is research support only. Do not present any output as personalized financial advice. Do not imply certainty about future stock prices. Always show evidence, uncertainty, and downside risks.

## Repository map

- `config/`: watchlist, trusted sources, signal thresholds, run defaults.
- `rules/`: detailed operating rules for data collection, source quality, SEC analysis, catalyst analysis, technical trend analysis, signals, and output format.
- `.agents/skills/`: reusable Codex skills for recurring workflows.
- `tools/`: Node.js tools for collection, normalization, run scaffolding, and summary updates.
- `stocks/<TICKER>/`: persistent storage for one company.
- `stocks/<TICKER>/summary.md`: latest research summary and next-run watchlist.
- `stocks/<TICKER>/runs/YYYY-MM-DD/`: artifacts generated for a specific run.

## Required rule loading

Before doing any stock analysis, read these files in order:

1. `rules/00-operating-principles.md`
2. `rules/01-data-collection.md`
3. `rules/02-source-quality.md`
4. `rules/03-sec-filings-analysis.md`
5. `rules/04-news-and-catalyst-analysis.md`
6. `rules/05-market-trend-analysis.md`
7. `rules/06-signal-methodology.md`
8. `rules/07-output-standards.md`

Use relevant skills from `.agents/skills/` when the task matches their descriptions.

## Standard workflow for a ticker run

1. Identify the ticker and company name.
2. Verify the ticker folder exists under `stocks/<TICKER>/`. If it does not, run:

   ```bash
   npm run init:ticker -- --ticker <TICKER> --company "<Company Name>"
   ```

3. Run the collection pipeline:

   ```bash
   npm run pipeline -- --ticker <TICKER>
   ```

4. Inspect the generated run folder under `stocks/<TICKER>/runs/<RUN_DATE>/`.
5. Read prior `stocks/<TICKER>/summary.md` before making a new conclusion.
6. Analyze SEC filings, news, fundamentals, catalysts, risks, valuation context, and market trend metrics.
7. Produce a final run brief in `decision-brief.md` and update `summary.md` only after evidence review.

## Evidence rules

- Prefer primary sources: SEC filings, company investor relations, earnings releases, call transcripts, regulatory releases, and official macro data.
- Use reputable financial journalism as secondary context, not as sole proof.
- Mark unsourced claims as assumptions or remove them.
- Do not use social media, forums, rumors, or anonymous commentary as decision-grade evidence unless clearly labeled as sentiment/noise.
- When sources conflict, explain the conflict and favor primary documents.
- Keep direct quotes short and cite file paths or URLs.

## Signal rules

A signal is not a trade order. It is a research classification. Use only these signal labels:

- `strong_buy_watch`
- `buy_watch`
- `hold_neutral`
- `sell_watch`
- `strong_sell_watch`
- `insufficient_evidence`

Every signal must include:

- time horizon
- confidence level
- evidence summary
- contrary evidence
- invalidation triggers
- risks and missing information
- suggested next data to collect

## Folder and artifact rules

For each run date, preserve raw data and derived artifacts. Never overwrite prior run folders. If rerunning on the same date, append a run suffix such as `YYYY-MM-DD-02`.

Each `stocks/<TICKER>/runs/<RUN_DATE>/` folder should contain:

- `run-metadata.json`
- `source-inventory.md`
- `sec-filings.md`
- `news-digest.md`
- `market-trend.md`
- `fundamental-notes.md`
- `risk-register.md`
- `signal.json`
- `decision-brief.md`
- `watchlist-next-run.md`

## Engineering expectations

- Use Node.js 20+.
- Prefer dependency-free tools unless a dependency materially improves reliability.
- Run `npm test` after editing tools.
- Run `npm run lint` if you add lint tooling.
- Keep scripts idempotent where possible.
- Do not commit API keys, downloaded paywalled content, or personal brokerage data.

## Done means

A stock analysis run is complete only when:

1. Raw data was collected or missing data was explicitly documented.
2. Source quality was assessed.
3. SEC filing changes and risk factors were reviewed where available.
4. News and catalysts were categorized by materiality.
5. Technical trend metrics were computed or marked unavailable.
6. The final signal includes contrary evidence and invalidation triggers.
7. `stocks/<TICKER>/summary.md` is updated with what to watch next.
