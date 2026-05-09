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

const profileHints = [
  `- Company: ${profile.company || 'TBD'}`,
  `- Sector: ${profile.sector || 'TBD'}`,
  `- Industry: ${profile.industry || 'TBD'}`,
  `- Business type: ${profile.businessType || 'TBD'}`,
  `- Lifecycle stage: ${profile.lifeCycleStage || 'TBD'}`,
  `- CEO: ${profile.ceoName || 'TBD'}`,
  `- Founder-led: ${profile.founderLed === undefined || profile.founderLed === null ? 'TBD' : String(profile.founderLed)}`
].join('\n');

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

await writeText(path.join(runDir, 'source-inventory.md'), `# Source Inventory - ${ticker} - ${metadata.runDate}\n\n| Source | Type | Tier | Path/URL | Status | Notes |\n|---|---|---:|---|---|---|\n| SEC submissions | Filing metadata | 1 | stocks/${ticker}/data/raw/sec/ | pending review | Add latest file path after inspection. |\n| Proxy / governance filings | CEO, incentives, ownership | 1 | stocks/${ticker}/data/raw/sec/ | pending review | Review DEF 14A, 8-K CEO changes, Forms 3/4/5 when available. |\n| Company profile / investor relations | Business type, CEO bio, strategy | 1 | ${profile.investorRelationsUrl || `stocks/${ticker}/profile.json`} | pending review | Confirm business classification, leadership background, and shareholder materials. |\n| Trusted news | News/catalyst | 2 | stocks/${ticker}/data/raw/news/ | pending review | Add latest file path after inspection. |\n| Market trend | Price data | market data | stocks/${ticker}/data/raw/market/ | pending review | Add latest file path after inspection. |\n`);
await writeText(path.join(runDir, 'sec-filings.md'), `# SEC Filings - ${ticker} - ${metadata.runDate}\n\n## Filing inventory\n\nReview latest files in stocks/${ticker}/data/raw/sec/ and stocks/${ticker}/data/processed/.\n\n## Material takeaways\n\n## Deterioration signals\n\n## Improvement signals\n\n## Open questions\n`);
await writeText(path.join(runDir, 'news-digest.md'), `# News Digest - ${ticker} - ${metadata.runDate}\n\n## Material news\n\nReview latest files in stocks/${ticker}/data/raw/news/ and stocks/${ticker}/data/processed/.\n\n## Catalyst categories\n\n## Bullish interpretation\n\n## Bearish interpretation\n\n## Follow-up questions\n`);
await writeText(path.join(runDir, 'market-trend.md'), `# Market Trend - ${ticker} - ${metadata.runDate}\n\n## Metrics\n\nReview latest files in stocks/${ticker}/data/raw/market/ and stocks/${ticker}/data/processed/.\n\n## Trend label\n\n## Momentum interpretation\n\n## Contradictory signals\n`);
await writeText(path.join(runDir, 'fundamental-notes.md'), `# Fundamental Notes - ${ticker} - ${metadata.runDate}\n\n## Profile hints\n\n${profileHints}\n\n## Revenue\n\n## Margins\n\n## Cash flow\n\n## Balance sheet\n\n## Business quality\n\n## Valuation inputs to carry into valuation-analysis.md\n\n## CEO / leadership facts to carry into leadership-analysis.md\n\n## Questions for deeper review\n`);
await writeText(path.join(runDir, 'valuation-analysis.md'), `# Valuation Analysis - ${ticker} - ${metadata.runDate}\n\n## Profile hints\n\n${profileHints}\n\n## Business classification\n\n- Sector / industry:\n- Business type:\n- Lifecycle stage:\n- Revenue quality:\n- Capital intensity:\n- Profitability and free cash flow profile:\n\n## Current market inputs\n\n| Input | Value | Date | Evidence |\n|---|---:|---|---|\n| Share price | TBD | TBD | TBD |\n| Market capitalization | TBD | TBD | TBD |\n| Enterprise value | TBD | TBD | TBD |\n| Diluted share count | TBD | TBD | TBD |\n\n## Model selection\n\n| Candidate model | Fit for this company | Key inputs needed | Use in this run? |\n|---|---|---|---|\n| Free cash flow / owner earnings DCF | TBD | Revenue, margins, reinvestment, discount rate, terminal value | TBD |\n| Relative multiple | TBD | Peer set, normalized earnings/cash flow/sales | TBD |\n| Sum-of-the-parts / NAV | TBD | Segment values, assets, debt, minority interests | TBD |\n\n## Bear, base, and bull value ranges\n\n| Scenario | Value range | Key assumptions | Confidence |\n|---|---:|---|---|\n| Bear | TBD | TBD | TBD |\n| Base | TBD | TBD | TBD |\n| Bull | TBD | TBD | TBD |\n\n## Margin of safety\n\n## Cheap-trap checks\n\n| Check | Evidence | Pass / Concern / Unknown |\n|---|---|---|\n| Balance sheet can survive the thesis horizon | TBD | TBD |\n| Business is not in structural decline without offsetting catalyst | TBD | TBD |\n| Dilution risk is manageable | TBD | TBD |\n| Governance and leadership do not block value realization | TBD | TBD |\n| Catalyst exists to close the valuation gap | TBD | TBD |\n\n## Valuation classification\n\nUse one: severely_undervalued, moderately_undervalued, fairly_valued, overvalued, or valuation_uncertain.\n\n## Evidence that could close the gap\n`);
await writeText(path.join(runDir, 'leadership-analysis.md'), `# Leadership Analysis - ${ticker} - ${metadata.runDate}\n\n## Profile hints\n\n${profileHints}\n\n## CEO identification\n\n| Field | Finding | Evidence |\n|---|---|---|\n| CEO name | ${profile.ceoName || 'TBD'} | TBD |\n| Role start date | TBD | TBD |\n| Founder or co-founder? | ${profile.founderLed === undefined || profile.founderLed === null ? 'TBD' : String(profile.founderLed)} | TBD |\n| Ownership / incentive alignment | TBD | TBD |\n\n## Career background before CEO\n\n## Observable execution pattern\n\n## Strategic clarity on the current company situation\n\n## Unique advantages\n\n## Red flags and governance concerns\n\n## Leadership classification\n\nUse one: leadership_edge, adequate_leadership, leadership_risk, or leadership_unknown.\n\n## Evidence to revisit next run\n`);
await writeText(path.join(runDir, 'risk-register.md'), `# Risk Register - ${ticker} - ${metadata.runDate}\n\n| Risk | Evidence | Likelihood | Impact | Mitigation / Watch Item |\n|---|---|---|---|---|\n`);
await writeJson(path.join(runDir, 'signal.json'), {
  ticker,
  runDate: metadata.runDate,
  signal: 'insufficient_evidence',
  timeHorizon: '6-12 months',
  confidence: 'low',
  summary: '',
  bottomLine: '',
  moneyMakingPath: [],
  moneyLosingPath: [],
  valuationAssessment: {
    classification: 'valuation_uncertain',
    businessType: profile.businessType || '',
    modelsUsed: [],
    marginOfSafety: '',
    summary: '',
    cheapTrapChecks: []
  },
  leadershipAssessment: {
    classification: 'leadership_unknown',
    ceoName: profile.ceoName || '',
    founderStatus: profile.founderLed === undefined || profile.founderLed === null ? '' : String(profile.founderLed),
    summary: '',
    strengths: [],
    risks: []
  },
  nextEvidenceNeeded: [],
  supportingEvidence: [],
  contraryEvidence: [],
  invalidationTriggers: [],
  watchNextRun: [],
  missingInformation: [],
  plainEnglishDefinitions: {}
});
await writeText(path.join(runDir, 'decision-brief.md'), `# ${ticker} Decision Brief - ${metadata.runDate}\n\n## Executive summary\n\n## Plain-English bottom line\n\n## How this can make money\n\n## How this can lose money\n\n## Current signal\n- Signal: insufficient_evidence\n- Time horizon: 6-12 months\n- Confidence: low\n- Prior signal: unknown\n- Change since prior run: TBD\n\n## Evidence table\n| Claim | Evidence | Source tier | Bull/Bear/Neutral | Confidence |\n|---|---|---|---|---|\n\n## SEC filing takeaways\n\n## News and catalyst takeaways\n\n## Valuation takeaways\n\n- Business type / lifecycle: ${profile.businessType || 'TBD'} / ${profile.lifeCycleStage || 'TBD'}\n- Models used: TBD\n- Valuation classification: valuation_uncertain\n- Margin of safety: TBD\n- Cheap-trap checks: TBD\n\n## CEO and leadership takeaways\n\n- CEO: ${profile.ceoName || 'TBD'}\n- Founder / co-founder: ${profile.founderLed === undefined || profile.founderLed === null ? 'TBD' : String(profile.founderLed)}\n- Leadership classification: leadership_unknown\n- Execution edge or risk: TBD\n\n## Market trend takeaways\n\n## Bull case\n\n## Bear case\n\n## Key risks\n\n## Invalidation triggers\n\n## What to watch next run\n\n## Missing information\n\n## Research-only disclaimer\n\nThis brief is for research support only and is not personalized financial advice or a trade instruction.\n`);
await writeText(path.join(runDir, 'watchlist-next-run.md'), `# Watchlist for Next Run - ${ticker}\n\n- Review whether new SEC filings changed the thesis.\n- Check whether material news items were confirmed by primary sources.\n- Update valuation model inputs, current price, model selection, and margin of safety.\n- Recheck whether CEO/leadership evidence shows clearer execution edge or risk.\n- Recompute market trend metrics.\n- Revisit invalidation triggers from this run.\n`);

console.log(JSON.stringify({ ticker, runDir }, null, 2));
