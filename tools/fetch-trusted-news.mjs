#!/usr/bin/env node
import './lib/env.mjs';
import path from 'node:path';
import { requireArg } from './lib/args.mjs';
import { ensureDir, readJson, repoRelative, stockDir, writeJson, writeText } from './lib/fs-utils.mjs';
import { fetchAlphaVantageNewsSentiment, fetchMassiveNews, fetchNewsApi, fetchRssFeed, filterRelevantNews } from './lib/news.mjs';

const ticker = requireArg('ticker').toUpperCase();
const dir = stockDir(ticker);
const profile = await readJson(path.join(dir, 'profile.json'));
const config = await readJson(path.join(process.cwd(), 'config', 'trusted-news-sources.json'));
const date = new Date().toISOString().slice(0, 10);
const rawDir = path.join(dir, 'data', 'raw', 'news');
await ensureDir(rawDir);

const failures = [];
const skippedSources = [];
const sourcesUsed = [];
let items = [];

if (process.env.MASSIVE_API_KEY) {
  try {
    const massiveItems = await fetchMassiveNews(ticker, 50);
    items.push(...massiveItems);
    sourcesUsed.push({
      id: 'massive-news',
      source: 'Massive stock news',
      type: 'News/catalyst with ticker sentiment',
      tier: 'secondary-market-data-news',
      pathOrUrl: 'https://massive.com/docs/rest/stocks/news',
      status: 'collected',
      notes: `${massiveItems.length} ticker-scoped items before relevance filtering.`
    });
  } catch (error) {
    failures.push({
      source: 'Massive',
      attemptedMethod: 'Stock news endpoint',
      error: error.message,
      impact: 'Massive stock news was not available for this run.',
      fallback: 'Use Alpha Vantage news sentiment, NewsAPI, configured RSS feeds, and manual primary-source review.',
      severity: 'warning'
    });
  }
} else {
  skippedSources.push({
    source: 'Massive',
    attemptedMethod: 'Stock news endpoint',
    reason: 'MASSIVE_API_KEY is not set.',
    impact: 'Optional ticker-scoped Massive news collection was skipped.',
    fallback: 'Use Alpha Vantage news sentiment, NewsAPI, and configured RSS feeds.'
  });
}

if (process.env.ALPHA_VANTAGE_API_KEY) {
  try {
    const alphaItems = await fetchAlphaVantageNewsSentiment(ticker, 50);
    items.push(...alphaItems);
    sourcesUsed.push({
      id: 'alpha-vantage-news-sentiment',
      source: 'Alpha Vantage news sentiment',
      type: 'News/catalyst with sentiment',
      tier: 'secondary-market-data-news',
      pathOrUrl: 'https://www.alphavantage.co/documentation/#news-sentiment',
      status: 'collected',
      notes: `${alphaItems.length} ticker-scoped items before relevance filtering.`
    });
  } catch (error) {
    failures.push({
      source: 'Alpha Vantage',
      attemptedMethod: 'NEWS_SENTIMENT endpoint',
      error: error.message,
      impact: 'Alpha Vantage news sentiment was not available for this run.',
      fallback: 'Use Massive news, NewsAPI, configured RSS feeds, and manual primary-source review.',
      severity: 'warning'
    });
  }
} else {
  skippedSources.push({
    source: 'Alpha Vantage',
    attemptedMethod: 'NEWS_SENTIMENT endpoint',
    reason: 'ALPHA_VANTAGE_API_KEY is not set.',
    impact: 'Optional Alpha Vantage news sentiment collection was skipped.',
    fallback: 'Use Massive news, NewsAPI, and configured RSS feeds.'
  });
}

if (process.env.NEWSAPI_API_KEY) {
  try {
    const newsApiItems = await fetchNewsApi(ticker, profile.company, config.newsApiDomains || []);
    items.push(...newsApiItems);
    sourcesUsed.push({
      id: 'newsapi',
      source: 'NewsAPI whitelisted domains',
      type: 'News/catalyst',
      tier: 'secondary-newsapi-whitelisted',
      pathOrUrl: 'https://newsapi.org/v2/everything',
      status: 'collected',
      notes: `${newsApiItems.length} items before ticker relevance filtering.`
    });
  } catch (error) {
    failures.push({
      source: 'NewsAPI',
      attemptedMethod: 'NewsAPI everything endpoint',
      error: error.message,
      impact: 'NewsAPI articles were not available for this run.',
      fallback: 'Use configured RSS feeds and primary company/regulatory sources.',
      severity: 'warning'
    });
  }
} else {
  skippedSources.push({
    source: 'NewsAPI',
    attemptedMethod: 'NewsAPI everything endpoint',
    reason: 'NEWSAPI_API_KEY is not set.',
    impact: 'Optional whitelisted-domain NewsAPI collection was skipped.',
    fallback: 'Configured RSS feeds are still collected.'
  });
}

for (const source of config.rssFeeds || []) {
  try {
    const feedItems = await fetchRssFeed(source);
    items.push(...feedItems);
    sourcesUsed.push({
      id: `rss-${String(source.name || source.url).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      source: source.name,
      type: 'Trusted RSS feed',
      tier: source.tier || '2',
      pathOrUrl: source.url,
      status: 'collected',
      notes: `${feedItems.length} feed items before ticker relevance filtering.`
    });
  } catch (error) {
    failures.push({
      source: source.name,
      attemptedMethod: 'RSS feed',
      error: error.message,
      impact: 'This feed did not contribute news items for the run.',
      fallback: 'Use other configured feeds or manual primary-source review if material news coverage is missing.',
      severity: 'warning'
    });
    sourcesUsed.push({
      id: `rss-${String(source.name || source.url).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      source: source.name,
      type: 'Trusted RSS feed',
      tier: source.tier || '2',
      pathOrUrl: source.url,
      status: 'failed',
      notes: error.message
    });
  }
}

const relevant = filterRelevantNews(items, ticker, profile.company);
const rawPath = path.join(rawDir, `${ticker}-trusted-news-${date}.json`);
await writeJson(rawPath, { ticker, company: profile.company, fetchedAt: new Date().toISOString(), items: relevant, sourcesUsed, skippedSources, failures });

const md = [`# Trusted News Collection - ${ticker} - ${date}`, '', `Company: ${profile.company}`, '', '## Items', '', '| Published | Source | Tier | Sentiment | Title | URL |', '|---|---|---|---|---|---|'];
for (const item of relevant) {
  md.push(`| ${item.publishedAt || ''} | ${item.source || ''} | ${item.sourceTier || ''} | ${item.sentiment || ''} | ${String(item.title || '').replaceAll('|', '-')} | ${item.url || ''} |`);
}
if (failures.length) {
  md.push('', '## Collection failures', '', ...failures.map((failure) => `- ${failure.source}: ${failure.error}`));
}
if (skippedSources.length) {
  md.push('', '## Skipped sources', '', ...skippedSources.map((source) => `- ${source.source}: ${source.reason}`));
}
await writeText(path.join(dir, 'data', 'processed', `${ticker}-trusted-news-${date}.md`), md.join('\n'));
console.log(JSON.stringify({
  tool: 'fetch-news',
  ticker,
  rawPath: repoRelative(rawPath),
  sourceFiles: [
    repoRelative(rawPath),
    repoRelative(path.join(dir, 'data', 'processed', `${ticker}-trusted-news-${date}.md`))
  ],
  sourcesUsed: [
    ...sourcesUsed,
    {
      id: 'trusted-news',
      source: 'Trusted news raw collection',
      type: 'News/catalyst',
      tier: 'mixed',
      pathOrUrl: repoRelative(rawPath),
      status: failures.length ? 'partial' : 'collected',
      notes: `${relevant.length} ticker-relevant items after filtering.`
    }
  ],
  skippedSources,
  failures,
  itemCount: relevant.length,
  failureCount: failures.length
}, null, 2));
