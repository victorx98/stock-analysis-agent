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
    runSummaryPath: `runs/${runDate}/summary.html`,
    hasDecisionBrief: await exists(path.join(runDir, 'decision-brief.md')),
    hasSignal: Boolean(signal),
    hasRunSummary: await exists(path.join(runDir, 'summary.html')),
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

/* Map a signal string to a CSS badge class — mirrors root index.html logic */
function signalBadgeClass(sig) {
  const s = String(sig).toLowerCase();
  if (s.includes('buy') || s.includes('watch')) return 'bull-b';
  if (s.includes('avoid') || s.includes('sell') || s.includes('bear')) return 'bear-b';
  if (s.includes('hold') || s.includes('neutral')) return 'neu-b';
  return 'gray-b';
}

/* Map a signal string to the hero-badge class for the page header */
function signalHeroClass(sig) {
  const s = String(sig).toLowerCase();
  if (s.includes('buy') || s.includes('watch')) return 'sig-bull';
  if (s.includes('avoid') || s.includes('sell') || s.includes('bear')) return 'sig-bear';
  if (s.includes('hold') || s.includes('neutral')) return 'sig-neutral';
  return 'sig-gray';
}

function renderStockIndex({ profile, ticker, lastUpdated, hasSummary, runs, generatedAt }) {
  const latest = runs[0];
  const latestSignal = latest?.signal || 'unknown';

  const runRows = runs.length
    ? runs.map((run, i) => {
        const priceStr = escapeHtml([run.latestClose, run.trendLabel].filter(Boolean).join(' · ') || 'not recorded');
        const confCell = run.confidence
          ? `<span class="conf">${escapeHtml(run.confidence)} confidence</span>` : '';
        const linkBrief = run.hasDecisionBrief
          ? `<a href="${escapeHtml(run.decisionBriefPath)}">Decision brief</a>` : '<span style="color:var(--muted)">No brief</span>';
        const linkSignal = run.hasSignal
          ? `<br><a href="${escapeHtml(run.signalPath)}">Signal JSON</a>` : '';
        /* Per-run summary: prefer runs/<DATE>/summary.html if it exists,
           fall back to the stock-level summary.html for the most recent run. */
        let linkSummary = '';
        if (run.hasRunSummary) {
          linkSummary = `<br><a href="${escapeHtml(run.runSummaryPath)}">Summary</a>`;
        } else if (i === 0 && hasSummary) {
          linkSummary = `<br><a href="summary.html">Summary</a>`;
        }
        return `<tr>
          <td data-label="Run"><span class="run-date">${escapeHtml(run.runDate)}</span></td>
          <td data-label="Signal"><span class="badge ${signalBadgeClass(run.signal)}">${escapeHtml(run.signal)}</span>${confCell}</td>
          <td data-label="Price / Trend"><span class="price">${priceStr}</span></td>
          <td data-label="Valuation">${escapeHtml(run.valuationClassification || 'not recorded')}</td>
          <td data-label="Important Conclusion" style="max-width:340px;font-size:0.875rem;line-height:1.55">${escapeHtml(run.importantConclusion)}</td>
          <td data-label="Links" style="white-space:nowrap">${linkBrief}${linkSignal}${linkSummary}</td>
        </tr>`;
      }).join('\n')
    : `<tr><td colspan="6" style="padding:20px;color:var(--muted)">No run folders found yet.</td></tr>`;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(ticker)} Analysis Index</title>
  <style>
    :root {
      --bg:      #f8f7f4;
      --panel:   #ffffff;
      --ink:     #111827;
      --muted:   #6b7280;
      --border:  #e5e1d8;
      --accent:  #1e40af;
      --bull:    #15803d;
      --bear:    #b91c1c;
      --neutral: #b45309;
      --mono:    ui-monospace, "SF Mono", Menlo, monospace;
      --serif:   Georgia, "Times New Roman", serif;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--ink);
      font: 15px/1.65 system-ui, -apple-system, sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    main { width: min(1120px, calc(100% - 32px)); margin: 0 auto; padding: 52px 0 72px; }

    header { margin-bottom: 36px; }
    .company-label {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--muted);
      margin-bottom: 8px;
    }
    h1 {
      font: 700 clamp(2rem, 5vw, 3.5rem)/1.05 var(--serif);
      letter-spacing: -0.02em;
      margin-bottom: 18px;
    }
    .ticker { font-family: var(--mono); }
    .signal-hero {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 7px 16px;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      margin-bottom: 16px;
    }
    .signal-hero::before {
      content: '';
      display: inline-block;
      width: 7px; height: 7px;
      border-radius: 50%;
      background: currentColor;
    }
    .sig-bull    { background: #f0fdf4; color: var(--bull);    border: 1px solid #bbf7d0; }
    .sig-neutral { background: #fffbeb; color: var(--neutral); border: 1px solid #fde68a; }
    .sig-bear    { background: #fef2f2; color: var(--bear);    border: 1px solid #fecaca; }
    .sig-gray    { background: #f3f4f6; color: var(--muted);   border: 1px solid #e5e7eb; }
    .meta { font-size: 0.82rem; color: var(--muted); font-family: var(--mono); margin-bottom: 16px; }
    nav { display: flex; gap: 20px; flex-wrap: wrap; }
    nav a { font-size: 0.875rem; color: var(--accent); }

    .panel {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 1px 4px rgba(0,0,0,0.05);
      margin-bottom: 16px;
    }
    .panel-body { padding: 22px 24px; }
    h2 { font: 600 1.05rem/1.3 var(--serif); margin-bottom: 10px; }
    .conclusion-text { font-size: 0.925rem; line-height: 1.65; }
    .run-meta { font-family: var(--mono); font-size: 0.8rem; color: var(--muted); margin-top: 10px; }

    table { width: 100%; border-collapse: collapse; }
    thead th {
      background: #faf9f7;
      border-bottom: 2px solid var(--border);
      padding: 10px 16px;
      text-align: left;
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--muted);
    }
    td {
      border-bottom: 1px solid var(--border);
      padding: 14px 16px;
      vertical-align: top;
      font-size: 0.9rem;
    }
    tr:last-child td { border-bottom: 0; }
    tbody tr:hover { background: #faf9f7; }

    .run-date { font-family: var(--mono); font-weight: 600; }
    .price    { font-family: var(--mono); font-size: 0.88rem; }

    .badge {
      display: inline-block;
      padding: 2px 9px;
      border-radius: 4px;
      font-size: 0.73rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .bull-b { background: #f0fdf4; color: var(--bull); }
    .bear-b { background: #fef2f2; color: var(--bear); }
    .neu-b  { background: #fffbeb; color: var(--neutral); }
    .gray-b { background: #f3f4f6; color: var(--muted); }
    .conf   { display: block; font-size: 0.77rem; color: var(--muted); margin-top: 3px; }

    a { color: var(--accent); text-decoration: none; }
    a:hover { text-decoration: underline; }

    @media (max-width: 760px) {
      main { padding-top: 30px; }
      table, thead, tbody, tr, th, td { display: block; }
      thead { display: none; }
      td { border-bottom: 0; padding: 7px 14px; }
      td::before {
        content: attr(data-label);
        display: block;
        font-size: 0.7rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--muted);
        margin-bottom: 2px;
      }
      tr { border-bottom: 1px solid var(--border); padding: 10px 0; }
      tr:last-child { border-bottom: 0; }
    }
  </style>
</head>
<body>
  <main data-ticker="${escapeHtml(ticker)}" data-company="${escapeHtml(profile.company)}" data-last-updated="${escapeHtml(lastUpdated)}">
    <header>
      <p class="company-label">${escapeHtml(profile.company)}</p>
      <h1><span class="ticker">${escapeHtml(ticker)}</span> Analysis Index</h1>
      <div class="signal-hero ${signalHeroClass(latestSignal)}">${escapeHtml(latestSignal)}</div>
      <p class="meta">Generated ${escapeHtml(generatedAt)} &nbsp;·&nbsp; Latest summary: ${escapeHtml(lastUpdated)}</p>
      <nav aria-label="Navigation">
        <a href="../../index.html">← Root index</a>
        ${hasSummary ? '<a href="summary.html">Latest summary →</a>' : '<span style="color:var(--muted)">summary.html missing</span>'}
      </nav>
    </header>

    <section class="panel" aria-label="Latest conclusion">
      <div class="panel-body">
        <h2>Latest Important Conclusion</h2>
        <p class="conclusion-text">${escapeHtml(latest?.importantConclusion || 'No completed analysis run found yet.')}</p>
        ${latest ? `<p class="run-meta">Run: ${escapeHtml(latest.runDate)} &nbsp;·&nbsp; Signal: ${escapeHtml(latest.signal)}${latest.valuationClassification ? ` &nbsp;·&nbsp; Valuation: ${escapeHtml(latest.valuationClassification)}` : ''}${latest.confidence ? ` &nbsp;·&nbsp; Confidence: ${escapeHtml(latest.confidence)}` : ''}</p>` : ''}
      </div>
    </section>

    <section class="panel" aria-label="Run history">
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
