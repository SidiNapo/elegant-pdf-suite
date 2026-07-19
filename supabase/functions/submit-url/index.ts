// Submits URLs to search engines automatically via IndexNow (Bing, Yandex, Seznam, etc.)
// and pings the sitemap so Google rediscovers it. No external auth required.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SITE = "https://www.e-pdfs.com";
// Same value as the Vercel INDEXNOW_KEY env var. Served at /indexnow-key.txt
// via api/indexnow-key.js — the keyLocation below MUST match that path exactly.
const INDEXNOW_KEY = (Deno.env.get("INDEXNOW_KEY") ?? "").trim();

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let urls: string[] = [];

    // Accept explicit URLs, or build the full list from all published posts.
    try {
      const body = await req.json();
      if (Array.isArray(body?.urls)) urls = body.urls;
      else if (typeof body?.url === "string") urls = [body.url];
    } catch {
      // no body provided
    }

    if (urls.length === 0) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      );
      const { data } = await supabase
        .from("blog_posts")
        .select("slug")
        .eq("is_published", true);
      urls = [
        `${SITE}/`,
        `${SITE}/blog`,
        ...(data ?? []).map((p) => `${SITE}/blog/${p.slug}`),
      ];
    }

    // Normalize to absolute URLs
    urls = urls.map((u) => (u.startsWith("http") ? u : `${SITE}${u.startsWith("/") ? "" : "/"}${u}`));

    const results: Record<string, unknown> = {};

    // 1) IndexNow — instantly notifies Bing, Yandex, Seznam, Naver
    const indexNowRes = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: "www.e-pdfs.com",
        key: INDEXNOW_KEY,
        keyLocation: `${SITE}/${INDEXNOW_KEY}.txt`,
        urlList: urls,
      }),
    });
    results.indexnow = { status: indexNowRes.status };

    // 2) Ping Bing webmaster ping (extra signal)
    try {
      await fetch(
        `https://www.bing.com/ping?sitemap=${encodeURIComponent(`${SITE}/sitemap.xml`)}`,
      );
    } catch { /* ping is best-effort */ }

    return new Response(
      JSON.stringify({ success: true, submitted: urls.length, urls, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ success: false, error: String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
