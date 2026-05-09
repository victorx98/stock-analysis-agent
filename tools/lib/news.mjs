function stripXml(value = '') {
  return value.replace(/<!\[CDATA\[/g, '').replace(/\]\]>/g, '').replace(/<[^>]+>/g, '').trim();
}

function tag(block, name) {
  const match = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'i'));
  return match ? stripXml(match[1]) : '';
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
    const haystack = `${item.title || ''} ${item.description || ''}`.toLowerCase();
    const relevant = terms.some((term) => haystack.includes(term));
    const key = item.url || item.title;
    if (!relevant || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
