// Vercel serverless function: dynamic sitemap.xml served from the main domain.
// Includes static routes, all tools, programmatic pages, and every published post.
import { PROGRAMMATIC_PAGES } from "./_programmatic.js";

const SITE_URL = "https://www.e-pdfs.com";

// Public rendering uses ONLY the anon key. Never fall back to the service-role
// key here — it's reserved for privileged server jobs.
const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || "";

const STATIC_ROUTES = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/tools", priority: "0.9", changefreq: "weekly" },
  { path: "/blog", priority: "0.9", changefreq: "daily" },
  { path: "/about", priority: "0.6", changefreq: "monthly" },
  { path: "/contact", priority: "0.6", changefreq: "monthly" },
  { path: "/privacy", priority: "0.3", changefreq: "yearly" },
  { path: "/terms", priority: "0.3", changefreq: "yearly" },
  { path: "/cookies", priority: "0.3", changefreq: "yearly" },
  { path: "/dmca", priority: "0.3", changefreq: "yearly" },
];

const TOOL_ROUTES = [
  "merge", "split", "compress", "rotate", "crop", "delete-pages", "extract-pages",
  "organize", "page-numbers", "watermark", "edit", "repair", "compare", "scan-to-pdf",
  "jpg-to-pdf", "pdf-to-jpg", "pdf-to-word", "word-to-pdf", "pdf-to-ppt", "ppt-to-pdf",
  "excel-to-pdf", "pdf-to-excel",
].map((t) => ({ path: `/${t}`, priority: "0.8", changefreq: "monthly" }));

const PROGRAMMATIC_ROUTES = PROGRAMMATIC_PAGES.map((p) => ({
  path: `/p/${p.slug}`, priority: "0.7", changefreq: "monthly",
}));

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

function imageBlock(image) {
  return `
    <image:image>
      <image:loc>${esc(image.loc)}</image:loc>${image.title ? `\n      <image:title>${esc(image.title)}</image:title>` : ""}${image.caption ? `\n      <image:caption>${esc(image.caption)}</image:caption>` : ""}
    </image:image>`;
}

function urlEntry(path, priority, changefreq, lastmod, images) {
  const list = Array.isArray(images) ? images : images ? [images] : [];
  return `  <url>
    <loc>${esc(`${SITE_URL}${path}`)}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ""}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>${list.map(imageBlock).join("")}
  </url>`;
}

// Collect every distinct <img src> from sanitized post HTML.
function contentImages(html) {
  const out = [];
  const seen = new Set();
  const re = /<img\b[^>]*?\bsrc=["']([^"']+)["'][^>]*>/gi;
  let m;
  while ((m = re.exec(String(html || "")))) {
    const raw = m[1].trim();
    if (!/^https?:\/\//i.test(raw) && !raw.startsWith("/")) continue;
    const loc = absolute(raw);
    if (!loc || seen.has(loc)) continue;
    seen.add(loc);
    const alt = /\balt=["']([^"']*)["']/i.exec(m[0]);
    out.push({ loc, title: alt && alt[1] ? alt[1] : "" });
  }
  return out;
}

const absolute = (u) => {
  if (!u) return null;
  const s = String(u).trim();
  if (!s) return null;
  if (/^https:\/\//i.test(s)) return s;
  if (/^http:\/\//i.test(s)) return s.replace(/^http:/i, "https:");
  return `${SITE_URL}${s.startsWith("/") ? s : `/${s}`}`;
};

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  try {
    // A failed post fetch must NOT silently emit a sitemap missing every
    // article — that would look to Google like the articles were removed.
    // Fail loudly with a 503 so the previous sitemap keeps its authority.
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      res.statusCode = 503;
      res.setHeader("Cache-Control", "no-store");
      res.setHeader("Retry-After", "60");
      res.end(`<!-- sitemap unavailable: backend not configured -->`);
      return;
    }
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/blog_posts?select=slug,title,excerpt,featured_image,featured_image_alt,updated_at,published_at,content&is_published=eq.true&order=published_at.desc`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    );
    if (!r.ok) throw new Error(`supabase ${r.status}`);
    const posts = await r.json();
    // A non-array payload means the query shape changed or an error object came
    // back. Never degrade to a post-less 200.
    if (!Array.isArray(posts)) throw new Error("supabase returned a non-array payload");

    const buildDate = new Date().toISOString().slice(0, 10);
    const entries = [];
    for (const rt of [...STATIC_ROUTES, ...TOOL_ROUTES, ...PROGRAMMATIC_ROUTES]) {
      entries.push(urlEntry(rt.path, rt.priority, rt.changefreq, buildDate));
    }
    for (const p of posts) {
      const lastmod = (p.updated_at || p.published_at || "").slice(0, 10);
      const images = [];
      const featured = absolute(p.featured_image);
      if (featured) {
        images.push({
          loc: featured,
          title: p.title || "",
          caption: p.featured_image_alt || p.excerpt || "",
        });
      }
      const seen = new Set(images.map((i) => i.loc));
      for (const img of contentImages(p.content)) {
        if (seen.has(img.loc)) continue;
        seen.add(img.loc);
        images.push({ loc: img.loc, title: img.title || p.title || "" });
      }
      entries.push(urlEntry(`/blog/${p.slug}`, "0.7", "weekly", lastmod || undefined, images));
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries.join("\n")}
</urlset>`;

    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
    res.statusCode = 200;
    res.end(xml);
  } catch (e) {
    // 503 (not 200 with a truncated list) so crawlers retry instead of
    // treating missing URLs as deletions.
    res.statusCode = 503;
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Retry-After", "60");
    res.end(`<!-- sitemap temporarily unavailable -->`);
  }
}

