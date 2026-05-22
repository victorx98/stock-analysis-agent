#!/usr/bin/env node
import path from 'node:path';
import { getArg, requireArg } from './lib/args.mjs';
import { ensureDir, nextRunDir, readJson, stockDir, writeJson, writeText } from './lib/fs-utils.mjs';
import { createInitialRunMetadata, initializeRunAudit } from './lib/run-audit.mjs';

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

const metadata = createInitialRunMetadata({
  ticker,
  company: profile.company,
  runDate: path.basename(runDir),
  profile
});
await writeText(path.join(runDir, 'sec-filings.md'), `# SEC Filings - ${ticker} - ${metadata.runDate}\n\n## Filing inventory\n\nReview latest files in stocks/${ticker}/data/raw/sec/ and stocks/${ticker}/data/processed/.\n\n## Material takeaways\n\n## Deterioration signals\n\n## Improvement signals\n\n## Open questions\n`);
await writeText(path.join(runDir, 'news-digest.md'), `# News Digest - ${ticker} - ${metadata.runDate}\n\n## Material news\n\nReview latest files in stocks/${ticker}/data/raw/news/ and stocks/${ticker}/data/processed/.\n\n## Catalyst categories\n\n## Bullish interpretation\n\n## Bearish interpretation\n\n## Follow-up questions\n`);
await writeText(path.join(runDir, 'market-trend.md'), `# Market Trend - ${ticker} - ${metadata.runDate}\n\n## Metrics\n\nReview latest files in stocks/${ticker}/data/raw/market/ and stocks/${ticker}/data/processed/.\n\n## Trend label\n\n## Momentum interpretation\n\n## Contradictory signals\n`);
await writeText(path.join(runDir, 'fundamental-notes.md'), `# Fundamental Notes - ${ticker} - ${metadata.runDate}\n\n## Profile hints\n\n${profileHints}\n\n## Collected company info\n\nReview latest files in stocks/${ticker}/data/raw/company-info/ and stocks/${ticker}/data/processed/.\n\n## Revenue\n\n## Margins\n\n## Cash flow\n\n## Balance sheet\n\n## Business quality\n\n## Valuation inputs to carry into valuation-analysis.md\n\n## CEO / leadership facts to carry into leadership-analysis.md\n\n- Prior success and failure stories:\n- Observable management style evidence:\n- CEO's main goal at the current company:\n\n## Insider / buyback facts to carry into insider-and-buybacks.md\n\n- Recent management-team stock purchases/sales:\n- Company stock buyback authorization and execution:\n- Share-count effect:\n\n## Questions for deeper review\n`);
await writeText(path.join(runDir, 'valuation-analysis.md'), `# Valuation Analysis - ${ticker} - ${metadata.runDate}\n\n## Profile hints\n\n${profileHints}\n\n## Business classification\n\n- Sector / industry:\n- Business type:\n- Lifecycle stage:\n- Revenue quality:\n- Capital intensity:\n- Profitability and free cash flow profile:\n\n## Current market inputs\n\n| Input | Value | Date | Evidence |\n|---|---:|---|---|\n| Share price | TBD | TBD | TBD |\n| Market capitalization | TBD | TBD | TBD |\n| Enterprise value | TBD | TBD | TBD |\n| Diluted share count | TBD | TBD | TBD |\n\n## Model selection\n\n| Candidate model | Fit for this company | Key inputs needed | Use in this run? |\n|---|---|---|---|\n| Free cash flow / owner earnings DCF | TBD | Revenue, margins, reinvestment, discount rate, terminal value | TBD |\n| Relative multiple | TBD | Peer set, normalized earnings/cash flow/sales | TBD |\n| Sum-of-the-parts / NAV | TBD | Segment values, assets, debt, minority interests | TBD |\n\n## Bear, base, and bull value ranges\n\n| Scenario | Value range | Key assumptions | Confidence |\n|---|---:|---|---|\n| Bear | TBD | TBD | TBD |\n| Base | TBD | TBD | TBD |\n| Bull | TBD | TBD | TBD |\n\n## Margin of safety\n\n## Cheap-trap checks\n\n| Check | Evidence | Pass / Concern / Unknown |\n|---|---|---|\n| Balance sheet can survive the thesis horizon | TBD | TBD |\n| Business is not in structural decline without offsetting catalyst | TBD | TBD |\n| Dilution risk is manageable | TBD | TBD |\n| Buybacks are not masking dilution or weakening the balance sheet | TBD | TBD |\n| Governance and leadership do not block value realization | TBD | TBD |\n| Catalyst exists to close the valuation gap | TBD | TBD |\n\n## Valuation classification\n\nUse one: severely_undervalued, moderately_undervalued, fairly_valued, overvalued, or valuation_uncertain.\n\n## Evidence that could close the gap\n`);
await writeText(path.join(runDir, 'leadership-analysis.md'), `# Leadership Analysis - ${ticker} - ${metadata.runDate}\n\n## Profile hints\n\n${profileHints}\n\n## CEO identification\n\n| Field | Finding | Evidence |\n|---|---|---|\n| CEO name | ${profile.ceoName || 'TBD'} | TBD |\n| Role start date | TBD | TBD |\n| Founder or co-founder? | ${profile.founderLed === undefined || profile.founderLed === null ? 'TBD' : String(profile.founderLed)} | TBD |\n| Ownership / incentive alignment | TBD | TBD |\n\n## Career background before CEO\n\n## Prior success and failure stories\n\n| Story | Success / Failure / Mixed | Evidence | What it suggests about the CEO |\n|---|---|---|---|\n| TBD | TBD | TBD | TBD |\n\n## Observable personality and management style\n\n| Observable behavior | Evidence | Possible impact on current company |\n|---|---|---|\n| TBD | TBD | TBD |\n\n## CEO's main goal at the current company\n\n| Goal or priority | Evidence | Shareholder alignment | Risk if wrong |\n|---|---|---|---|\n| TBD | TBD | TBD | TBD |\n\n## Observable execution pattern\n\n## Strategic clarity on the current company situation\n\n## Unique advantages\n\n## Red flags and governance concerns\n\n## Leadership classification\n\nUse one: leadership_edge, adequate_leadership, leadership_risk, or leadership_unknown.\n\n## Evidence to revisit next run\n`);
await writeText(path.join(runDir, 'insider-and-buybacks.md'), `# Insider and Buyback Activity - ${ticker} - ${metadata.runDate}\n\n## Review window\n\n- Period reviewed: most recent 3-12 months unless evidence requires a different window.\n- Sources checked: SEC Forms 3/4/5, DEF 14A ownership tables, 10-K/10-Q share repurchase tables, 8-K buyback authorizations, earnings releases, and company announcements where available.\n\n## Management-team stock purchases and sales\n\n| Person / role | Date | Transaction type | Shares | Approx. value | Context | Evidence | Thesis read |\n|---|---|---|---:|---:|---|---|---|\n| TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD |\n\n## Insider ownership trend\n\n- CEO ownership trend:\n- CFO / named executive ownership trend:\n- Director ownership trend:\n- Signal from repeated buying or selling:\n\n## Company stock buybacks\n\n| Field | Finding | Evidence |\n|---|---|---|\n| Current authorization | TBD | TBD |\n| Recent repurchase execution | TBD | TBD |\n| Amount remaining | TBD | TBD |\n| Average price paid, if disclosed | TBD | TBD |\n| Diluted share-count effect | TBD | TBD |\n| Balance sheet / cash flow cost | TBD | TBD |\n\n## Capital allocation interpretation\n\n- Buyback quality: value-accretive, neutral, cosmetic, harmful, or unknown.\n- Insider/buyback thesis impact: bullish, bearish, neutral, mixed, or unknown.\n- Key reason:\n\n## Missing information and next search items\n`);
await writeText(path.join(runDir, 'thesis-review.md'), `# Thesis Review - ${ticker} - ${metadata.runDate}\n\n## Prior artifact inventory\n\n| Artifact | Path | Status | Notes |\n|---|---|---|---|\n| Prior summary | stocks/${ticker}/summary.html | pending review | Read before writing the new conclusion. |\n| Prior signal | stocks/${ticker}/runs/<PRIOR_RUN>/signal.json | TBD | Record signal, confidence, and watch items. |\n| Prior decision brief | stocks/${ticker}/runs/<PRIOR_RUN>/decision-brief.md | TBD | Review prior bull/bear case and invalidation triggers. |\n| Prior valuation analysis | stocks/${ticker}/runs/<PRIOR_RUN>/valuation-analysis.md | TBD | Compare prior value range with new price and fundamentals. |\n| Prior market trend | stocks/${ticker}/runs/<PRIOR_RUN>/market-trend.md | TBD | Compare prior trend label with current price action. |\n| Prior watchlist | stocks/${ticker}/runs/<PRIOR_RUN>/watchlist-next-run.md | TBD | Answer each prior watch item. |\n| Prior risk register | stocks/${ticker}/runs/<PRIOR_RUN>/risk-register.md | TBD | Check prior risk weighting. |\n| Prior edge lab | stocks/${ticker}/runs/<PRIOR_RUN>/edge-lab.md | TBD | Score whether prior edge hypotheses were verified, disproved, too early, or noise. |\n\n## Prior call snapshot\n\n- Prior run date:\n- Prior signal:\n- Prior confidence:\n- Prior valuation classification:\n- Prior price / trend label:\n- Prior key risks:\n- Prior invalidation triggers:\n- Prior edge hypotheses:\n\n## Current evidence used to judge prior call\n\n| Evidence | Source | Confirms / contradicts / still open |\n|---|---|---|\n\n## Accuracy label\n\nUse one: accurate, partly_accurate, inaccurate, too_early, too_late, still_untested, or baseline_no_prior_call.\n\n## What prior analysis got right\n\n## What prior analysis got wrong or missed\n\n## Prior edge hypotheses review\n\n## Why\n\n## Lesson applied this run\n\n## Changes to model, risk weighting, confidence, or watch items\n`);
await writeText(path.join(runDir, 'risk-register.md'), `# Risk Register - ${ticker} - ${metadata.runDate}\n\n| Risk | Evidence | Likelihood | Impact | Mitigation / Watch Item |\n|---|---|---|---|---|\n`);
await writeText(path.join(runDir, 'edge-lab.md'), `# Edge Lab - ${ticker} - ${metadata.runDate}\n\n## Consensus View\n\n- What normal public analysis appears to believe:\n- Why that view may be incomplete, stale, lazy, or wrong:\n\n## Broad Lead Search\n\n| Lead source / search path | Source tier | Idea generated | Status | Notes |\n|---|---|---|---|---|\n| TBD | TBD | TBD | unverified_lead | TBD |\n\n## Top Edge Hypotheses\n\n| Hypothesis | Why public may miss it | Current status | Payoff if true | Falsifier | Next verification step |\n|---|---|---|---|---|---|\n| TBD | TBD | unverified_lead | TBD | TBD | TBD |\n\nUse one status per hypothesis: unverified_lead, partly_verified, verified_edge, disproved, or monitor_only.\n\n## Verification Attempts\n\n| Hypothesis | Evidence checked | Result | Source / path |\n|---|---|---|---|\n| TBD | TBD | TBD | TBD |\n\n## Disconfirming Evidence\n\n| Hypothesis | Evidence against it | Strength of disproof | Source / path |\n|---|---|---|---|\n| TBD | TBD | TBD | TBD |\n\n## Abandoned or Disproved Ideas\n\n- Idea:\n- Why it was rejected:\n- Lesson for future runs:\n\n## Edge Impact On Signal\n\n- Edge status: none_found, unverified_leads, partly_verified, verified_edge, or disproved.\n- Signal influence: none, watch_item, confidence_adjustment, or signal_driver.\n- Rationale:\n`);
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
  priorThesisReview: {
    priorSignal: '',
    priorRunDate: '',
    accuracy: 'baseline_no_prior_call',
    whatWasRight: [],
    whatWasWrong: [],
    why: '',
    lessonApplied: ''
  },
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
    priorTrackRecord: {
      successes: [],
      failures: [],
      pattern: '',
      implicationForCurrentCompany: ''
    },
    managementStyle: {
      style: '',
      evidence: [],
      likelyImpact: ''
    },
    currentCompanyGoal: {
      statedGoal: '',
      evidence: [],
      shareholderAlignment: '',
      riskIfWrong: ''
    },
    strengths: [],
    risks: []
  },
  insiderAndBuybackAssessment: {
    reviewWindow: '',
    managementTransactions: {
      summary: '',
      purchases: [],
      sales: [],
      notableContext: []
    },
    buybackProgram: {
      authorization: '',
      recentExecution: '',
      shareCountEffect: '',
      capitalAllocationAssessment: ''
    },
    thesisImpact: 'unknown',
    missingInformation: []
  },
  edgeAssessment: {
    consensusView: '',
    highestConvictionVariantView: '',
    edgeStatus: 'none_found',
    signalInfluence: 'none',
    contrarianTheses: []
  },
  nextEvidenceNeeded: [],
  supportingEvidence: [],
  contraryEvidence: [],
  invalidationTriggers: [],
  watchNextRun: [],
  missingInformation: [],
  plainEnglishDefinitions: {}
});
await writeText(path.join(runDir, 'decision-brief.md'), `# ${ticker} Decision Brief - ${metadata.runDate}\n\n## Executive summary\n\n## Plain-English bottom line\n\n## How this can make money\n\n## How this can lose money\n\n## Current signal\n- Signal: insufficient_evidence\n- Time horizon: 6-12 months\n- Confidence: low\n- Prior signal: unknown\n- Change since prior run: TBD\n\n## Prior thesis review\n\n- Prior run: TBD\n- Prior signal: unknown\n- Accuracy: baseline_no_prior_call\n- What was right: TBD\n- What was wrong or missed: TBD\n- Lesson applied this run: TBD\n\n## Collection and Tooling Notes\n\n- Collection tools have not been run for this run folder yet.\n- Source records captured: 0.\n- No tool/source issues recorded yet.\n\n## Evidence table\n| Claim | Evidence | Source tier | Bull/Bear/Neutral | Confidence |\n|---|---|---|---|---|\n\n## Edge Lab Summary\n\n- Consensus view: TBD\n- Highest-conviction variant view: TBD\n- Edge status: none_found\n- Signal influence: none\n- What would disprove it: TBD\n\n## SEC filing takeaways\n\n## News and catalyst takeaways\n\n## Valuation takeaways\n\n- Business type / lifecycle: ${profile.businessType || 'TBD'} / ${profile.lifeCycleStage || 'TBD'}\n- Models used: TBD\n- Valuation classification: valuation_uncertain\n- Margin of safety: TBD\n- Cheap-trap checks: TBD\n\n## CEO and leadership takeaways\n\n- CEO: ${profile.ceoName || 'TBD'}\n- Founder / co-founder: ${profile.founderLed === undefined || profile.founderLed === null ? 'TBD' : String(profile.founderLed)}\n- Leadership classification: leadership_unknown\n- Prior success/failure pattern: TBD\n- Observable management style and likely impact: TBD\n- CEO's main current-company goal: TBD\n- Execution edge or risk: TBD\n\n## Insider and buyback takeaways\n\n- Management-team stock purchases/sales: TBD\n- Company stock buyback authorization/execution: TBD\n- Share-count effect: TBD\n- Thesis impact: unknown\n\n## Market trend takeaways\n\n## Bull case\n\n## Bear case\n\n## Key risks\n\n## Invalidation triggers\n\n## What to watch next run\n\n## Missing information\n\n## Source Appendix\n\n| Source | Type / Tier | Date | Link or File | Use in report |\n|---|---|---|---|---|\n| TBD | TBD | TBD | TBD | Populate from source-inventory.md, SEC filing files, news links, company materials, market data, and manually reviewed sources. |\n\n## Research-only disclaimer\n\nThis brief is for research support only and is not personalized financial advice or a trade instruction.\n`);
await writeText(path.join(runDir, 'watchlist-next-run.md'), `# Watchlist for Next Run - ${ticker}\n\n- Review whether new SEC filings changed the thesis.\n- Score whether this run's signal, valuation range, watch items, and invalidation triggers were accurate, inaccurate, early, late, or still untested.\n- Check whether material news items were confirmed by primary sources.\n- Update valuation model inputs, current price, model selection, and margin of safety.\n- Recheck whether CEO/leadership evidence shows clearer execution edge or risk, including prior-track-record lessons, management style, and main current-company goal.\n- Search recent management-team stock purchases/sales and company stock buyback authorization/execution.\n- Recompute market trend metrics.\n- Revisit invalidation triggers from this run.\n- Recheck edge-lab hypotheses: mark each prior idea as verified, disproved, too early, or noise.\n`);

await initializeRunAudit(runDir, metadata);

console.log(JSON.stringify({ ticker, runDir }, null, 2));
