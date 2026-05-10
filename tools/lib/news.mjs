import { fetchAlphaVantageJson } from './alpha-vantage.mjs';

function stripXml(value = '') {
  return value.replace(/<!\[CDATA\[/g, '').replace(/\]\]>/g, '').replace(/<[^>]+>/g, '').trim();
}

function tag(block, name) {
  const match = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'i'));
  return match ? stripXml(match[1]) : '';
}

function alphaVantageTime(value) {
  const match = String(value || '').match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})?/);
  if (!match) return value || '';
  const [, year, month, day, hour, minute, second = '00'] = match;
  return `${year}-${month}-${day}T${hour}:${minute}:${second}Z`;
}

export async function fetchRssFeed(source) {
  const response = await fetch(source.url, { headers: { Accept: 'application/rss+xml, application/xml, text/xml' } });
  if (!response.ok) throw new Error(`RSS request failed for ${source.name}: ${response.status}`);
  const xml = await response.text();
  const itemBlocks = xml.match(/<item[\s\S]*?<\/item>/gi) || xml.match(/<entry[\s\S]*?<\/entry>/gi) || [];
  return itemBlocks.map((block) => ({
    source: source.name,
    sourceTier: source.tier,
    title: tag(block, 'title'),
    url: tag(block, 'link') || (block.match(/<link[^>]+href="([^"]+)"/i)?.[1] ?? ''),
    publishedAt: tag(block, 'pubDate') || tag(block, 'updated') || tag(block, 'published'),
    description: tag(block, 'description') || tag(block, 'summary'),
    collectionMethod: 'rss'
  }));
}

export async function fetchMassiveNews(ticker, limit = 50) {
  const apiKey = process.env.MASSIVE_API_KEY;
  if (!apiKey) return [];
  const baseUrl = process.env.MASSIVE_BASE_URL || 'https://api.massive.com';
  const url = new URL('/v2/reference/news', baseUrl);
  url.searchParams.set('ticker', ticker.toUpperCase());
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('order', 'desc');
  url.searchParams.set('sort', 'published_utc');

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${apiKey}`
    }
  });
  if (!response.ok) throw new Error(`Massive news request failed: ${response.status}`);
  const data = await response.json();
  if (String(data.status || '').toUpperCase() === 'ERROR') {
    throw new Error(data.error || data.message || 'Massive returned an error response.');
  }

  return (data.results || []).map((article) => {
    const tickerInsight = (article.insights || []).find((insight) => String(insight.ticker || '').toUpperCase() === ticker.toUpperCase());
    return {
      source: article.publisher?.name ?? 'Massive',
      sourceTier: 'secondary-massive',
      title: article.title,
      url: article.article_url,
      publishedAt: article.published_utc,
      description: article.description,
      collectionMethod: 'massive_news',
      tickers: article.tickers || [],
      sentiment: tickerInsight?.sentiment || '',
      sentimentReasoning: tickerInsight?.sentiment_reasoning || '',
      providerId: article.id || ''
    };
  });
}

export async function fetchAlphaVantageNewsSentiment(ticker, limit = 50) {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  if (!apiKey) return [];
  const url = new URL('https://www.alphavantage.co/query');
  url.searchParams.set('function', 'NEWS_SENTIMENT');
  url.searchParams.set('tickers', ticker.toUpperCase());
  url.searchParams.set('sort', 'LATEST');
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('apikey', apiKey);

  const data = await fetchAlphaVantageJson(url, { label: 'news sentiment' });
  return (data.feed || []).map((article) => {
    const tickerSentiment = (article.ticker_sentiment || []).find((sentiment) => String(sentiment.ticker || '').toUpperCase() === ticker.toUpperCase());
    return {
      source: article.source || article.source_domain || 'Alpha Vantage',
      sourceTier: 'secondary-alpha-vantage-news-sentiment',
      title: article.title,
      url: article.url,
      publishedAt: alphaVantageTime(article.time_published),
      description: article.summary,
      collectionMethod: 'alpha_vantage_news_sentiment',
      tickers: (article.ticker_sentiment || []).map((sentiment) => sentiment.ticker).filter(Boolean),
      topics: (article.topics || []).map((topic) => topic.topic).filter(Boolean),
      sentiment: tickerSentiment?.ticker_sentiment_label || article.overall_sentiment_label || '',
      sentimentScore: tickerSentiment?.ticker_sentiment_score || article.overall_sentiment_score || '',
      relevanceScore: tickerSentiment?.relevance_score || '',
      sourceDomain: article.source_domain || ''
    };
  });
}

export async function fetchNewsApi(ticker, company, domains) {
  const apiKey = process.env.NEWSAPI_API_KEY;
  if (!apiKey) return [];
  const query = `(${ticker} OR "${company}")`;
  const url = new URL('https://newsapi.org/v2/everything');
  url.searchParams.set('q', query);
  url.searchParams.set('language', 'en');
  url.searchParams.set('sortBy', 'publishedAt');
  url.searchParams.set('pageSize', '50');
  url.searchParams.set('domains', domains.join(','));
  url.searchParams.set('apiKey', apiKey);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`NewsAPI request failed: ${response.status}`);
  const data = await response.json();
  return (data.articles || []).map((article) => ({
    source: article.source?.name ?? '',
    sourceTier: 'secondary-newsapi-whitelisted',
    title: article.title,
    url: article.url,
    publishedAt: article.publishedAt,
    description: article.description,
    collectionMethod: 'newsapi'
  }));
}

export function filterRelevantNews(items, ticker, company) {
  const terms = [ticker.toLowerCase(), ...company.toLowerCase().split(/\s+/).filter((part) => part.length > 3)];
  const seen = new Set();
  return items.filter((item) => {
    const haystack = `${item.title || ''} ${item.description || ''} ${(item.tickers || []).join(' ')}`.toLowerCase();
    const providerTickerMatch = (item.tickers || []).some((candidate) => String(candidate).toUpperCase() === ticker.toUpperCase());
    const relevant = providerTickerMatch || terms.some((term) => haystack.includes(term));
    const key = item.url || item.title;
    if (!relevant || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
