#!/usr/bin/env node
import path from 'node:path';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { exists, repoRoot } from './lib/fs-utils.mjs';

const stocksDir = path.join(repoRoot, 'stocks');
const outputPath = path.join(repoRoot, 'index-data.js');
const runDatePattern = /^\d{4}-\d{2}-\d{2}(?:-\d{2})?$/;

function extractLastUpdated(html) {
  const dataMatch = html.match(/data-last-updated="([^"]+)"/i);
  if (dataMatch?.[1]) return dataMatch[1];
  const timeMatch = html.match(/<time[^>]*datetime="([^"]*)"[^>]*>([\s\S]*?)<\/time>/i);
  if (timeMatch?.[1]) return timeMatch[1];
  if (timeMatch?.[2]) return timeMatch[2].replace(/<[^>]+>/g, '').trim();
  const textMatch = html.match(/Last updated:\s*([^<\n]+)/i);
  return textMatch?.[1]?.trim() || 'unknown';
}

function stripMarkdown(value) {
  return String(value || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^#+\s+/gm, '')
    .replace(/^[*-]\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function excerpt(value, maxLength = 260) {
  const text = stripMarkdown(value);
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trim()}...`;
}

function extractSection(markdown, heading) {
  const lines = String(markdown || '').split(/\r?\n/);
  const normalizedHeading = heading.toLowerCase();
  const start = lines.findIndex((line) => line.replace(/^##\s+/, '').trim().toLowerCase() === normalizedHeading);
  if (start === -1) return '';
  const collected = [];
  for (const line of lines.slice(start + 1)) {
    if (/^##\s+/.test(line)) break;
    collected.push(line);
  }
  return collected.join('\n').trim();
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function extractTrendLabel(markdown) {
  const tableMatch = markdown.match(/\|\s*trendLabel\s*\|\s*([^|]+)\|/i);
  if (tableMatch?.[1]) return tableMatch[1].trim();
  const allowed = [
    'uptrend',
    'weak_uptrend',
    'sideways',
    'weak_downtrend',
    'downtrend',
    'insufficient_data'
  ];
  const allowedPattern = new RegExp(`\\b(${allowed.join('|')})\\b`, 'i');
  const match = markdown.match(allowedPattern);
  return match?.[1] || '';
}

async function readJsonSafe(filePath) {
  if (!(await exists(filePath))) return null;
  try {
    return JSON.parse(await readFile(filePath, 'utf8'));
  } catch {
    return null;
  }
}

async function readTextSafe(filePath) {
  if (!(await exists(filePath))) return '';
  try {
    return await readFile(filePath, 'utf8');
  } catch {
    return '';
  }
}

async function readProfile(dir, ticker) {
  const profilePath = path.join(dir, 'profile.json');
  const profile = await readJsonSafe(profilePath);
  if (!profile) return { ticker, company: ticker };
  return {
    ticker: String(profile.ticker || ticker).toUpperCase(),
    company: profile.company || ticker
  };
}

async function readRun(runDir, runDate, ticker) {
  const signal = await readJsonSafe(path.join(runDir, 'signal.json'));
  const decisionBrief = await readTextSafe(path.join(runDir, 'decision-brief.md'));
  const marketTrend = await readTextSafe(path.join(runDir, 'market-trend.md'));
  const thesisReview = await readTextSafe(path.join(runDir, 'thesis-review.md'));

  const bottomLine = signal?.bottomLine
    || signal?.summary
    || extractSection(decisionBrief, 'Plain-English bottom line')
    || extractSection(decisionBrief, 'Executive summary')
    || 'No important conclusion recorded yet.';

  const trendLabel = extractTrendLabel(marketTrend);

  const latestClose = marketTrend.match(/Latest close\s*\|\s*([^|]+)\|/i)?.[1]?.trim()
    || marketTrend.match(/\|\s*latestClose\s*\|\s*([^|]+)\|/i)?.[1]?.trim()
    || '';

  const priorAccuracy = signal?.priorThesisReview?.accuracy
    || thesisReview.match(/Accuracy label\s*\n+\s*`?([A-Za-z0-9_-]+)`?/i)?.[1]
    || '';

  return {
    runDate,
    signal: signal?.signal || 'unknown',
    confidence: signal?.confidence || '',
    timeHorizon: signal?.timeHorizon || '',
    importantConclusion: excerpt(bottomLine, 320),
    valuationClassification: signal?.valuationAssessment?.classification || '',
    trendLabel,
    latestClose,
    priorAccuracy,
    decisionBriefPath: `runs/${runDate}/decision-brief.md`,
    signalPath: `runs/${runDate}/signal.json`,
    hasDecisionBrief: await exists(path.join(runDir, 'decision-brief.md')),
    hasSignal: Boolean(signal),
    ticker
  };
}

async function readRuns(dir, ticker) {
  const runsDir = path.join(dir, 'runs');
  if (!(await exists(runsDir))) return [];
  const entries = await readdir(runsDir, { withFileTypes: true });
  const runDirs = entries
    .filter((entry) => entry.isDirectory() && runDatePattern.test(entry.name))
    .map((entry) => entry.name)
    .sort((a, b) => b.localeCompare(a));

  const runs = [];
  for (const runDate of runDirs) {
    runs.push(await readRun(path.join(runsDir, runDate), runDate, ticker));
  }
  return runs;
}

function renderStockIndex({ profile, ticker, lastUpdated, hasSummary, runs, generatedAt }) {
  const latest = runs[0];
  const runRows = runs.length
    ? runs.map((run) => `<tr>
        <td data-label="Run"><strong>${escapeHtml(run.runDate)}</strong></td>
        <td data-label="Signal">${escapeHtml(run.signal)}${run.confidence ? `<br><span class="muted">${escapeHtml(run.confidence)} confidence</span>` : ''}</td>
        <td data-label="Price / Trend">${escapeHtml([run.latestClose, run.trendLabel].filter(Boolean).join(' / ') || 'not recorded')}</td>
        <td data-label="Valuation">${escapeHtml(run.valuationClassification || 'not recorded')}</td>
        <td data-label="Important Conclusion">${escapeHtml(run.importantConclusion)}</td>
        <td data-label="Links">${run.hasDecisionBrief ? `<a href="${escapeHtml(run.decisionBriefPath)}">Decision brief</a>` : '<span class="muted">No brief</span>'}${run.hasSignal ? ` · <a href="${escapeHtml(run.signalPath)}">Signal JSON</a>` : ''}</td>
      </tr>`).join('\n')
    : `<tr><td colspan="6" class="empty">No run folders found yet.</td></tr>`;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(ticker)} Analysis Index</title>
    <style>
      :root {
        --bg: #f5f7fa;
        --panel: #ffffff;
        --ink: #17202a;
        --muted: #5f6b7a;
        --line: #d9dee7;
        --accent: #1565c0;
      }

      * { box-sizing: border-box; }

      body {
        margin: 0;
        background: var(--bg);
        color: var(--ink);
        font: 16px/1.5 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      main {
        width: min(1180px, calc(100% - 32px));
        margin: 0 auto;
        padding: 32px 0 56px;
      }

      header {
        display: grid;
        gap: 8px;
        margin-bottom: 20px;
      }

      h1, h2, p { margin-top: 0; }

      h1 {
        margin-bottom: 0;
        font-size: clamp(2rem, 5vw, 3.5rem);
        line-height: 1;
        letter-spacing: 0;
      }

      a { color: var(--accent); text-decoration: none; }
      a:hover { text-decoration: underline; }

      .muted { color: var(--muted); }

      .toolbar {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin: 8px 0 0;
      }

      .panel {
        background: var(--panel);
        border: 1px solid var(--line);
        border-radius: 8px;
        overflow: hidden;
        margin-top: 16px;
      }

      .summary {
        padding: 18px 20px;
      }

      table {
        width: 100%;
        border-collapse: collapse;
      }

      th, td {
        border-bottom: 1px solid var(--line);
        padding: 12px 14px;
        text-align: left;
        vertical-align: top;
      }

      th {
        color: var(--muted);
        font-size: 0.82rem;
        text-transform: uppercase;
      }

      tr:last-child td { border-bottom: 0; }
      .empty { padding: 20px; }

      @media (max-width: 780px) {
        main { width: min(100% - 20px, 1180px); padding-top: 22px; }
        table, thead, tbody, tr, th, td { display: block; }
        thead { display: none; }
        td { border-bottom: 0; padding: 8px 14px; }
        tr { border-bottom: 1px solid var(--line); padding: 8px 0; }
        tr:last-child { border-bottom: 0; }
        td::before {
          content: attr(data-label);
          display: block;
          color: var(--muted);
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
        }
      }
    </style>
  </head>
  <body>
    <main data-ticker="${escapeHtml(ticker)}" data-company="${escapeHtml(profile.company)}" data-last-updated="${escapeHtml(lastUpdated)}">
      <header>
        <p class="muted">${escapeHtml(profile.company)}</p>
        <h1>${escapeHtml(ticker)} Analysis Index</h1>
        <p class="muted">Generated ${escapeHtml(generatedAt)}. Latest summary updated: ${escapeHtml(lastUpdated)}.</p>
        <nav class="toolbar" aria-label="Navigation">
          <a href="../../index.html">Root index</a>
          ${hasSummary ? '<a href="summary.html">Latest summary</a>' : '<span class="muted">summary.html missing</span>'}
        </nav>
      </header>

      <section class="panel summary" aria-label="Latest conclusion">
        <h2>Latest Important Conclusion</h2>
        <p>${escapeHtml(latest?.importantConclusion || 'No completed analysis run found yet.')}</p>
        ${latest ? `<p class="muted">Latest run: ${escapeHtml(latest.runDate)} · Signal: ${escapeHtml(latest.signal)}${latest.valuationClassification ? ` · Valuation: ${escapeHtml(latest.valuationClassification)}` : ''}</p>` : ''}
      </section>

      <section class="panel" aria-label="Run index">
        <table>
          <thead>
            <tr>
              <th>Run</th>
              <th>Signal</th>
              <th>Price / Trend</th>
              <th>Valuation</th>
              <th>Important Conclusion</th>
              <th>Links</th>
            </tr>
          </thead>
          <tbody>
            ${runRows}
          </tbody>
        </table>
      </section>
    </main>
  </body>
</html>
`;
}

const entries = await readdir(stocksDir, { withFileTypes: true });
const summaries = [];
const generatedAt = new Date().toISOString();

for (const entry of entries) {
  if (!entry.isDirectory() || entry.name === '_TEMPLATE' || entry.name.startsWith('.')) continue;
  const ticker = entry.name.toUpperCase();
  const dir = path.join(stocksDir, entry.name);
  const profile = await readProfile(dir, ticker);
  const summaryPath = path.join(dir, 'summary.html');
  const hasSummary = await exists(summaryPath);
  const runs = await readRuns(dir, ticker);
  let lastUpdated = runs[0]?.runDate || 'missing';

  if (hasSummary) {
    const html = await readFile(summaryPath, 'utf8');
    lastUpdated = extractLastUpdated(html);
  }

  const stockIndexHtml = renderStockIndex({ profile, ticker, lastUpdated, hasSummary, runs, generatedAt });
  await writeFile(path.join(dir, 'index.html'), stockIndexHtml, 'utf8');

  const latest = runs[0];
  summaries.push({
    ticker: profile.ticker,
    company: profile.company,
    lastUpdated,
    latestRunDate: latest?.runDate || '',
    latestSignal: latest?.signal || 'unknown',
    latestConfidence: latest?.confidence || '',
    latestValuation: latest?.valuationClassification || '',
    latestConclusion: latest?.importantConclusion || 'No completed analysis run found yet.',
    hasSummary,
    summaryPath: `stocks/${ticker}/summary.html`,
    stockIndexPath: `stocks/${ticker}/index.html`,
    runCount: runs.length
  });
}

const generated = [
  '// Generated by tools/build-index.mjs. Do not commit stock-specific directory data.',
  `window.STOCK_INDEX_GENERATED_AT = ${JSON.stringify(generatedAt)};`,
  `window.STOCK_SUMMARIES = ${JSON.stringify(summaries, null, 2)};`,
  ''
].join('\n');

await writeFile(outputPath, generated, 'utf8');
console.log(JSON.stringify({ outputPath, count: summaries.length, stockIndexCount: summaries.length }, null, 2));
