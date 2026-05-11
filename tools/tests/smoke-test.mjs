#!/usr/bin/env node
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { collectionSteps, getTool, initialSourceRows } from '../lib/collection-tools.mjs';
import { summarizeCompanyInfo } from '../lib/company-info.mjs';
import { parseEnv } from '../lib/env.mjs';
import { computeTrendMetrics } from '../lib/market.mjs';
import { createInitialRunMetadata, initializeRunAudit, renderSourceInventory } from '../lib/run-audit.mjs';
import { summarizeRecentFilings } from '../lib/sec.mjs';

const prices = Array.from({ length: 260 }, (_, index) => ({
  date: `2026-01-${String((index % 28) + 1).padStart(2, '0')}`,
  close: 100 + index * 0.1,
  adjustedClose: 100 + index * 0.1,
  volume: 1000
}));
const metrics = computeTrendMetrics(prices);
assert.equal(metrics.trendLabel, 'uptrend');
assert.ok(metrics.sma20);
assert.ok(metrics.rsi14);

const filings = summarizeRecentFilings({ filings: { recent: { form: ['10-K'], filingDate: ['2026-01-01'], reportDate: ['2025-12-31'], accessionNumber: ['x'], primaryDocument: ['doc.htm'] } } });
assert.equal(filings[0].form, '10-K');

const runProfile = JSON.parse(readFileSync(new URL('../../config/run-profile.json', import.meta.url), 'utf8'));
assert.ok(runProfile.standardRunArtifacts.includes('valuation-analysis.md'));
assert.ok(runProfile.standardRunArtifacts.includes('leadership-analysis.md'));
assert.ok(runProfile.standardRunArtifacts.includes('insider-and-buybacks.md'));
assert.ok(runProfile.standardRunArtifacts.includes('thesis-review.md'));

const signalPolicy = JSON.parse(readFileSync(new URL('../../config/signal-policy.json', import.meta.url), 'utf8'));
assert.ok(signalPolicy.leadershipPolicy.requiredFields.includes('priorTrackRecord'));
assert.ok(signalPolicy.leadershipPolicy.requiredFields.includes('managementStyle'));
assert.ok(signalPolicy.leadershipPolicy.requiredFields.includes('currentCompanyGoal'));
assert.equal(signalPolicy.minimumEvidenceForDirectionalSignal.mustIncludeInsiderAndBuybackAssessment, true);
assert.ok(signalPolicy.insiderAndBuybackPolicy.requiredFields.includes('managementTransactions'));
assert.ok(signalPolicy.insiderAndBuybackPolicy.requiredFields.includes('buybackProgram'));

assert.equal(getTool('fetch-sec').name, 'SEC filings collector');
assert.deepEqual(collectionSteps().map((tool) => tool.id), ['fetch-sec', 'fetch-company-info', 'fetch-news', 'fetch-market']);
assert.equal(getTool('fetch-company-info').name, 'Company info collector');
assert.ok(initialSourceRows('TEST', {}).some((source) => source.id === 'trusted-news'));
assert.ok(initialSourceRows('TEST', {}).some((source) => source.id === 'company-info'));
assert.ok(initialSourceRows('TEST', {}).some((source) => source.id === 'insider-transactions-buybacks'));

assert.deepEqual(parseEnv('FOO=bar\nQUOTED="baz qux"\nexport SKIP_COMMENT=value # comment\n'), {
  FOO: 'bar',
  QUOTED: 'baz qux',
  SKIP_COMMENT: 'value'
});
const companySummary = summarizeCompanyInfo({
  ticker: 'TEST',
  profile: { company: 'Profile Co' },
  massiveTickerOverview: { sourceUrl: 'massive', data: { results: { name: 'Massive Co', market_cap: 1000, weighted_shares_outstanding: 10 } } },
  alphaVantageOverview: { sourceUrl: 'alpha', data: { Name: 'Alpha Co', Sector: 'Technology', PERatio: '20.5' } }
});
assert.equal(companySummary.company, 'Massive Co');
assert.equal(companySummary.sector, 'Technology');
assert.equal(companySummary.peRatio, 20.5);

const auditMetadata = createInitialRunMetadata({
  ticker: 'TEST',
  company: 'Test Company',
  runDate: '2026-01-01',
  profile: {}
});
const sourceInventory = renderSourceInventory({
  ...auditMetadata,
  toolRuns: [{
    id: 'fetch-sec',
    name: 'SEC filings collector',
    command: 'node tools/fetch-sec-filings.mjs --ticker TEST',
    status: 'success',
    exitCode: 0
  }],
  knownFailures: [{
    tool: 'Trusted news collector',
    source: 'Example RSS',
    attemptedMethod: 'RSS feed',
    error: 'timeout'
  }]
});
assert.ok(auditMetadata.toolVersions.collectionToolRegistry);
assert.ok(sourceInventory.includes('## Tool Runs'));
assert.ok(sourceInventory.includes('## Tool / Source Issues'));
assert.ok(sourceInventory.includes('Example RSS'));

const tempRunDir = mkdtempSync(path.join(tmpdir(), 'stock-run-audit-'));
try {
  writeFileSync(path.join(tempRunDir, 'decision-brief.md'), '# TEST Decision Brief\n\n## Evidence table\n\n', 'utf8');
  await initializeRunAudit(tempRunDir, auditMetadata);
  const updatedBrief = readFileSync(path.join(tempRunDir, 'decision-brief.md'), 'utf8');
  const storedMetadata = JSON.parse(readFileSync(path.join(tempRunDir, 'run-metadata.json'), 'utf8'));
  assert.ok(updatedBrief.includes('## Collection and Tooling Notes'));
  assert.equal(storedMetadata.ticker, 'TEST');
} finally {
  rmSync(tempRunDir, { recursive: true, force: true });
}

const templateSignal = JSON.parse(readFileSync(new URL('../../stocks/_TEMPLATE/runs/YYYY-MM-DD/signal.json', import.meta.url), 'utf8'));
assert.equal(templateSignal.valuationAssessment.classification, 'valuation_uncertain');
assert.equal(templateSignal.leadershipAssessment.classification, 'leadership_unknown');
assert.deepEqual(Object.keys(templateSignal.leadershipAssessment.priorTrackRecord), [
  'successes',
  'failures',
  'pattern',
  'implicationForCurrentCompany'
]);
assert.deepEqual(Object.keys(templateSignal.leadershipAssessment.managementStyle), ['style', 'evidence', 'likelyImpact']);
assert.deepEqual(Object.keys(templateSignal.leadershipAssessment.currentCompanyGoal), [
  'statedGoal',
  'evidence',
  'shareholderAlignment',
  'riskIfWrong'
]);
assert.equal(templateSignal.insiderAndBuybackAssessment.thesisImpact, 'unknown');
assert.deepEqual(Object.keys(templateSignal.insiderAndBuybackAssessment.managementTransactions), [
  'summary',
  'purchases',
  'sales',
  'notableContext'
]);
assert.deepEqual(Object.keys(templateSignal.insiderAndBuybackAssessment.buybackProgram), [
  'authorization',
  'recentExecution',
  'shareCountEffect',
  'capitalAllocationAssessment'
]);
assert.equal(templateSignal.priorThesisReview.accuracy, 'baseline_no_prior_call');

const templateBrief = readFileSync(new URL('../../stocks/_TEMPLATE/runs/YYYY-MM-DD/decision-brief.md', import.meta.url), 'utf8');
assert.ok(templateBrief.includes('## Collection and Tooling Notes'));
assert.ok(templateBrief.includes("CEO's main current-company goal"));
assert.ok(templateBrief.includes('## Insider and buyback takeaways'));

const templateLeadership = readFileSync(new URL('../../stocks/_TEMPLATE/runs/YYYY-MM-DD/leadership-analysis.md', import.meta.url), 'utf8');
assert.ok(templateLeadership.includes('## Prior success and failure stories'));
assert.ok(templateLeadership.includes('## Observable personality and management style'));
assert.ok(templateLeadership.includes("## CEO's main goal at the current company"));

const templateInsiderBuybacks = readFileSync(new URL('../../stocks/_TEMPLATE/runs/YYYY-MM-DD/insider-and-buybacks.md', import.meta.url), 'utf8');
assert.ok(templateInsiderBuybacks.includes('## Management-team stock purchases and sales'));
assert.ok(templateInsiderBuybacks.includes('## Company stock buybacks'));
assert.ok(templateInsiderBuybacks.includes('## Capital allocation interpretation'));

const templateMetadata = JSON.parse(readFileSync(new URL('../../stocks/_TEMPLATE/runs/YYYY-MM-DD/run-metadata.json', import.meta.url), 'utf8'));
assert.ok(Array.isArray(templateMetadata.toolRuns));
assert.ok(Array.isArray(templateMetadata.skippedSources));

console.log('Smoke tests passed.');
