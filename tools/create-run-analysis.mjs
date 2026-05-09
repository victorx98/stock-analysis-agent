#!/usr/bin/env node
import path from 'node:path';
import { getArg, requireArg } from './lib/args.mjs';
import { ensureDir, nextRunDir, readJson, stockDir, writeJson, writeText } from './lib/fs-utils.mjs';

const ticker = requireArg('ticker').toUpperCase();
const runDate = getArg('date', new Date().toISOString().slice(0, 10));
const dir = stockDir(ticker);
const profile = await readJson(path.join(dir, 'profile.json'));
const runDir = await nextRunDir(ticker, runDate);
await ensureDir(runDir);

const metadata = {
  ticker,
  company: profile.company,
  runDate: path.basename(runDir),
  createdAt: new Date().toISOString(),
  commands: [
    `npm run fetch:sec -- --ticker ${ticker}`,
    `npm run fetch:news -- --ticker ${ticker}`,
    `npm run fetch:market -- --ticker ${ticker}`,
    `npm run create:run -- --ticker ${ticker}`
  ],
  sourceFiles: [],
  knownFailures: []
};
await writeJson(path.join(runDir, 'run-metadata.json'), metadata);

await writeText(path.join(runDir, 'source-inventory.md'), `# Source Inventory - ${ticker} - ${metadata.runDate}\n\n| Source | Type | Tier | Path/URL | Status | Notes |\n|---|---|---:|---|---|---|\n| SEC submissions | Filing metadata | 1 | stocks/${ticker}/data/raw/sec/ | pending review | Add latest file path after inspection. |\n| Trusted news | News/catalyst | 2 | stocks/${ticker}/data/raw/news/ | pending review | Add latest file path after inspection. |\n| Market trend | Price data | market data | stocks/${ticker}/data/raw/market/ | pending review | Add latest file path after inspection. |\n`);
await writeText(path.join(runDir, 'sec-filings.md'), `# SEC Filings - ${ticker} - ${metadata.runDate}\n\n## Filing inventory\n\nReview latest files in stocks/${ticker}/data/raw/sec/ and stocks/${ticker}/data/processed/.\n\n## Material takeaways\n\n## Deterioration signals\n\n## Improvement signals\n\n## Open questions\n`);
await writeText(path.join(runDir, 'news-digest.md'), `# News Digest - ${ticker} - ${metadata.runDate}\n\n## Material news\n\nReview latest files in stocks/${ticker}/data/raw/news/ and stocks/${ticker}/data/processed/.\n\n## Catalyst categories\n\n## Bullish interpretation\n\n## Bearish interpretation\n\n## Follow-up questions\n`);
await writeText(path.join(runDir, 'market-trend.md'), `# Market Trend - ${ticker} - ${metadata.runDate}\n\n## Metrics\n\nReview latest files in stocks/${ticker}/data/raw/market/ and stocks/${ticker}/data/processed/.\n\n## Trend label\n\n## Momentum interpretation\n\n## Contradictory signals\n`);
await writeText(path.join(runDir, 'fundamental-notes.md'), `# Fundamental Notes - ${ticker} - ${metadata.runDate}\n\n## Revenue\n\n## Margins\n\n## Cash flow\n\n## Balance sheet\n\n## Valuation context\n\n## Questions for deeper review\n`);
await writeText(path.join(runDir, 'risk-register.md'), `# Risk Register - ${ticker} - ${metadata.runDate}\n\n| Risk | Evidence | Likelihood | Impact | Mitigation / Watch Item |\n|---|---|---|---|---|\n`);
await writeJson(path.join(runDir, 'signal.json'), {
  ticker,
  runDate: metadata.runDate,
  signal: 'insufficient_evidence',
  timeHorizon: '6-12 months',
  confidence: 'low',
  summary: '',
  supportingEvidence: [],
  contraryEvidence: [],
  invalidationTriggers: [],
  watchNextRun: [],
  missingInformation: []
});
await writeText(path.join(runDir, 'decision-brief.md'), `# ${ticker} Decision Brief - ${metadata.runDate}\n\n## Executive summary\n\n## Current signal\n- Signal: insufficient_evidence\n- Time horizon: 6-12 months\n- Confidence: low\n- Prior signal: unknown\n- Change since prior run: TBD\n\n## Evidence table\n| Claim | Evidence | Source tier | Bull/Bear/Neutral | Confidence |\n|---|---|---|---|---|\n\n## SEC filing takeaways\n\n## News and catalyst takeaways\n\n## Market trend takeaways\n\n## Bull case\n\n## Bear case\n\n## Key risks\n\n## Invalidation triggers\n\n## What to watch next run\n\n## Missing information\n\n## Research-only disclaimer\n\nThis brief is for research support only and is not personalized financial advice or a trade instruction.\n`);
await writeText(path.join(runDir, 'watchlist-next-run.md'), `# Watchlist for Next Run - ${ticker}\n\n- Review whether new SEC filings changed the thesis.\n- Check whether material news items were confirmed by primary sources.\n- Recompute market trend metrics.\n- Revisit invalidation triggers from this run.\n`);

console.log(JSON.stringify({ ticker, runDir }, null, 2));
