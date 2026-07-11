// Single canonical domain used everywhere (canonical, OG, Twitter, JSON-LD, sitemap).
// Production redirects e-pdfs.com -> www.e-pdfs.com, so www is the canonical host.
export const SITE_URL = "https://www.e-pdfs.com";
export const SITE_NAME = "E-Pdf's";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;

/** Build an absolute URL on the canonical host from a relative path. */
export const absoluteUrl = (path: string) => {
  if (!path) return SITE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
};
