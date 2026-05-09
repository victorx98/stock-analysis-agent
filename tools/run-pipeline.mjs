#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { requireArg } from './lib/args.mjs';

const ticker = requireArg('ticker').toUpperCase();

async function run(command, args) {
  console.log(`\n> ${command} ${args.join(' ')}`);
  return new Promise((resolve) => {
    const child = spawn(command, args, { stdio: 'inherit', shell: process.platform === 'win32' });
    child.on('exit', (code) => resolve(code ?? 1));
  });
}

const steps = [
  ['node', ['tools/fetch-sec-filings.mjs', '--ticker', ticker]],
  ['node', ['tools/fetch-trusted-news.mjs', '--ticker', ticker]],
  ['node', ['tools/fetch-market-trends.mjs', '--ticker', ticker]],
  ['node', ['tools/create-run-analysis.mjs', '--ticker', ticker]]
];

const failures = [];
for (const [command, args] of steps) {
  const code = await run(command, args);
  if (code !== 0) failures.push({ command, args, code });
}

if (failures.length) {
  console.error('\nPipeline completed with failures:');
  console.error(JSON.stringify(failures, null, 2));
  process.exit(1);
}

console.log(`\nPipeline completed for ${ticker}.`);
