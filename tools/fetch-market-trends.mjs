#!/usr/bin/env node
import path from 'node:path';
import { requireArg } from './lib/args.mjs';
import { ensureDir, repoRelative, stockDir, writeJson, writeText } from './lib/fs-utils.mjs';
import { computeTrendMetrics, fetchDailyPricesWithSource } from './lib/market.mjs';

const ticker = requireArg('ticker').toUpperCase();
const dir = stockDir(ticker);
const date = new Date().toISOString().slice(0, 10);
const rawDir = path.join(dir, 'data', 'raw', 'market');
await ensureDir(rawDir);

const { provider, sourceUrl, prices } = await fetchDailyPricesWithSource(ticker);
const metrics = computeTrendMetrics(prices);
const rawPath = path.join(rawDir, `${ticker}-daily-prices-${date}.json`);
const metricsPath = path.join(dir, 'data', 'processed', `${ticker}-trend-metrics-${date}.json`);
await writeJson(rawPath, { ticker, fetchedAt: new Date().toISOString(), provider, sourceUrl, prices });
await writeJson(metricsPath, { ticker, computedAt: new Date().toISOString(), metrics });

const md = [`# Market Trend Metrics - ${ticker} - ${date}`, '', '| Metric | Value |', '|---|---:|'];
for (const [key, value] of Object.entries(metrics)) {
  md.push(`| ${key} | ${value ?? ''} |`);
}
await writeText(path.join(dir, 'data', 'processed', `${ticker}-trend-metrics-${date}.md`), md.join('\n'));
console.log(JSON.stringify({
  tool: 'fetch-market',
  ticker,
  provider,
  rawPath: repoRelative(rawPath),
  metricsPath: repoRelative(metricsPath),
  sourceFiles: [repoRelative(rawPath), repoRelative(metricsPath), repoRelative(path.join(dir, 'data', 'processed', `${ticker}-trend-metrics-${date}.md`))],
  sourcesUsed: [
    {
      id: 'market-prices',
      source: `${provider} daily prices`,
      type: 'Price data',
      tier: 'market data',
      pathOrUrl: sourceUrl,
      status: 'collected',
      notes: `${prices.length} daily price rows; trend label ${metrics.trendLabel}.`
    }
  ],
  skippedSources: [],
  failures: [],
  trendLabel: metrics.trendLabel
}, null, 2));
