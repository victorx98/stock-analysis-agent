#!/usr/bin/env node
import './lib/env.mjs';
import path from 'node:path';
import { requireArg } from './lib/args.mjs';
import { ensureDir, readJson, repoRelative, stockDir, writeJson, writeText } from './lib/fs-utils.mjs';
import { fetchRedditLeads, fetchTwitterLeads } from './lib/social.mjs';

const ticker = requireArg('ticker').toUpperCase();
const dir = stockDir(ticker);
const profile = await readJson(path.join(dir, 'profile.json'));
const date = new Date().toISOString().slice(0, 10);
const rawDir = path.join(dir, 'data', 'raw', 'social');
await ensureDir(rawDir);

const failures = [];
const skippedSources = [];
const sourcesUsed = [];
const items = [];

// 1. Fetch Reddit Leads
try {
  const redditItems = await fetchRedditLeads(ticker, 15);
  items.push(...redditItems);
  sourcesUsed.push({
    id: 'reddit-search',
    source: 'Reddit search endpoint',
    type: 'Community sentiment leads',
    tier: '3A',
    pathOrUrl: `https://www.reddit.com/search.json?q=${ticker}`,
    status: 'collected',
    notes: `${redditItems.length} Reddit threads gathered.`
  });
} catch (error) {
  failures.push({
    source: 'Reddit',
    attemptedMethod: 'Public Search JSON',
    error: error.message,
    severity: 'warning'
  });
}

// 2. Fetch Twitter Leads
if (process.env.GOOGLE_API_KEY && process.env.GOOGLE_CSE_ID) {
  try {
    const twitterItems = await fetchTwitterLeads(ticker, 10);
    items.push(...twitterItems);
    sourcesUsed.push({
      id: 'google-cse-twitter',
      source: 'Google CSE (x.com)',
      type: 'Social sentiment leads',
      tier: '3A',
      pathOrUrl: 'https://www.googleapis.com/customsearch/v1',
      status: 'collected',
      notes: `${twitterItems.length} X.com search index results gathered.`
    });
  } catch (error) {
    failures.push({
      source: 'X (Twitter) CSE',
      attemptedMethod: 'Google Custom Search Engine API',
      error: error.message,
      severity: 'warning'
    });
  }
} else {
  skippedSources.push({
    source: 'X (Twitter) CSE',
    attemptedMethod: 'Google Custom Search Engine API',
    reason: 'GOOGLE_API_KEY or GOOGLE_CSE_ID is not configured in .env',
    fallback: 'Add GOOGLE_API_KEY and GOOGLE_CSE_ID to .env to enable X.com sentiment leads.'
  });
}

// Save raw JSON
const rawPath = path.join(rawDir, `${ticker}-social-leads-${date}.json`);
await writeJson(rawPath, {
  ticker,
  company: profile.company,
  fetchedAt: new Date().toISOString(),
  items,
  sourcesUsed,
  skippedSources,
  failures
});

// Format processed Markdown for analysts and AI review
const md = [
  `# Social Media & Community Leads - ${ticker} - ${date}`,
  `*Company*: ${profile.company}`,
  '',
  '## Community Leads Summary',
  '',
  '| Platform | Subreddit / Source | Title / Snippet | Link | Metric |',
  '|---|---|---|---|---|'
];

for (const item of items) {
  const metric = item.platform === 'Reddit' ? `Score: ${item.score} / Comments: ${item.numComments}` : 'N/A';
  const desc = item.summary ? `**${item.title}** - ${item.summary}` : item.title;
  md.push(`| ${item.platform} | ${item.subreddit || 'N/A'} | ${desc.replaceAll('|', '-').replaceAll('\n', ' ')} | [Link](${item.url}) | ${metric} |`);
}

if (failures.length) {
  md.push('', '## Collection failures', '', ...failures.map((f) => `- ${f.source}: ${f.error}`));
}
if (skippedSources.length) {
  md.push('', '## Skipped sources', '', ...skippedSources.map((s) => `- ${s.source}: ${s.reason}`));
}

const processedPath = path.join(dir, 'data', 'processed', `${ticker}-social-leads-${date}.md`);
await writeText(processedPath, md.join('\n'));

// Print standard JSON payload for run-pipeline.mjs
console.log(JSON.stringify({
  tool: 'fetch-social-leads',
  ticker,
  rawPath: repoRelative(rawPath),
  sourceFiles: [
    repoRelative(rawPath),
    repoRelative(processedPath)
  ],
  sourcesUsed: [
    ...sourcesUsed,
    {
      id: 'social-leads',
      source: 'Social media raw collection',
      type: 'Community sentiment leads',
      tier: '3A',
      pathOrUrl: repoRelative(rawPath),
      status: failures.length ? 'partial' : 'collected',
      notes: `${items.length} community leads gathered.`
    }
  ],
  skippedSources,
  failures,
  itemCount: items.length,
  failureCount: failures.length
}, null, 2));
