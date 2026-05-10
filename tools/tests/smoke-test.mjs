#!/usr/bin/env node
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { collectionSteps, getTool, initialSourceRows } from '../lib/collection-tools.mjs';
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
assert.ok(runProfile.standardRunArtifacts.includes('thesis-review.md'));

assert.equal(getTool('fetch-sec').name, 'SEC filings collector');
assert.deepEqual(collectionSteps().map((tool) => tool.id), ['fetch-sec', 'fetch-news', 'fetch-market']);
assert.ok(initialSourceRows('TEST', {}).some((source) => source.id === 'trusted-news'));

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
assert.equal(templateSignal.priorThesisReview.accuracy, 'baseline_no_prior_call');

const templateBrief = readFileSync(new URL('../../stocks/_TEMPLATE/runs/YYYY-MM-DD/decision-brief.md', import.meta.url), 'utf8');
assert.ok(templateBrief.includes('## Collection and Tooling Notes'));

const templateMetadata = JSON.parse(readFileSync(new URL('../../stocks/_TEMPLATE/runs/YYYY-MM-DD/run-metadata.json', import.meta.url), 'utf8'));
assert.ok(Array.isArray(templateMetadata.toolRuns));
assert.ok(Array.isArray(templateMetadata.skippedSources));

console.log('Smoke tests passed.');
