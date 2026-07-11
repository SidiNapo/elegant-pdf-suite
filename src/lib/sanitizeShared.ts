// Shared HTML sanitizer + allowlist used by BOTH the browser (rich-text editor,
// blog rendering) and the server (Vercel render.js / api functions).
// One robust implementation (sanitize-html) with a single shared allowlist.
import sanitizeHtml from "sanitize-html";

// Canonical semantic allowlist for blog body content.
export const ALLOWED_TAGS = [
  "h2", "h3", "h4", "p", "ul", "ol", "li", "a", "strong", "em",
  "blockquote", "img", "figure", "figcaption", "table", "thead",
  "tbody", "tr", "th", "td", "code", "pre", "br", "hr",
];

export const SANITIZE_OPTIONS = {
  allowedTags: ALLOWED_TAGS,
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
    img: ["src", "alt", "width", "height", "loading", "decoding"],
    th: ["colspan", "rowspan"],
    td: ["colspan", "rowspan"],
  },
  // Safe protocols only — no javascript: and no arbitrary data: URLs.
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesByTag: { img: ["http", "https"] },
  allowProtocolRelative: false,
  disallowedTagsMode: "discard" as const,
  transformTags: {
    // No H1 allowed in body — demote to H2. Alias deprecated tags.
    h1: "h2",
    b: "strong",
    i: "em",
    a: (tagName: string, attribs: Record<string, string>) => {
      const out: Record<string, string> = { ...attribs };
      if (out.target === "_blank") out.rel = "noopener noreferrer";
      return { tagName: "a", attribs: out };
    },
    img: (tagName: string, attribs: Record<string, string>) => {
      const out: Record<string, string> = { ...attribs };
      out.loading = out.loading || "lazy";
      out.decoding = out.decoding || "async";
      if (!out.alt) out.alt = "";
      return { tagName: "img", attribs: out };
    },
  },
};

/** Sanitize blog body HTML with the shared allowlist (client + server). */
export function sanitizeBlogHtml(html: string): string {
  if (!html) return "";
  return sanitizeHtml(html, SANITIZE_OPTIONS);
}
