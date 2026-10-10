# Indexing audit: e-pdfs.com (read-only), plus proposed fixes

Audit run on 2026-10-10, roughly 16:13 UTC. I fetched the live pages directly and also loaded them in headless Chromium against production. Nothing was changed. Git HEAD is `9eb01c7`, the same as the commit you named.

## A. Confirmed findings, with evidence

**1. The live deployment is older than the source code (`9eb01c7`).**
- The source homepage has a "Derniers articles du blog" section, in two places:
  - the server version: `api/render.js:417-419` and `:709-710`
  - the browser version: `LatestPosts` in `src/pages/Index.tsx` (about line 578)
- Live raw `/` has 1 h1, 207 words and 7 links. None of them point to `/blog/...`, and the "Derniers articles" text is missing.
- Live main bundle `/assets/index-gxplsKKc.js` (287 KB):
  - It contains Index code (the `seo.paragraph1` string is there).
  - It has 0 matches for "Derniers articles" and 0 for the `blog-posts` query key. So the Index that is live does not call `usePublishedPosts`.
- After JS runs in the browser, `/` still has no `/blog/` links.
- Result: the homepage-to-article links from the last fix were never deployed. The articles are still linked only from `/blog`, from each other, and from the sitemap.
- I can't see from here whether Vercel is failing to build or the GitHub link is disconnected. Check that in Vercel's deployments list.

**2. Both articles are in English but are labelled French.**
- In the database (public, published rows only), both posts have `language = 'fr'`.
- The live raw HTML of both articles has `<html lang="fr">` and `og:locale fr_FR`. The rendered DOM also has `lang="fr"`.
- The titles and bodies are English, e.g. "Best PDF to Word Converter: Top Picks Reviewed" and "How to Convert PDF to Word Free Online…".
- `render.js:524-526` picks the language from the database field, so the cause is the data, not the code.

**3. The browser switches the page language from the visitor's browser setting, so the same address shows different languages.**
- `src/i18n/index.ts:22-24` checks `localStorage` first, then the browser's language setting. The fallback is `fr`.
- Raw `/` gives the title "E-Pdf's - Outils PDF Gratuits en Ligne…" (French).
- After JS in an en-US Chromium, the title is "E-PDF's - Free Online PDF Tools…" and the H1 is "All your PDF tools in one place" (English), while `lang` stays `fr`.
- `/blog` and `/tools` flip the same way.
- So the raw HTML and the rendered page of one address disagree in language. Google's own renderer may or may not run with an en-US setting; I haven't confirmed that.

**4. Sitemap `lastmod` dates are not real for most entries.**
- `api/sitemap.js:103-106` uses the request date for every static, tool and programmatic entry.
- Live: 35 of 37 `<lastmod>` values are `2026-10-10` (today). Only the 2 posts carry real dates (`2026-09-15`).
- Google tends to stop trusting `lastmod` across a site when it keeps changing without real edits.

**5. The raw HTML of the pages that list content is thin.**
- Raw `/tools`: 1 h1, 188 words, 0 `<a>` links.
- Raw `/blog`: 289 words and only 2 `<a>` links (the two posts). There are no menu or footer links.
- Raw `/`: 7 links.
- After JS the pages are fuller (`/tools` about 764 words).

**6. The server sends related-article data that the browser never uses.**
- `render.js:597` emits a `__BLOG_RELATED__` data block.
- `useBlogPosts.ts` reads only `__BLOG_LIST__` and `__BLOG_POST__`.
- Effect: one extra request. This is not an indexing blocker.

**7. Errors fetching the homepage article list are hidden.**
- Server side, `render.js:710` does `catch { latest = [] }` with no log.
- Browser side, `LatestPosts` returns `null` on error or empty data.
- If the list fetch fails, nothing is recorded. This makes problem 1 hard to see.

**8. Company and site info appears twice on the homepage after JS.**
- The rendered `/` has 4 JSON-LD blocks: Organization and WebSite, each twice. Articles have 4 distinct blocks.
- This is minor.

**9. The 404 page points its canonical at itself.**
- `/blog/does-not-exist-xyz` returns 404 with `noindex` (meta tag and `X-Robots-Tag` header), plus a self-canonical.
- This is harmless but untidy.

## B. Things that are fine (checked, not assumed)

**Status codes, across several user-agents:**

| Fetched as | `/`, `/blog`, both articles, `/tools`, sitemap, robots.txt | Unknown slug |
|---|---|---|
| Googlebot UA (from this sandbox) | 200 | 404 |
| Chrome UA | 200 | 404 |
| `Python-urllib` UA | 403 (Cloudflare error 1010) | 403 |

- The 403s come from Cloudflare (with a `cf-ray` header) and never reach Vercel. Error 1010 is Cloudflare blocking that client's browser signature.
- A Googlebot user-agent sent from a non-Google IP was let through. So there is no user-agent rule blocking Googlebot.
- This does not prove that real, verified Googlebot gets through (see C1).

**Articles in the raw HTML:**
- Each has the right title, its own `https://www.e-pdfs.com/blog/{slug}` canonical and `index, follow, max-image-preview:large`.
- Each has 1 h1, the full body (2,682 and 3,422 words), and BlogPosting and BreadcrumbList data.

**Articles after JS (headless Chromium, production):**
- No page errors and no failed requests. The only console warning is a favicon preload.
- Title, canonical and robots tag are unchanged, there is still exactly one H1, and the body stays full (2,834 and 3,582 words).

**Leads you raised, where I found no harm in the final DOM:**
- `createRoot` replacing the server snapshot, and the Suspense loading state on lazy routes.
- The shared sanitizer working in the browser.
- One unmeasured risk remains: the brief loading screen if a renderer takes its snapshot early.

**Sitemap:** HTTP 200 with 37 URLs, including both posts.

**robots.txt:** allows `/` and lists the sitemap.

**Public database:** the anon key can read both posts as `is_published = true`.

## C. Open questions that need your Search Console or Cloudflare data

1. **Is real Googlebot blocked or challenged?**
   - Cloudflare, Security → Events: filter by Verified Bot = Googlebot and by Action = Block/Challenge/JS Challenge.
   - Also check Bot Fight Mode / Super Bot Fight Mode settings, and whether Browser Integrity Check is causing the 1010 errors.
2. **Crawl Stats in Search Console** (Settings → Crawl stats): host status (robots.txt fetch, DNS, server connection) and response-code breakdown.
   - Failed robots.txt fetches or many 5xx or 403 responses would explain "Discovered – not indexed" with no crawl.
3. **Has the sitemap been fetched?** In Search Console → Sitemaps, check the status, the last-read date and the discovered URL count.
4. **Low priority from Google:** with no external links and few internal links, "Détectée, non indexée" can just mean Google hasn't prioritised crawling yet. Only Crawl Stats plus backlink data can tell this apart from C1. I can't confirm it from code.
5. **Vercel deployment state:** why the live build is older than `9eb01c7` (failed build, wrong branch, or GitHub link disconnected).

## D. Proposed fixes (only after you approve)

Ordered by likely impact. I will not promise any indexing outcome or timeline.

1. **Redeploy the current source to Vercel.** Then re-check live `/` for article links in both the raw HTML and the rendered page.
2. **Fix the language labels.**
   - Set both posts to `language = 'en'`.
   - Make the editor's language selector required and visible on save.
   - Optionally, add a warning when the detected text language doesn't match the field.
3. **Make each address show one language.**
   - Stop detecting language from the browser setting (keep a saved user choice only).
   - For French addresses, render French by default so the raw and rendered pages match.
4. **Sitemap dates:** remove `lastmod` from static, tool and programmatic entries, and keep real dates for posts only.
5. **Richer raw HTML:**
   - Add crawlable menu and footer links (home, tools, blog, each tool) to every server snapshot.
   - Make the `/tools` snapshot list every tool as a link with a one-line description.
6. **Related articles:** have the browser use the `__BLOG_RELATED__` data the server already sends.
7. **Visible errors:** log failures of the homepage article-list fetch on the server, and send an `X-Render-Warn` header so smoke tests catch them.
8. **Remove the duplicate** Organization/WebSite data blocks after JS.
9. **Add regression tests** to `scripts/seo-smoke.mjs`:
   - homepage raw HTML must contain at least 1 `/blog/` link
   - article `lang` must match the post's language
   - static sitemap entries must not have `lastmod` equal to today
   - raw `/tools` must have at least 20 links

## Technical notes

- Files involved:
  - `api/render.js` (renderStatic, menu/footer snapshot, logging)
  - `api/sitemap.js:103-106`
  - `src/i18n/index.ts`
  - `src/hooks/useBlogPosts.ts` (related-articles data; this file is touched only for that)
  - `src/components/StructuredData.tsx` or `index.html` (duplicate data blocks)
  - `src/pages/admin/AdminPostEditor.tsx` (language field)
  - `scripts/seo-smoke.mjs`
- One data update: set the language field on the 2 posts.
- No credentials appear in this report.
