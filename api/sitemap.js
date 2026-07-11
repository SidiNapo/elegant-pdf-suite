// Vercel serverless function: dynamic sitemap.xml served from the main domain.
// Includes static routes, all tools, programmatic pages, and every published post.
import { PROGRAMMATIC_PAGES } from "./_programmatic.js";

const SITE_URL = "https://www.e-pdfs.com";

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  "https://obetkqazuirhntzpjzou.supabase.co";
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iZXRrcWF6dWlyaG50enBqem91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3MjE2NjcsImV4cCI6MjA4MzI5NzY2N30.IhL7av9GynEuMDTkVYV8g-yOUHYutySu3KcD_H8Vrzk";

const STATIC_ROUTES = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/tools", priority: "0.9", changefreq: "weekly" },
  { path: "/blog", priority: "0.9", changefreq: "daily" },
  { path: "/about", priority: "0.6", changefreq: "monthly" },
  { path: "/contact", priority: "0.6", changefreq: "monthly" },
  { path: "/privacy", priority: "0.3", changefreq: "yearly" },
  { path: "/terms", priority: "0.3", changefreq: "yearly" },
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

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function urlEntry(path, priority, changefreq, lastmod) {
  return `  <url>
    <loc>${esc(`${SITE_URL}${path}`)}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ""}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  try {
    let posts = [];
    try {
      const r = await fetch(
        `${SUPABASE_URL}/rest/v1/blog_posts?select=slug,updated_at,published_at&is_published=eq.true&order=published_at.desc`,
        { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
      );
      if (r.ok) posts = await r.json();
    } catch (_e) { /* posts best-effort */ }

    const entries = [];
    for (const rt of [...STATIC_ROUTES, ...TOOL_ROUTES, ...PROGRAMMATIC_ROUTES]) {
      entries.push(urlEntry(rt.path, rt.priority, rt.changefreq));
    }
    for (const p of posts || []) {
      const lastmod = (p.updated_at || p.published_at || "").slice(0, 10);
      entries.push(urlEntry(`/blog/${p.slug}`, "0.7", "weekly", lastmod || undefined));
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>`;

    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
    res.statusCode = 200;
    res.end(xml);
  } catch (e) {
    res.statusCode = 500;
    res.end(`<!-- error: ${String(e)} -->`);
  }
}
