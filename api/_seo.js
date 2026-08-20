// Single source of truth for the robots directive. Imported by the server
// prerender (api/render.js) AND bundled into the client head manager
// (src/components/SEOHead.tsx) so the two can never drift.
// Keeping `max-image-preview:large` is what allows large image previews in
// Google Search / Discover — never downgrade it to plain "index, follow".
export const ROBOTS_INDEX =
  "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";
export const ROBOTS_NOINDEX = "noindex, nofollow";
