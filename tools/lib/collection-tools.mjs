export const COLLECTION_TOOL_REGISTRY_VERSION = '3';

export const COLLECTION_TOOLS = [
  {
    id: 'create-run',
    name: 'Run artifact creator',
    category: 'run-prep',
    required: true,
    command: ['node', 'tools/create-run-analysis.mjs'],
    npmCommand: 'npm run create:run -- --ticker {ticker}',
    description: 'Creates the run folder and standard analysis artifacts.'
  },
  {
    id: 'fetch-sec',
    name: 'SEC filings collector',
    category: 'collection',
    required: true,
    command: ['node', 'tools/fetch-sec-filings.mjs'],
    npmCommand: 'npm run fetch:sec -- --ticker {ticker}',
    description: 'Downloads SEC submissions metadata and recent filing summaries.',
    sourceTemplates: [
      {
        id: 'sec-submissions',
        source: 'SEC submissions',
        type: 'Filing metadata',
        tier: '1',
        pathOrUrl: 'stocks/{ticker}/data/raw/sec/',
        status: 'pending collection',
        notes: 'SEC submissions API metadata for recent filings.'
      }
    ]
  },
  {
    id: 'fetch-company-info',
    name: 'Company info collector',
    category: 'collection',
    required: false,
    command: ['node', 'tools/fetch-company-info.mjs'],
    npmCommand: 'npm run fetch:info -- --ticker {ticker}',
    description: 'Collects company profile, share-count, market cap, and valuation inputs from Massive and Alpha Vantage when configured.',
    sourceTemplates: [
      {
        id: 'company-info',
        source: 'Company info APIs',
        type: 'Company profile / valuation inputs',
        tier: 'market data',
        pathOrUrl: 'stocks/{ticker}/data/raw/company-info/',
        status: 'pending collection',
        notes: 'Massive ticker overview and Alpha Vantage company overview when API keys are configured.'
      }
    ]
  },
  {
    id: 'fetch-news',
    name: 'Trusted news collector',
    category: 'collection',
    required: false,
    command: ['node', 'tools/fetch-trusted-news.mjs'],
    npmCommand: 'npm run fetch:news -- --ticker {ticker}',
    description: 'Collects trusted-source news from Massive, Alpha Vantage, optional NewsAPI, and configured RSS feeds.',
    sourceTemplates: [
      {
        id: 'trusted-news',
        source: 'Trusted news',
        type: 'News/catalyst',
        tier: '2',
        pathOrUrl: 'stocks/{ticker}/data/raw/news/',
        status: 'pending collection',
        notes: 'Massive news, Alpha Vantage news sentiment, configured trusted news feeds, and optional NewsAPI results.'
      }
    ]
  },
  {
    id: 'fetch-market',
    name: 'Market trend collector',
    category: 'collection',
    required: true,
    command: ['node', 'tools/fetch-market-trends.mjs'],
    npmCommand: 'npm run fetch:market -- --ticker {ticker}',
    description: 'Collects daily prices from Massive, Alpha Vantage, or Stooq fallback and computes technical trend metrics.',
    sourceTemplates: [
      {
        id: 'market-prices',
        source: 'Market trend',
        type: 'Price data',
        tier: 'market data',
        pathOrUrl: 'stocks/{ticker}/data/raw/market/',
        status: 'pending collection',
        notes: 'Daily price history and derived market trend metrics from the first available configured provider.'
      }
    ]
  }
];

export function collectionSteps() {
  return COLLECTION_TOOLS.filter((tool) => tool.category === 'collection');
}

export function getTool(toolId) {
  const tool = COLLECTION_TOOLS.find((candidate) => candidate.id === toolId);
  if (!tool) throw new Error(`Unknown collection tool: ${toolId}`);
  return tool;
}

export function commandForTool(tool, ticker, options = {}) {
  const args = [...tool.command.slice(1), '--ticker', ticker.toUpperCase()];
  if (options.date) args.push('--date', options.date);
  return {
    command: tool.command[0],
    args,
    display: `${tool.command[0]} ${args.join(' ')}`
  };
}

export function npmCommandForTool(tool, ticker) {
  return tool.npmCommand.replaceAll('{ticker}', ticker.toUpperCase());
}

export function initialSourceRows(ticker, profile = {}) {
  const rows = COLLECTION_TOOLS.flatMap((tool) => tool.sourceTemplates || [])
    .map((source) => ({
      ...source,
      pathOrUrl: source.pathOrUrl.replaceAll('{ticker}', ticker.toUpperCase())
    }));

  rows.splice(1, 0, {
    id: 'proxy-governance',
    source: 'Proxy / governance filings',
    type: 'CEO, incentives, ownership',
    tier: '1',
    pathOrUrl: `stocks/${ticker.toUpperCase()}/data/raw/sec/`,
    status: 'pending review',
    notes: 'Review DEF 14A, 8-K CEO changes, Forms 3/4/5, incentives, and governance context when available.'
  });

  rows.splice(2, 0, {
    id: 'insider-transactions-buybacks',
    source: 'Insider transactions / buybacks',
    type: 'Forms 3/4/5, 10-K/10-Q repurchase table, 8-K authorizations',
    tier: '1',
    pathOrUrl: `stocks/${ticker.toUpperCase()}/data/raw/sec/`,
    status: 'pending review',
    notes: 'Search recent management-team stock purchases/sales and company repurchase authorization/execution.'
  });

  rows.splice(3, 0, {
    id: 'company-profile-ir',
    source: 'Company profile / investor relations',
    type: 'Business type, CEO bio, strategy',
    tier: '1',
    pathOrUrl: profile.investorRelationsUrl || `stocks/${ticker.toUpperCase()}/profile.json`,
    status: 'pending review',
    notes: 'Confirm business classification, CEO background, prior wins/misses, management style, current goals, and shareholder materials.'
  });

  return rows;
}

export function standardCommands(ticker) {
  const upperTicker = ticker.toUpperCase();
  return [
    `npm run pipeline -- --ticker ${upperTicker}`,
    ...COLLECTION_TOOLS.map((tool) => npmCommandForTool(tool, upperTicker)),
    'npm run build:index'
  ];
}
