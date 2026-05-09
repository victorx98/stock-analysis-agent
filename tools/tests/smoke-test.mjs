#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { computeTrendMetrics } from '../lib/market.mjs';
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

const templateSignal = JSON.parse(readFileSync(new URL('../../stocks/_TEMPLATE/runs/YYYY-MM-DD/signal.json', import.meta.url), 'utf8'));
assert.equal(templateSignal.valuationAssessment.classification, 'valuation_uncertain');
assert.equal(templateSignal.leadershipAssessment.classification, 'leadership_unknown');
assert.equal(templateSignal.priorThesisReview.accuracy, 'baseline_no_prior_call');

console.log('Smoke tests passed.');
