#!/usr/bin/env node
import path from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';
import { getArg, requireArg } from './lib/args.mjs';
import { copyDir, exists, repoRoot, stockDir } from './lib/fs-utils.mjs';

const ticker = requireArg('ticker').toUpperCase();
const company = getArg('company', 'Company Name');
const target = stockDir(ticker);
const template = path.join(repoRoot, 'stocks', '_TEMPLATE');

if (await exists(target)) {
  console.log(`Ticker folder already exists: ${target}`);
  process.exit(0);
}

await copyDir(template, target);

async function replaceInFile(relativePath) {
  const file = path.join(target, relativePath);
  const text = await readFile(file, 'utf8');
  await writeFile(file, text.replaceAll('TICKER', ticker).replaceAll('Company Name', company), 'utf8');
}

await replaceInFile('profile.json');
await replaceInFile('summary.md');

console.log(`Created ${target}`);
