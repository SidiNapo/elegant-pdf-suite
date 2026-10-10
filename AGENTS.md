# Agent rules

- Every server snapshot in `api/render.js` ends with `siteNav()` (crawlable links to main pages and every tool) — raw HTML must expose the site graph before JS runs.
- UI language comes only from the saved switcher choice (`localStorage`), never from the browser setting — the rendered page must match the server HTML language for the same URL.
- Article `<html lang>`/`og:locale`/`inLanguage` come from the post's `language` field; the editor warns via `shared/detectLanguage.mjs` when the text disagrees — mislabelled language sends Google wrong signals.
- Sitemap `<lastmod>` is emitted only from real per-page timestamps (posts); static pages omit it — request-date values make Google distrust lastmod.
- Site-wide Organization/WebSite JSON-LD lives only in `index.html` — client components must not add duplicates.
