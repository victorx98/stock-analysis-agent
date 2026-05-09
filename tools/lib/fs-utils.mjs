import { mkdir, readFile, writeFile, cp, access } from 'node:fs/promises';
import path from 'node:path';

export const repoRoot = process.cwd();

export async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function ensureDir(dirPath) {
  await mkdir(dirPath, { recursive: true });
}

export async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

export async function writeJson(filePath, value) {
  await ensureDir(path.dirname(filePath));
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

export async function writeText(filePath, text) {
  await ensureDir(path.dirname(filePath));
  await writeFile(filePath, text.endsWith('\n') ? text : `${text}\n`, 'utf8');
}

export async function copyDir(from, to) {
  await cp(from, to, { recursive: true, force: false, errorOnExist: true });
}

export function stockDir(ticker) {
  return path.join(repoRoot, 'stocks', ticker.toUpperCase());
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export async function nextRunDir(ticker, baseDate = todayIso()) {
  const base = path.join(stockDir(ticker), 'runs', baseDate);
  if (!(await exists(base))) return base;
  for (let i = 2; i < 100; i += 1) {
    const candidate = path.join(stockDir(ticker), 'runs', `${baseDate}-${String(i).padStart(2, '0')}`);
    if (!(await exists(candidate))) return candidate;
  }
  throw new Error(`Could not create unique run folder for ${ticker} on ${baseDate}`);
}
