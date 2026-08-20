// Shared SEO constants used by BOTH the server prerender (api/render.js) and
// the client head manager (src/components/SEOHead.tsx) so the two can never
// drift. Keeping `max-image-preview:large` is what allows large image previews
// in Google Search / Discover — never downgrade it to "index, follow".
export const ROBOTS_INDEX =
  "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";
export const ROBOTS_NOINDEX = "noindex, nofollow";
