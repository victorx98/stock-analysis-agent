function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function alphaVantageMessage(data) {
  return data?.Note || data?.Information || data?.['Error Message'] || '';
}

function retryableAlphaVantageMessage(message) {
  return /frequency|per second|rate limit|standard api call frequency/i.test(String(message || ''));
}

export function assertAlphaVantageOk(data, label) {
  if (data?.['Error Message']) throw new Error(data['Error Message']);
  if (data?.Note) throw new Error(data.Note);
  if (data?.Information) throw new Error(data.Information);
  if (data && Object.keys(data).length === 0) throw new Error(`Alpha Vantage returned an empty ${label} response.`);
}

export function redactedAlphaVantageUrl(url) {
  const copy = new URL(url.toString());
  if (copy.searchParams.has('apikey')) copy.searchParams.set('apikey', '<redacted>');
  return copy.toString();
}

export async function fetchAlphaVantageJson(url, { label, retries = 2, retryDelayMs = 1300 } = {}) {
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Alpha Vantage request failed: ${response.status}`);
    const data = await response.json();
    const message = alphaVantageMessage(data);
    if (message && retryableAlphaVantageMessage(message) && attempt < retries) {
      await sleep(retryDelayMs * (attempt + 1));
      continue;
    }
    assertAlphaVantageOk(data, label || 'API');
    return data;
  }
  throw new Error('Alpha Vantage request failed after retries.');
}
