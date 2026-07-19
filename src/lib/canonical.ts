// Canonical URL sanitizer. Guarantees the value we render is:
//   - absolute on the single canonical host (https://www.e-pdfs.com),
//   - free of query strings and fragments,
//   - trailing-slash-normalized (root keeps "/", everything else has none).
// Anything that references a different origin, has UTM/tracking params, or
// carries a hash is silently rewritten to a same-origin, path-only URL.
export const SITE_ORIGIN = 'https://www.e-pdfs.com';

// Slug format for blog articles — must match api/render.js#BLOG_SLUG_RE.
export const BLOG_SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export function isValidBlogSlug(slug: unknown): slug is string {
  return typeof slug === 'string' && BLOG_SLUG_RE.test(slug);
}

/**
 * Blog canonical URL. Always derived purely from the slug — any stored
 * `canonical_url` value from the database is ignored so bad or stale data
 * cannot leak into the rendered <link rel="canonical">. Returns `null` when
 * the slug is not a valid shape; callers should render a noindex 404 in
 * that case.
 */
export function blogCanonicalFromSlug(slug: unknown): string | null {
  if (!isValidBlogSlug(slug)) return null;
  return `${SITE_ORIGIN}/blog/${slug}`;
}

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

