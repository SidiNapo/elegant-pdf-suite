// Canonical URL sanitizer. Guarantees the value we render is:
//   - absolute on the single canonical host (https://www.e-pdfs.com),
//   - free of query strings and fragments,
//   - trailing-slash-normalized (root keeps "/", everything else has none).
// Anything that references a different origin, has UTM/tracking params, or
// carries a hash is silently rewritten to a same-origin, path-only URL.
export const SITE_ORIGIN = 'https://www.e-pdfs.com';

export function sanitizeCanonical(input?: string | null, fallbackPath = '/'): string {
  const path = extractPath(input) || fallbackPath || '/';
  return SITE_ORIGIN + normalizePath(path);
}

function extractPath(input?: string | null): string {
  if (!input) return '';
  const raw = String(input).trim();
  if (!raw) return '';
  try {
    // Resolve absolute or relative URLs against the canonical origin so we
    // always end up with a same-origin URL object.
    const u = new URL(raw, SITE_ORIGIN);
    // External host? Ignore it — canonical stays on-origin.
    return u.pathname || '/';
  } catch {
    // If URL parsing fails, treat the string as a raw path.
    return raw.split('?')[0].split('#')[0];
  }
}

function normalizePath(p: string): string {
  let out = p || '/';
  if (!out.startsWith('/')) out = '/' + out;
  // Drop trailing slash except for root.
  if (out.length > 1 && out.endsWith('/')) out = out.slice(0, -1);
  return out;
}
