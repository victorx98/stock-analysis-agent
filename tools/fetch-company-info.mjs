#!/usr/bin/env node
import './lib/env.mjs';
import path from 'node:path';
import { requireArg } from './lib/args.mjs';
import { ensureDir, readJson, repoRelative, stockDir, writeJson, writeText } from './lib/fs-utils.mjs';
import { fetchAlphaVantageCompanyOverview, fetchMassiveTickerOverview, summarizeCompanyInfo } from './lib/company-info.mjs';

const ticker = requireArg('ticker').toUpperCase();
const dir = stockDir(ticker);
const profile = await readJson(path.join(dir, 'profile.json'));
const date = new Date().toISOString().slice(0, 10);
const rawDir = path.join(dir, 'data', 'raw', 'company-info');
const processedDir = path.join(dir, 'data', 'processed');
await ensureDir(rawDir);
await ensureDir(processedDir);

const failures = [];
const skippedSources = [];
const sourcesUsed = [];
let massiveTickerOverview = null;
let alphaVantageOverview = null;

if (process.env.MASSIVE_API_KEY) {
  try {
    massiveTickerOverview = await fetchMassiveTickerOverview(ticker);
    sourcesUsed.push({
      id: 'massive-ticker-overview',
      source: 'Massive ticker overview',
      type: 'Company profile / market capitalization / share count',
      tier: 'market data',
      pathOrUrl: 'https://massive.com/docs/rest/stocks/tickers/ticker-overview',
      status: 'collected',
      notes: 'Ticker reference details, market cap, shares, SIC, exchange, employees, and description when available.'
    });
  } catch (error) {
    failures.push({
      source: 'Massive',
      attemptedMethod: 'Ticker overview endpoint',
      error: error.message,
      impact: 'Massive company profile and share-count fields were not available for this run.',
      fallback: 'Use Alpha Vantage overview, SEC filings, and profile.json.',
      severity: 'warning'
    });
  }
} else {
  skippedSources.push({
    source: 'Massive',
    attemptedMethod: 'Ticker overview endpoint',
    reason: 'MASSIVE_API_KEY is not set.',
    impact: 'Optional Massive company profile collection was skipped.',
    fallback: 'Use Alpha Vantage overview, SEC filings, and profile.json.'
  });
}

if (process.env.ALPHA_VANTAGE_API_KEY) {
  try {
    alphaVantageOverview = await fetchAlphaVantageCompanyOverview(ticker);
    sourcesUsed.push({
      id: 'alpha-vantage-company-overview',
      source: 'Alpha Vantage company overview',
      type: 'Company profile / valuation metrics / profitability metrics',
      tier: 'market data',
      pathOrUrl: 'https://www.alphavantage.co/documentation/#company-overview',
      status: 'collected',
      notes: 'Sector, industry, market cap, valuation multiples, profitability, revenue, EPS, beta, dividend yield, and analyst target when available.'
    });
  } catch (error) {
    failures.push({
      source: 'Alpha Vantage',
      attemptedMethod: 'OVERVIEW endpoint',
      error: error.message,
      impact: 'Alpha Vantage company overview metrics were not available for this run.',
      fallback: 'Use Massive ticker overview, SEC filings, and profile.json.',
      severity: 'warning'
    });
  }
} else {
  skippedSources.push({
    source: 'Alpha Vantage',
    attemptedMethod: 'OVERVIEW endpoint',
    reason: 'ALPHA_VANTAGE_API_KEY is not set.',
    impact: 'Optional Alpha Vantage company overview collection was skipped.',
    fallback: 'Use Massive ticker overview, SEC filings, and profile.json.'
  });
}

const summary = summarizeCompanyInfo({ ticker, profile, massiveTickerOverview, alphaVantageOverview });
const rawPath = path.join(rawDir, `${ticker}-company-info-${date}.json`);
const summaryPath = path.join(processedDir, `${ticker}-company-info-${date}.json`);
const markdownPath = path.join(processedDir, `${ticker}-company-info-${date}.md`);

await writeJson(rawPath, {
  ticker,
  company: profile.company,
  fetchedAt: new Date().toISOString(),
  massiveTickerOverview,
  alphaVantageOverview,
  sourcesUsed,
  skippedSources,
  failures
});
await writeJson(summaryPath, {
  ticker,
  computedAt: new Date().toISOString(),
  summary
});

function valueCell(value) {
  if (value === undefined || value === null || value === '') return '';
  if (typeof value === 'number') return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(4)));
  return String(value).replaceAll('|', '-').replace(/\s+/g, ' ').trim();
}

const rows = [
  ['Company', summary.company],
  ['Description', summary.description],
  ['Homepage', summary.homepageUrl],
  ['Exchange', summary.exchange],
  ['Currency', summary.currency],
  ['Sector', summary.sector],
  ['Industry / SIC', summary.industry],
  ['Market capitalization', summary.marketCapitalization],
  ['Shares outstanding', summary.sharesOutstanding],
  ['Employees', summary.employees],
  ['P/E', summary.peRatio],
  ['Forward P/E', summary.forwardPe],
  ['PEG', summary.pegRatio],
  ['Price / sales TTM', summary.priceToSalesRatioTtm],
  ['Price / book', summary.priceToBookRatio],
  ['EV / revenue', summary.evToRevenue],
  ['EV / EBITDA', summary.evToEbitda],
  ['Profit margin', summary.profitMargin],
  ['Operating margin TTM', summary.operatingMarginTtm],
  ['Revenue TTM', summary.revenueTtm],
  ['Gross profit TTM', summary.grossProfitTtm],
  ['EBITDA', summary.ebitda],
  ['EPS', summary.eps],
  ['Beta', summary.beta],
  ['Dividend yield', summary.dividendYield],
  ['Analyst target price', summary.analystTargetPrice],
  ['Latest quarter', summary.latestQuarter]
];

const md = [`# Company Info Collection - ${ticker} - ${date}`, '', `Company: ${profile.company}`, '', '| Field | Value |', '|---|---|'];
for (const [field, value] of rows) md.push(`| ${field} | ${valueCell(value)} |`);
if (failures.length) {
  md.push('', '## Collection failures', '', ...failures.map((failure) => `- ${failure.source}: ${failure.error}`));
}
if (skippedSources.length) {
  md.push('', '## Skipped sources', '', ...skippedSources.map((source) => `- ${source.source}: ${source.reason}`));
}
await writeText(markdownPath, md.join('\n'));

console.log(JSON.stringify({
  tool: 'fetch-company-info',
  ticker,
  rawPath: repoRelative(rawPath),
  summaryPath: repoRelative(summaryPath),
  sourceFiles: [repoRelative(rawPath), repoRelative(summaryPath), repoRelative(markdownPath)],
  sourcesUsed: [
    ...sourcesUsed,
    {
      id: 'company-info',
      source: 'Company info raw collection',
      type: 'Company profile / valuation inputs',
      tier: 'mixed',
      pathOrUrl: repoRelative(rawPath),
      status: failures.length ? 'partial' : 'collected',
      notes: `${sourcesUsed.length} provider source(s) collected.`
    }
  ],
  skippedSources,
  failures,
  itemCount: sourcesUsed.length,
  failureCount: failures.length
}, null, 2));
