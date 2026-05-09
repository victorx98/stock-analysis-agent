#!/usr/bin/env node
import assert from 'node:assert/strict';
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
console.log('Smoke tests passed.');
