export function getArg(name, fallback = undefined) {
  const prefix = `--${name}=`;
  const exact = `--${name}`;
  const argv = process.argv.slice(2);
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value.startsWith(prefix)) return value.slice(prefix.length);
    if (value === exact) return argv[index + 1] ?? fallback;
  }
  return fallback;
}

export function requireArg(name) {
  const value = getArg(name);
  if (!value) {
    console.error(`Missing required argument: --${name}`);
    process.exit(1);
  }
  return value;
}

export function boolArg(name, fallback = false) {
  const value = getArg(name);
  if (value === undefined) return fallback;
  return ['1', 'true', 'yes', 'y'].includes(String(value).toLowerCase());
}
