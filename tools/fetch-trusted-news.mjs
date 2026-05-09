#!/usr/bin/env node
import path from 'node:path';
import { requireArg } from './lib/args.mjs';
import { ensureDir, readJson, stockDir, writeJson, writeText } from './lib/fs-utils.mjs';
import { fetchNewsApi, fetchRssFeed, filterRelevantNews } from './lib/news.mjs';

const ticker = requireArg('ticker').toUpperCase();
const dir = stockDir(ticker);
const profile = await readJson(path.join(dir, 'profile.json'));
const config = await readJson(path.join(process.cwd(), 'config', 'trusted-news-sources.json'));
const date = new Date().toISOString().slice(0, 10);
const rawDir = path.join(dir, 'data', 'raw', 'news');
await ensureDir(rawDir);

const failures = [];
let items = [];

try {
  items.push(...await fetchNewsApi(ticker, profile.company, config.newsApiDomains || []));
} catch (error) {
  failures.push({ source: 'NewsAPI', error: error.message });
}

for (const source of config.rssFeeds || []) {
  try {
    items.push(...await fetchRssFeed(source));
  } catch (error) {
    failures.push({ source: source.name, error: error.message });
  }
}

const relevant = filterRelevantNews(items, ticker, profile.company);
const rawPath = path.join(rawDir, `${ticker}-trusted-news-${date}.json`);
await writeJson(rawPath, { ticker, company: profile.company, fetchedAt: new Date().toISOString(), items: relevant, failures });

const md = [`# Trusted News Collection - ${ticker} - ${date}`, '', `Company: ${profile.company}`, '', '## Items', '', '| Published | Source | Tier | Title | URL |', '|---|---|---|---|---|'];
for (const item of relevant) {
  md.push(`| ${item.publishedAt || ''} | ${item.source || ''} | ${item.sourceTier || ''} | ${String(item.title || '').replaceAll('|', '-')} | ${item.url || ''} |`);
}
if (failures.length) {
  md.push('', '## Collection failures', '', ...failures.map((failure) => `- ${failure.source}: ${failure.error}`));
}
await writeText(path.join(dir, 'data', 'processed', `${ticker}-trusted-news-${date}.md`), md.join('\n'));
console.log(JSON.stringify({ ticker, rawPath, itemCount: relevant.length, failureCount: failures.length }, null, 2));
