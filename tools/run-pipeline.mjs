#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { getArg, requireArg } from './lib/args.mjs';
import { collectionSteps, commandForTool, getTool } from './lib/collection-tools.mjs';
import { recordToolRun } from './lib/run-audit.mjs';

const ticker = requireArg('ticker').toUpperCase();
const runDate = getArg('date');

function tail(value, maxLength = 3000) {
  const text = String(value || '').trim();
  if (text.length <= maxLength) return text;
  return text.slice(-maxLength);
}

function parseJsonPayload(stdout) {
  const text = String(stdout || '').trim();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    const lines = text.split(/\r?\n/);
    for (let index = 0; index < lines.length; index += 1) {
      const candidate = lines.slice(index).join('\n').trim();
      if (!candidate.startsWith('{')) continue;
      try {
        return JSON.parse(candidate);
      } catch {
        // Keep scanning in case earlier log lines preceded the JSON payload.
      }
    }
    return null;
  }
}

async function runTool(tool, options = {}) {
  const command = commandForTool(tool, ticker, options);
  const startedAt = new Date().toISOString();
  const startedMs = Date.now();
  console.log(`\n> ${command.display}`);

  return new Promise((resolve) => {
    const child = spawn(command.command, command.args, { shell: process.platform === 'win32' });
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      const text = chunk.toString();
      stdout += text;
      process.stdout.write(text);
    });
    child.stderr.on('data', (chunk) => {
      const text = chunk.toString();
      stderr += text;
      process.stderr.write(text);
    });
    child.on('exit', (code) => {
      const finishedAt = new Date().toISOString();
      resolve({
        tool,
        command: command.display,
        exitCode: code ?? 1,
        startedAt,
        finishedAt,
        durationMs: Date.now() - startedMs,
        stdout,
        stderr,
        payload: parseJsonPayload(stdout)
      });
    });
  });
}

function toolRunFromResult(result) {
  const payload = result.payload || {};
  const payloadFailures = Array.isArray(payload.failures) ? payload.failures : [];
  const status = result.exitCode !== 0
    ? 'failed'
    : payloadFailures.length
      ? 'partial'
      : 'success';
  const failures = result.exitCode !== 0 && !payloadFailures.length
    ? [{
        tool: result.tool.name,
        attemptedMethod: result.command,
        error: tail(result.stderr || result.stdout || `Process exited with ${result.exitCode}`),
        impact: 'The collector did not complete successfully.',
        fallback: 'Review the command output and rerun after fixing the tool or source issue.',
        severity: result.tool.required ? 'error' : 'warning'
      }]
    : payloadFailures;

  return {
    id: result.tool.id,
    name: result.tool.name,
    command: result.command,
    required: result.tool.required,
    status,
    exitCode: result.exitCode,
    startedAt: result.startedAt,
    finishedAt: result.finishedAt,
    durationMs: result.durationMs,
    notes: payload.itemCount !== undefined ? `${payload.itemCount} items collected after filtering.` : '',
    stdoutTail: tail(result.stdout),
    stderrTail: tail(result.stderr),
    sourceFiles: Array.isArray(payload.sourceFiles) ? payload.sourceFiles : [],
    sourcesUsed: Array.isArray(payload.sourcesUsed) ? payload.sourcesUsed : [],
    skippedSources: Array.isArray(payload.skippedSources) ? payload.skippedSources : [],
    failures
  };
}

const runCreator = getTool('create-run');
const runSetup = await runTool(runCreator, { date: runDate });
const runSetupPayload = runSetup.payload;

if (runSetup.exitCode !== 0 || !runSetupPayload?.runDir) {
  console.error('\nPipeline could not create a run folder.');
  process.exit(runSetup.exitCode || 1);
}

const runDir = runSetupPayload.runDir;
await recordToolRun(runDir, toolRunFromResult(runSetup));

const failures = [];
for (const tool of collectionSteps()) {
  const result = await runTool(tool);
  await recordToolRun(runDir, toolRunFromResult(result));
  if (result.exitCode !== 0 && tool.required) {
    failures.push({ tool: tool.id, command: commandForTool(tool, ticker).display, code: result.exitCode });
  }
}

if (failures.length) {
  console.error('\nPipeline completed with required tool failures:');
  console.error(JSON.stringify(failures, null, 2));
  process.exit(1);
}

console.log(`\nPipeline completed for ${ticker}. Run folder: ${runDir}`);
