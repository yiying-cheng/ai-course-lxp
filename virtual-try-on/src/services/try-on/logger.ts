const isDev = process.env.NODE_ENV === 'development';

export function devLog(scope: string, message: string, meta?: Record<string, unknown>) {
  if (!isDev) return;
  const safeMeta = meta ? sanitizeMeta(meta) : undefined;
  console.log(`[${scope}] ${message}`, safeMeta ?? '');
}

function sanitizeMeta(meta: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(meta)) {
    if (key.toLowerCase().includes('key') || key.toLowerCase().includes('authorization')) {
      continue;
    }
    if (typeof value === 'string' && value.startsWith('data:image')) {
      out[key] = `[data-url ${value.length} chars]`;
      continue;
    }
    out[key] = value;
  }
  return out;
}
