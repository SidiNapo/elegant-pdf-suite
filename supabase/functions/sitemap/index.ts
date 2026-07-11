// Generates sitemap.xml dynamically, always including every published blog post.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SITE = "https://e-pdfs.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Static, indexable routes of the app.
const STATIC_ROUTES: { path: string; priority: string; changefreq: string }[] = [
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

// Programmatic long-tail landing pages (/p/:slug).
const PROGRAMMATIC_ROUTES = [
  "compresser-pdf-pour-gmail",
  "reduire-pdf-a-200ko",
  "png-en-pdf",
  "fusionner-pdf-sans-telechargement",
].map((s) => ({ path: `/p/${s}`, priority: "0.7", changefreq: "monthly" }));

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: posts } = await supabase
      .from("blog_posts")
      .select("slug, updated_at, published_at")
      .eq("is_published", true)
      .order("published_at", { ascending: false });

    const urlEntry = (
      path: string,
      priority: string,
      changefreq: string,
      lastmod?: string,
    ) => {
      const loc = `${SITE}${path}`;
      return `  <url>
    <loc>${esc(loc)}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ""}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
    };

    const entries: string[] = [];
    for (const r of [...STATIC_ROUTES, ...TOOL_ROUTES, ...PROGRAMMATIC_ROUTES]) {
      entries.push(urlEntry(r.path, r.priority, r.changefreq));
    }
    for (const p of posts ?? []) {
      const lastmod = (p.updated_at || p.published_at || "").slice(0, 10);
      entries.push(urlEntry(`/blog/${p.slug}`, "0.7", "weekly", lastmod || undefined));
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>`;

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (e) {
    return new Response(`<!-- error: ${String(e)} -->`, {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/xml" },
    });
  }
});
