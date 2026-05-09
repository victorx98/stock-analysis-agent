#!/usr/bin/env node
import path from 'node:path';
import { requireArg } from './lib/args.mjs';
import { ensureDir, stockDir, writeJson, writeText } from './lib/fs-utils.mjs';
import { computeTrendMetrics, fetchDailyPrices } from './lib/market.mjs';

const ticker = requireArg('ticker').toUpperCase();
const dir = stockDir(ticker);
const date = new Date().toISOString().slice(0, 10);
const rawDir = path.join(dir, 'data', 'raw', 'market');
await ensureDir(rawDir);

const prices = await fetchDailyPrices(ticker);
const metrics = computeTrendMetrics(prices);
const rawPath = path.join(rawDir, `${ticker}-daily-prices-${date}.json`);
const metricsPath = path.join(dir, 'data', 'processed', `${ticker}-trend-metrics-${date}.json`);
await writeJson(rawPath, { ticker, fetchedAt: new Date().toISOString(), prices });
await writeJson(metricsPath, { ticker, computedAt: new Date().toISOString(), metrics });

const md = [`# Market Trend Metrics - ${ticker} - ${date}`, '', '| Metric | Value |', '|---|---:|'];
for (const [key, value] of Object.entries(metrics)) {
  md.push(`| ${key} | ${value ?? ''} |`);
}
await writeText(path.join(dir, 'data', 'processed', `${ticker}-trend-metrics-${date}.md`), md.join('\n'));
console.log(JSON.stringify({ ticker, rawPath, metricsPath, trendLabel: metrics.trendLabel }, null, 2));
