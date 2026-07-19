// Vercel serverless function: RSS 2.0 feed of published blog posts.
// Reachable at /feed.xml via the rewrite in vercel.json. Absolute www URLs
// throughout — matches our single canonical host.

const SITE_URL = "https://www.e-pdfs.com";
const SITE_NAME = "E-Pdf's";
const FEED_DESCRIPTION =
  "Derniers guides et astuces PDF publiés sur E-Pdf's — compresser, fusionner, convertir vos documents en toute sécurité.";

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  "https://obetkqazuirhntzpjzou.supabase.co";
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iZXRrcWF6dWlyaG50enBqem91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3MjE2NjcsImV4cCI6MjA4MzI5NzY2N30.IhL7av9GynEuMDTkVYV8g-yOUHYutySu3KcD_H8Vrzk";

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const cdata = (s) => `<![CDATA[${String(s ?? "").replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;

function rfc822(dateLike) {
  const d = dateLike ? new Date(dateLike) : new Date();
  if (Number.isNaN(d.getTime())) return new Date().toUTCString();
  return d.toUTCString();
}

export default async function handler(_req, res) {
  res.setHeader("Content-Type", "application/rss+xml; charset=utf-8");
  try {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/blog_posts?select=slug,title,excerpt,author_name,published_at,updated_at,featured_image&is_published=eq.true&order=published_at.desc&limit=50`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } },
    );
    const posts = r.ok ? await r.json() : [];
    const lastBuild = rfc822(posts[0]?.updated_at || posts[0]?.published_at);

    const items = (posts || [])
      .map((p) => {
        const url = `${SITE_URL}/blog/${p.slug}`;
        return [
          `    <item>`,
          `      <title>${esc(p.title)}</title>`,
          `      <link>${esc(url)}</link>`,
          `      <guid isPermaLink="true">${esc(url)}</guid>`,
          `      <pubDate>${rfc822(p.published_at)}</pubDate>`,
          p.author_name ? `      <dc:creator>${esc(p.author_name)}</dc:creator>` : "",
          p.excerpt ? `      <description>${cdata(p.excerpt)}</description>` : "",
          p.featured_image
            ? `      <enclosure url="${esc(p.featured_image)}" type="image/jpeg" />`
            : "",
          `    </item>`,
        ]
          .filter(Boolean)
          .join("\n");
      })
      .join("\n");

    const xml =
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">\n` +
      `  <channel>\n` +
      `    <title>${esc(SITE_NAME)} — Blog</title>\n` +
      `    <link>${SITE_URL}/blog</link>\n` +
      `    <description>${esc(FEED_DESCRIPTION)}</description>\n` +
      `    <language>fr</language>\n` +
      `    <lastBuildDate>${lastBuild}</lastBuildDate>\n` +
      `    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />\n` +
      items +
      `\n  </channel>\n` +
      `</rss>`;

    res.setHeader("Cache-Control", "public, s-maxage=1800, stale-while-revalidate=86400");
    res.statusCode = 200;
    res.end(xml);
  } catch (e) {
    res.statusCode = 503;
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Retry-After", "30");
    res.end(`<!-- feed temporarily unavailable -->`);
  }
}
