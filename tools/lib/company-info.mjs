import { fetchAlphaVantageJson, redactedAlphaVantageUrl } from './alpha-vantage.mjs';

export async function fetchMassiveTickerOverview(ticker) {
  const apiKey = process.env.MASSIVE_API_KEY;
  if (!apiKey) return null;

  const baseUrl = process.env.MASSIVE_BASE_URL || 'https://api.massive.com';
  const url = new URL(`/v3/reference/tickers/${encodeURIComponent(ticker.toUpperCase())}`, baseUrl);
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${apiKey}`
    }
  });
  if (!response.ok) throw new Error(`Massive ticker overview request failed: ${response.status}`);

  const data = await response.json();
  if (String(data.status || '').toUpperCase() === 'ERROR') {
    throw new Error(data.error || data.message || 'Massive returned an error response.');
  }
  return {
    provider: 'massive',
    sourceUrl: url.toString(),
    data
  };
}

export async function fetchAlphaVantageCompanyOverview(ticker) {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  if (!apiKey) return null;

  const url = new URL('https://www.alphavantage.co/query');
  url.searchParams.set('function', 'OVERVIEW');
  url.searchParams.set('symbol', ticker.toUpperCase());
  url.searchParams.set('apikey', apiKey);

  const data = await fetchAlphaVantageJson(url, { label: 'company overview' });
  if (!data.Symbol && !data.Name) throw new Error(`Alpha Vantage response missing company overview fields for ${ticker}`);
  return {
    provider: 'alpha_vantage',
    sourceUrl: redactedAlphaVantageUrl(url),
    data
  };
}

export function summarizeCompanyInfo({ ticker, profile = {}, massiveTickerOverview, alphaVantageOverview }) {
  const massive = massiveTickerOverview?.data?.results || {};
  const alpha = alphaVantageOverview?.data || {};
  return {
    ticker,
    company: massive.name || alpha.Name || profile.company || '',
    description: massive.description || alpha.Description || '',
    homepageUrl: massive.homepage_url || '',
    exchange: massive.primary_exchange || alpha.Exchange || '',
    currency: massive.currency_name || alpha.Currency || '',
    market: massive.market || '',
    locale: massive.locale || '',
    sector: alpha.Sector || profile.sector || '',
    industry: alpha.Industry || massive.sic_description || profile.industry || '',
    sicCode: massive.sic_code || '',
    marketCapitalization: numberOrNull(alpha.MarketCapitalization ?? massive.market_cap),
    sharesOutstanding: numberOrNull(massive.weighted_shares_outstanding ?? massive.share_class_shares_outstanding ?? alpha.SharesOutstanding),
    employees: numberOrNull(massive.total_employees),
    peRatio: numberOrNull(alpha.PERatio),
    forwardPe: numberOrNull(alpha.ForwardPE),
    pegRatio: numberOrNull(alpha.PEGRatio),
    priceToSalesRatioTtm: numberOrNull(alpha.PriceToSalesRatioTTM),
    priceToBookRatio: numberOrNull(alpha.PriceToBookRatio),
    evToRevenue: numberOrNull(alpha.EVToRevenue),
    evToEbitda: numberOrNull(alpha.EVToEBITDA),
    profitMargin: numberOrNull(alpha.ProfitMargin),
    operatingMarginTtm: numberOrNull(alpha.OperatingMarginTTM),
    revenueTtm: numberOrNull(alpha.RevenueTTM),
    grossProfitTtm: numberOrNull(alpha.GrossProfitTTM),
    ebitda: numberOrNull(alpha.EBITDA),
    eps: numberOrNull(alpha.EPS),
    beta: numberOrNull(alpha.Beta),
    dividendYield: numberOrNull(alpha.DividendYield),
    analystTargetPrice: numberOrNull(alpha.AnalystTargetPrice),
    fiscalYearEnd: alpha.FiscalYearEnd || '',
    latestQuarter: alpha.LatestQuarter || '',
    sources: {
      massiveTickerOverview: massiveTickerOverview?.sourceUrl || '',
      alphaVantageOverview: alphaVantageOverview?.sourceUrl || ''
    }
  };
}

function numberOrNull(value) {
  if (value === undefined || value === null || value === '' || value === 'None') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}
