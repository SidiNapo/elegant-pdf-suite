// Shared HTML sanitizer + allowlist used by BOTH the browser (rich-text editor,
// blog rendering) and the server (Vercel api/render.js, api/sitemap.js).
// One robust implementation (sanitize-html) with a single shared allowlist.
import sanitizeHtml from "sanitize-html";

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
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesByTag: { img: ["http", "https"] },
  allowProtocolRelative: false,
  disallowedTagsMode: "discard",
  transformTags: {
    // No H1 allowed in body — demote to H2. Alias deprecated tags.
    h1: "h2",
    b: "strong",
    i: "em",
    a: (tagName, attribs) => {
      const out = { ...attribs };
      if (out.target === "_blank") out.rel = "noopener noreferrer";
      return { tagName: "a", attribs: out };
    },
    img: (tagName, attribs) => {
      const out = { ...attribs };
      out.loading = out.loading || "lazy";
      out.decoding = out.decoding || "async";
      if (!out.alt) out.alt = "";
      return { tagName: "img", attribs: out };
    },
  },
};

/** Sanitize blog body HTML with the shared allowlist (client + server). */
export function sanitizeBlogHtml(html) {
  if (!html) return "";
  return sanitizeHtml(html, SANITIZE_OPTIONS);
}
