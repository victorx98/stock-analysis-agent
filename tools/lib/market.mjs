import { maxDrawdownFromHigh, pctChange, rsi, sma, trendLabel } from './indicators.mjs';

export async function fetchDailyPrices(ticker) {
  return (await fetchDailyPricesWithSource(ticker)).prices;
}

export async function fetchDailyPricesWithSource(ticker) {
  if (process.env.ALPHA_VANTAGE_API_KEY) {
    return fetchAlphaVantage(ticker, process.env.ALPHA_VANTAGE_API_KEY);
  }
  return fetchStooq(ticker);
}

async function fetchAlphaVantage(ticker, apiKey) {
  const url = new URL('https://www.alphavantage.co/query');
  url.searchParams.set('function', 'TIME_SERIES_DAILY_ADJUSTED');
  url.searchParams.set('symbol', ticker.toUpperCase());
  url.searchParams.set('outputsize', 'full');
  url.searchParams.set('apikey', apiKey);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Alpha Vantage request failed: ${response.status}`);
  const data = await response.json();
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
  url.searchParams.set('apikey', '<redacted>');
  return {
    provider: 'alpha_vantage',
    sourceUrl: url.toString(),
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
