#!/usr/bin/env node
import path from 'node:path';
import { getArg, requireArg } from './lib/args.mjs';
import { ensureDir, readJson, repoRelative, stockDir, writeJson, writeText } from './lib/fs-utils.mjs';
import { fetchSubmissionsByCik, resolveTicker, summarizeRecentFilings } from './lib/sec.mjs';

const ticker = requireArg('ticker').toUpperCase();
const limit = Number(getArg('limit', '40'));
const dir = stockDir(ticker);
const profilePath = path.join(dir, 'profile.json');
let profile = await readJson(profilePath);
let resolvedFromSecTickerMap = false;

if (!profile.cik) {
  const resolved = await resolveTicker(ticker);
  profile = { ...profile, company: profile.company === 'Company Name' ? resolved.company : profile.company, cik: resolved.cik };
  await writeJson(profilePath, profile);
  resolvedFromSecTickerMap = true;
}

const { url, data } = await fetchSubmissionsByCik(profile.cik);
const rawDir = path.join(dir, 'data', 'raw', 'sec');
await ensureDir(rawDir);
const date = new Date().toISOString().slice(0, 10);
const rawPath = path.join(rawDir, `${ticker}-submissions-${date}.json`);
const summaryPath = path.join(dir, 'data', 'processed', `${ticker}-recent-filings-${date}.json`);
await writeJson(rawPath, { sourceUrl: url, fetchedAt: new Date().toISOString(), data });
await writeJson(summaryPath, summarizeRecentFilings(data, limit));

const md = ['# Recent SEC Filings', '', `Ticker: ${ticker}`, `CIK: ${profile.cik}`, `Source: ${url}`, '', '| Form | Filing date | Report date | Accession | Primary document |', '|---|---|---|---|---|'];
for (const filing of summarizeRecentFilings(data, limit)) {
  md.push(`| ${filing.form || ''} | ${filing.filingDate || ''} | ${filing.reportDate || ''} | ${filing.accessionNumber || ''} | ${filing.primaryDocument || ''} |`);
}
await writeText(path.join(dir, 'data', 'processed', `${ticker}-recent-filings-${date}.md`), md.join('\n'));
console.log(JSON.stringify({
  tool: 'fetch-sec',
  ticker,
  rawPath: repoRelative(rawPath),
  summaryPath: repoRelative(summaryPath),
  sourceFiles: [
    repoRelative(rawPath),
    repoRelative(summaryPath),
    repoRelative(path.join(dir, 'data', 'processed', `${ticker}-recent-filings-${date}.md`))
  ],
  sourcesUsed: [
    ...(resolvedFromSecTickerMap ? [{
      id: 'sec-ticker-map',
      source: 'SEC company ticker map',
      type: 'Ticker to CIK resolution',
      tier: '1',
      pathOrUrl: 'https://www.sec.gov/files/company_tickers.json',
      status: 'collected',
      notes: `Resolved ${ticker} to CIK ${profile.cik}.`
    }] : []),
    {
      id: 'sec-submissions',
      source: 'SEC submissions metadata',
      type: 'Filing metadata',
      tier: '1',
      pathOrUrl: url,
      status: 'collected',
      notes: `Stored raw submissions and ${summarizeRecentFilings(data, limit).length} recent filing summaries.`
    }
  ],
  skippedSources: [],
  failures: []
}, null, 2));
