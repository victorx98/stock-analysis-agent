import { fetchAlphaVantageJson, redactedAlphaVantageUrl } from './alpha-vantage.mjs';
import { maxDrawdownFromHigh, pctChange, rsi, sma, trendLabel } from './indicators.mjs';

export async function fetchDailyPrices(ticker) {
  return (await fetchDailyPricesWithSource(ticker)).prices;
}

export async function fetchDailyPricesWithSource(ticker) {
  const failures = [];
  const skippedSources = [];

  if (process.env.MASSIVE_API_KEY) {
    try {
      return {
        ...(await fetchMassiveDailyAggregates(ticker, process.env.MASSIVE_API_KEY)),
        failures,
        skippedSources
      };
    } catch (error) {
      failures.push(providerFailure('Massive', 'daily stock aggregates', error, 'Use Alpha Vantage daily prices or Stooq fallback.'));
    }
  } else {
    skippedSources.push(providerSkipped('Massive', 'daily stock aggregates', 'MASSIVE_API_KEY is not set.'));
  }

  if (process.env.ALPHA_VANTAGE_API_KEY) {
    try {
      return {
        ...(await fetchAlphaVantage(ticker, process.env.ALPHA_VANTAGE_API_KEY)),
        failures,
        skippedSources
      };
    } catch (error) {
      failures.push(providerFailure('Alpha Vantage', 'TIME_SERIES_DAILY_ADJUSTED', error, 'Use Stooq fallback.'));
    }
  } else {
    skippedSources.push(providerSkipped('Alpha Vantage', 'TIME_SERIES_DAILY_ADJUSTED', 'ALPHA_VANTAGE_API_KEY is not set.'));
  }

  return {
    ...(await fetchStooq(ticker)),
    failures,
    skippedSources
  };
}

function providerFailure(source, attemptedMethod, error, fallback) {
  return {
    source,
    attemptedMethod,
    error: error.message,
    impact: `${source} did not provide daily price data for this run.`,
    fallback,
    severity: 'warning'
  };
}

function providerSkipped(source, attemptedMethod, reason) {
  return {
    source,
    attemptedMethod,
    reason,
    impact: `${source} market data collection was skipped.`,
    fallback: 'Use the next configured market data provider.'
  };
}

function dateDaysAgo(days) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

function dateFromUnixMs(value) {
  return new Date(Number(value)).toISOString().slice(0, 10);
}

async function fetchMassiveDailyAggregates(ticker, apiKey) {
  const from = dateDaysAgo(730);
  const to = new Date().toISOString().slice(0, 10);
  const baseUrl = process.env.MASSIVE_BASE_URL || 'https://api.massive.com';
  const url = new URL(`/v2/aggs/ticker/${encodeURIComponent(ticker.toUpperCase())}/range/1/day/${from}/${to}`, baseUrl);
  url.searchParams.set('adjusted', 'true');
  url.searchParams.set('sort', 'asc');
  url.searchParams.set('limit', '50000');

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${apiKey}`
    }
  });
  if (!response.ok) throw new Error(`Massive request failed: ${response.status}`);
  const data = await response.json();
  if (String(data.status || '').toUpperCase() === 'ERROR') {
    throw new Error(data.error || data.message || 'Massive returned an error response.');
  }

  const prices = (data.results || []).map((row) => ({
    date: dateFromUnixMs(row.t),
    open: Number(row.o),
    high: Number(row.h),
    low: Number(row.l),
    close: Number(row.c),
    adjustedClose: Number(row.c),
    volume: Number(row.v),
    vwap: Number(row.vw),
    transactions: Number(row.n),
    source: 'massive'
  })).filter((row) => Number.isFinite(row.close));

  if (!prices.length) throw new Error(`Massive returned no daily aggregates for ${ticker}`);
  return {
    provider: 'massive',
    sourceUrl: url.toString(),
    prices
  };
}

async function fetchAlphaVantage(ticker, apiKey) {
  const url = new URL('https://www.alphavantage.co/query');
  url.searchParams.set('function', 'TIME_SERIES_DAILY_ADJUSTED');
  url.searchParams.set('symbol', ticker.toUpperCase());
  url.searchParams.set('outputsize', 'full');
  url.searchParams.set('apikey', apiKey);
  const data = await fetchAlphaVantageJson(url, { label: 'daily series' });
  const series = data['Time Series (Daily)'];
  if (!series) throw new Error(`Alpha Vantage response missing daily series: ${JSON.stringify(data).slice(0, 200)}`);
  const prices = Object.entries(series)
    .map(([date, row]) => ({
      date,
      open: Number(row['1. open']),
      high: Number(row['2. high']),
      low: Number(row['3. low']),
      close: Number(row['4. close']),
      adjustedClose: Number(row['5. adjusted close']),
      volume: Number(row['6. volume']),
      source: 'alpha_vantage'
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
  return {
    provider: 'alpha_vantage',
    sourceUrl: redactedAlphaVantageUrl(url),
    prices
  };
}

async function fetchStooq(ticker) {
  const symbol = `${ticker.toLowerCase()}.us`;
  const url = `https://stooq.com/q/d/l/?s=${encodeURIComponent(symbol)}&i=d`;
  const response = await fetch(url, { headers: { Accept: 'text/csv' } });
  if (!response.ok) throw new Error(`Stooq request failed: ${response.status}`);
  const csv = await response.text();
  const rows = csv.trim().split(/\r?\n/).slice(1);
  if (!rows.length || rows[0].startsWith('No data')) throw new Error(`Stooq returned no data for ${ticker}`);
  const prices = rows.map((line) => {
    const [date, open, high, low, close, volume] = line.split(',');
    return {
      date,
      open: Number(open),
      high: Number(high),
      low: Number(low),
      close: Number(close),
      adjustedClose: Number(close),
      volume: Number(volume),
      source: 'stooq'
    };
  }).filter((row) => Number.isFinite(row.close));
  return {
    provider: 'stooq',
    sourceUrl: url,
    prices
  };
}

export function computeTrendMetrics(prices) {
  const closes = prices.map((row) => row.adjustedClose ?? row.close).filter(Number.isFinite);
  const latest = prices.at(-1);
  const metrics = {
    latestDate: latest?.date ?? null,
    latestClose: latest ? Number((latest.adjustedClose ?? latest.close).toFixed(2)) : null,
    sma20: sma(closes, 20),
    sma50: sma(closes, 50),
    sma200: sma(closes, 200),
    return1m: pctChange(closes, 21),
    return3m: pctChange(closes, 63),
    return6m: pctChange(closes, 126),
    return12m: pctChange(closes, 252),
    rsi14: rsi(closes, 14),
    drawdownFrom52WeekHigh: maxDrawdownFromHigh(closes, 252)
  };
  return { ...metrics, trendLabel: trendLabel(metrics) };
}
