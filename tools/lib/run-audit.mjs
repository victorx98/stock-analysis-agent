import { readFileSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { COLLECTION_TOOL_REGISTRY_VERSION, initialSourceRows, standardCommands } from './collection-tools.mjs';
import { exists, readJson, writeJson, writeText } from './fs-utils.mjs';

const SECTION_HEADING = 'Collection and Tooling Notes';

function frameworkVersion() {
  try {
    const pkg = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));
    return pkg.version || 'unknown';
  } catch {
    return 'unknown';
  }
}

function nowIso() {
  return new Date().toISOString();
}

function escapeMarkdownCell(value) {
  return String(value ?? '')
    .replaceAll('|', '-')
    .replace(/\s+/g, ' ')
    .trim();
}

function arrayValue(value) {
  return Array.isArray(value) ? value : [];
}

function uniqueBy(rows, keyFn) {
  const seen = new Set();
  const result = [];
  for (const row of rows) {
    const key = keyFn(row);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(row);
  }
  return result;
}

function sourceKey(source) {
  if (source.id) return String(source.id).toLowerCase();
  return [
    source.source,
    source.pathOrUrl || source.path || source.url
  ].filter(Boolean).join('|').toLowerCase();
}

function normalizeSource(source) {
  return {
    id: source.id || '',
    source: source.source || source.name || '',
    type: source.type || '',
    tier: source.tier || '',
    pathOrUrl: source.pathOrUrl || source.path || source.url || '',
    status: source.status || 'recorded',
    notes: source.notes || ''
  };
}

function normalizeSkippedSource(source, toolRun = {}) {
  return {
    toolId: source.toolId || toolRun.id || '',
    tool: source.tool || toolRun.name || '',
    source: source.source || source.name || '',
    attemptedMethod: source.attemptedMethod || source.method || '',
    reason: source.reason || '',
    impact: source.impact || '',
    fallback: source.fallback || ''
  };
}

function normalizeFailure(failure, toolRun = {}) {
  return {
    toolId: failure.toolId || toolRun.id || '',
    tool: failure.tool || toolRun.name || '',
    source: failure.source || failure.name || '',
    attemptedMethod: failure.attemptedMethod || failure.method || failure.command || '',
    error: failure.error || failure.message || '',
    impact: failure.impact || '',
    fallback: failure.fallback || failure.mitigation || '',
    severity: failure.severity || 'warning'
  };
}

function normalizeToolRun(toolRun) {
  const status = toolRun.status || (toolRun.exitCode === 0 ? 'success' : 'failed');
  return {
    id: toolRun.id,
    name: toolRun.name,
    command: toolRun.command,
    required: Boolean(toolRun.required),
    status,
    exitCode: toolRun.exitCode,
    startedAt: toolRun.startedAt || '',
    finishedAt: toolRun.finishedAt || '',
    durationMs: toolRun.durationMs ?? null,
    notes: toolRun.notes || '',
    stdoutTail: toolRun.stdoutTail || '',
    stderrTail: toolRun.stderrTail || ''
  };
}

function mergeToolRuns(existing, incoming) {
  const retained = existing.filter((run) => run.id !== incoming.id);
  return [...retained, incoming];
}

function mergeSourceRows(initialRows, recordedRows) {
  const normalizedInitial = initialRows.map(normalizeSource);
  const normalizedRecorded = recordedRows.map(normalizeSource);
  const replacements = new Map(normalizedRecorded.map((source) => [sourceKey(source), source]));
  const merged = normalizedInitial.map((source) => replacements.get(sourceKey(source)) || source);
  for (const source of normalizedRecorded) {
    if (!merged.some((candidate) => sourceKey(candidate) === sourceKey(source))) merged.push(source);
  }
  return uniqueBy(merged, sourceKey);
}

function summarizeCollection(metadata) {
  const toolRuns = arrayValue(metadata.toolRuns);
  const failures = arrayValue(metadata.knownFailures);
  const skipped = arrayValue(metadata.skippedSources);
  const succeeded = toolRuns.filter((run) => run.status === 'success').length;
  const partial = toolRuns.filter((run) => run.status === 'partial').length;
  const failed = toolRuns.filter((run) => run.status === 'failed').length;
  const sourceCount = arrayValue(metadata.sourcesUsed)
    .filter((source) => ['collected', 'partial', 'failed', 'reviewed'].includes(String(source.status || '').toLowerCase()))
    .length;

  const lines = [];
  if (!toolRuns.length) {
    lines.push('- Collection tools have not been run for this run folder yet.');
  } else {
    lines.push(`- Tool runs recorded: ${toolRuns.length} (${succeeded} succeeded, ${partial} partial, ${failed} failed).`);
  }
  lines.push(`- Source records captured: ${sourceCount}.`);
  if (skipped.length) lines.push(`- Skipped optional sources: ${skipped.length}.`);
  if (failures.length) {
    lines.push(`- Tool/source issues to review: ${failures.length}.`);
    for (const failure of failures.slice(0, 5)) {
      const source = failure.source ? `${failure.source}: ` : '';
      lines.push(`- ${source}${failure.error || failure.impact || 'Issue recorded.'}`);
    }
  } else {
    lines.push('- No tool/source issues recorded yet.');
  }
  return lines.join('\n');
}

function sectionRegex(heading) {
  return new RegExp(`(^## ${heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\n)([\\s\\S]*?)(?=\\n## |$)`, 'm');
}

async function updateDecisionBrief(runDir, metadata) {
  const briefPath = path.join(runDir, 'decision-brief.md');
  if (!(await exists(briefPath))) return;

  const markdown = await readFile(briefPath, 'utf8');
  const replacement = `## ${SECTION_HEADING}\n\n${summarizeCollection(metadata)}\n`;
  const regex = sectionRegex(SECTION_HEADING);
  let updated;
  if (regex.test(markdown)) {
    updated = markdown.replace(regex, replacement);
  } else if (markdown.includes('\n## Evidence table')) {
    updated = markdown.replace('\n## Evidence table', `\n${replacement}\n## Evidence table`);
  } else {
    updated = `${markdown.trimEnd()}\n\n${replacement}\n`;
  }
  await writeFile(briefPath, updated.endsWith('\n') ? updated : `${updated}\n`, 'utf8');
}

export function createInitialRunMetadata({ ticker, company, runDate, profile = {} }) {
  return {
    ticker,
    company,
    runDate,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    toolVersions: {
      framework: frameworkVersion(),
      node: process.version,
      collectionToolRegistry: COLLECTION_TOOL_REGISTRY_VERSION
    },
    commands: standardCommands(ticker),
    sourceFiles: [],
    sourcesUsed: initialSourceRows(ticker, profile),
    skippedSources: [],
    knownFailures: [],
    toolRuns: []
  };
}

export function runMetadataPath(runDir) {
  return path.join(runDir, 'run-metadata.json');
}

export async function readRunMetadata(runDir) {
  return readJson(runMetadataPath(runDir));
}

export async function writeRunAudit(runDir, metadata) {
  const updated = { ...metadata, updatedAt: nowIso() };
  await writeJson(runMetadataPath(runDir), updated);
  await writeText(path.join(runDir, 'source-inventory.md'), renderSourceInventory(updated));
  await updateDecisionBrief(runDir, updated);
}

export async function initializeRunAudit(runDir, metadata) {
  await writeRunAudit(runDir, metadata);
}

export async function recordToolRun(runDir, toolRun) {
  const metadata = await readRunMetadata(runDir);
  const normalizedToolRun = normalizeToolRun(toolRun);
  const sourceFiles = uniqueBy([
    ...arrayValue(metadata.sourceFiles),
    ...arrayValue(toolRun.sourceFiles)
  ].filter(Boolean), (file) => file);
  const sourcesUsed = mergeSourceRows(
    initialSourceRows(metadata.ticker, {}),
    [...arrayValue(metadata.sourcesUsed), ...arrayValue(toolRun.sourcesUsed)]
  );
  const skippedSources = uniqueBy([
    ...arrayValue(metadata.skippedSources).map((source) => normalizeSkippedSource(source)),
    ...arrayValue(toolRun.skippedSources).map((source) => normalizeSkippedSource(source, normalizedToolRun))
  ], (source) => `${source.toolId}|${source.source}|${source.reason}`);
  const knownFailures = uniqueBy([
    ...arrayValue(metadata.knownFailures).map((failure) => normalizeFailure(failure)),
    ...arrayValue(toolRun.failures).map((failure) => normalizeFailure(failure, normalizedToolRun))
  ], (failure) => `${failure.toolId}|${failure.source}|${failure.error}|${failure.attemptedMethod}`);

  await writeRunAudit(runDir, {
    ...metadata,
    sourceFiles,
    sourcesUsed,
    skippedSources,
    knownFailures,
    toolRuns: mergeToolRuns(arrayValue(metadata.toolRuns), normalizedToolRun)
  });
}

export function renderSourceInventory(metadata) {
  const ticker = metadata.ticker || 'TICKER';
  const sourceRows = mergeSourceRows(initialSourceRows(ticker, {}), arrayValue(metadata.sourcesUsed));
  const lines = [
    `# Source Inventory - ${ticker} - ${metadata.runDate || 'unknown'}`,
    '',
    '| Source | Type | Tier | Path/URL | Status | Notes |',
    '|---|---|---:|---|---|---|'
  ];

  for (const source of sourceRows) {
    lines.push(`| ${escapeMarkdownCell(source.source)} | ${escapeMarkdownCell(source.type)} | ${escapeMarkdownCell(source.tier)} | ${escapeMarkdownCell(source.pathOrUrl)} | ${escapeMarkdownCell(source.status)} | ${escapeMarkdownCell(source.notes)} |`);
  }

  lines.push('', '## Tool Runs', '', '| Tool | Command | Status | Exit | Started | Finished | Notes |', '|---|---|---|---:|---|---|---|');
  if (arrayValue(metadata.toolRuns).length) {
    for (const run of metadata.toolRuns) {
      lines.push(`| ${escapeMarkdownCell(run.name || run.id)} | ${escapeMarkdownCell(run.command)} | ${escapeMarkdownCell(run.status)} | ${run.exitCode ?? ''} | ${escapeMarkdownCell(run.startedAt)} | ${escapeMarkdownCell(run.finishedAt)} | ${escapeMarkdownCell(run.notes)} |`);
    }
  } else {
    lines.push('| No tools recorded yet. |  | pending |  |  |  |  |');
  }

  lines.push('', '## Source Files Created', '');
  if (arrayValue(metadata.sourceFiles).length) {
    for (const file of metadata.sourceFiles) lines.push(`- ${file}`);
  } else {
    lines.push('- None recorded yet.');
  }

  lines.push('', '## Skipped Sources', '');
  if (arrayValue(metadata.skippedSources).length) {
    for (const source of metadata.skippedSources) {
      const reason = [source.reason, source.impact, source.fallback].filter(Boolean).join(' ');
      lines.push(`- ${source.source || source.tool}: ${reason || 'Skipped.'}`);
    }
  } else {
    lines.push('- None recorded.');
  }

  lines.push('', '## Tool / Source Issues', '');
  if (arrayValue(metadata.knownFailures).length) {
    for (const failure of metadata.knownFailures) {
      const parts = [
        failure.source || failure.tool,
        failure.attemptedMethod ? `method: ${failure.attemptedMethod}` : '',
        failure.error ? `error: ${failure.error}` : '',
        failure.impact ? `impact: ${failure.impact}` : '',
        failure.fallback ? `fallback: ${failure.fallback}` : ''
      ].filter(Boolean);
      lines.push(`- ${parts.join('; ')}`);
    }
  } else {
    lines.push('- None recorded.');
  }

  return lines.join('\n');
}
