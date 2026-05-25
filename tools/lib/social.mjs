import './env.mjs';

/**
 * Fetch recent posts from Reddit using public search JSON API.
 * 
 * @param {string} query The ticker symbol or query string.
 * @param {number} limit Maximum number of items to return.
 * @returns {Promise<Array>} List of normalized social lead items.
 */
export async function fetchRedditLeads(query, limit = 15) {
  // Reddit requires a specific, descriptive User-Agent, otherwise it returns a 429/403.
  const userAgent = process.env.SEC_USER_AGENT || 'stock-analysis-framework/1.0 (contact@example.com)';
  const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&sort=relevance&t=week&limit=${limit}`;

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': userAgent }
    });

    if (!response.ok) {
      throw new Error(`Reddit API responded with status ${response.status} (${response.statusText})`);
    }

    const data = await response.json();
    if (!data.data || !data.data.children) return [];

    return data.data.children.map((child) => {
      const p = child.data;
      return {
        id: `reddit-${p.id}`,
        platform: 'Reddit',
        subreddit: p.subreddit_name_prefixed,
        title: p.title,
        author: p.author,
        score: p.score,
        numComments: p.num_comments,
        url: `https://reddit.com${p.permalink}`,
        publishedAt: new Date(p.created_utc * 1000).toISOString(),
        summary: p.selftext ? p.selftext.slice(0, 300) + (p.selftext.length > 300 ? '...' : '') : ''
      };
    });
  } catch (error) {
    console.error('Failed to fetch Reddit leads:', error.message);
    throw error;
  }
}

/**
 * Fetch Twitter (X) posts using Google Custom Search Engine scoped to x.com.
 * This is stable, bypasses login walls, and gives 100 free queries a day.
 * 
 * @param {string} query The ticker symbol or query string.
 * @param {number} limit Maximum number of items to return.
 * @returns {Promise<Array>} List of normalized social lead items.
 */
export async function fetchTwitterLeads(query, limit = 10) {
  const cseId = process.env.GOOGLE_CSE_ID;
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!cseId || !apiKey) {
    throw new Error('Google CSE credentials (GOOGLE_CSE_ID, GOOGLE_API_KEY) are not set.');
  }

  // Target search on x.com (Twitter)
  const fullQuery = `site:x.com "${query}"`;
  const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${encodeURIComponent(fullQuery)}&num=${limit}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Google CSE API responded with status ${response.status} (${response.statusText})`);
    }

    const data = await response.json();
    if (!data.items) return [];

    return data.items.map((item, index) => {
      return {
        id: `twitter-${index}-${Date.now()}`,
        platform: 'X (Twitter)',
        subreddit: 'N/A',
        title: item.title || 'X post',
        author: 'N/A',
        score: 0,
        numComments: 0,
        url: item.link,
        publishedAt: new Date().toISOString(), // CSE doesn't always provide structured metadata dates
        summary: item.snippet || ''
      };
    });
  } catch (error) {
    console.error('Failed to fetch Twitter leads via Google CSE:', error.message);
    throw error;
  }
}
