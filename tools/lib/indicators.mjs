export function sma(values, days) {
  if (values.length < days) return null;
  const slice = values.slice(-days);
  return round(slice.reduce((sum, value) => sum + value, 0) / days);
}

export function pctChange(values, days) {
  if (values.length <= days) return null;
  const current = values.at(-1);
  const previous = values.at(-(days + 1));
  if (!previous) return null;
  return round(((current - previous) / previous) * 100);
}

export function rsi(values, days = 14) {
  if (values.length <= days) return null;
  const slice = values.slice(-(days + 1));
  let gains = 0;
  let losses = 0;
  for (let i = 1; i < slice.length; i += 1) {
    const delta = slice[i] - slice[i - 1];
    if (delta >= 0) gains += delta;
    else losses += Math.abs(delta);
  }
  if (losses === 0) return 100;
  const rs = gains / losses;
  return round(100 - 100 / (1 + rs));
}

export function maxDrawdownFromHigh(values, lookback = 252) {
  if (!values.length) return null;
  const slice = values.slice(-lookback);
  const high = Math.max(...slice);
  const current = slice.at(-1);
  return round(((current - high) / high) * 100);
}

export function round(value, decimals = 2) {
  if (value === null || Number.isNaN(value)) return null;
  return Number(value.toFixed(decimals));
}

export function trendLabel(metrics) {
  const { latestClose, sma20, sma50, sma200, return3m, return6m } = metrics;
  if (!latestClose || !sma20 || !sma50) return 'insufficient_data';
  const aboveShort = latestClose > sma20 && latestClose > sma50;
  const aboveLong = sma200 ? latestClose > sma200 : false;
  const positiveMedium = (return3m ?? 0) > 0 && (return6m ?? 0) > 0;
  const belowShort = latestClose < sma20 && latestClose < sma50;
  const belowLong = sma200 ? latestClose < sma200 : false;
  const negativeMedium = (return3m ?? 0) < 0 && (return6m ?? 0) < 0;

  if (aboveShort && aboveLong && positiveMedium) return 'uptrend';
  if (aboveShort && positiveMedium) return 'weak_uptrend';
  if (belowShort && belowLong && negativeMedium) return 'downtrend';
  if (belowShort && negativeMedium) return 'weak_downtrend';
  return 'sideways';
}
