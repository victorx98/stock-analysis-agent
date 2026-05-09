const SEC_TICKERS_URL = 'https://www.sec.gov/files/company_tickers.json';
const SEC_SUBMISSIONS_BASE = 'https://data.sec.gov/submissions';

function secHeaders() {
  const userAgent = process.env.SEC_USER_AGENT || 'stock-analysis-framework/0.1 contact@example.com';
  return {
    'User-Agent': userAgent,
    'Accept-Encoding': 'gzip, deflate',
    Accept: 'application/json'
  };
}

export function normalizeCik(cik) {
  return String(cik).replace(/^0+/, '').padStart(10, '0');
}

export async function resolveTicker(ticker) {
  const response = await fetch(SEC_TICKERS_URL, { headers: secHeaders() });
  if (!response.ok) throw new Error(`SEC ticker map request failed: ${response.status}`);
  const data = await response.json();
  const target = ticker.toUpperCase();
  const rows = Object.values(data);
  const match = rows.find((row) => String(row.ticker).toUpperCase() === target);
  if (!match) throw new Error(`Ticker not found in SEC ticker map: ${ticker}`);
  return {
    ticker: match.ticker,
    company: match.title,
    cik: normalizeCik(match.cik_str)
  };
}

export async function fetchSubmissionsByCik(cik) {
  const normalized = normalizeCik(cik);
  const url = `${SEC_SUBMISSIONS_BASE}/CIK${normalized}.json`;
  const response = await fetch(url, { headers: secHeaders() });
  if (!response.ok) throw new Error(`SEC submissions request failed: ${response.status}`);
  return { url, data: await response.json() };
}

export function summarizeRecentFilings(submissions, limit = 30) {
  const recent = submissions?.filings?.recent;
  if (!recent) return [];
  const forms = recent.form || [];
  return forms.slice(0, limit).map((form, index) => ({
    form,
    filingDate: recent.filingDate?.[index],
    reportDate: recent.reportDate?.[index],
    accessionNumber: recent.accessionNumber?.[index],
    primaryDocument: recent.primaryDocument?.[index],
    primaryDocDescription: recent.primaryDocDescription?.[index]
  }));
}
