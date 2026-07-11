// Shared HTML sanitizer for blog content (client side).
// Backed by the single shared implementation in shared/sanitize.mjs so the
// browser and the server (api/render.js, api/sitemap.js) enforce the exact
// same allowlist.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - plain JS ESM module shared with the Vercel serverless functions
export { sanitizeBlogHtml, SANITIZE_OPTIONS, ALLOWED_TAGS } from "../../shared/sanitize.mjs";
