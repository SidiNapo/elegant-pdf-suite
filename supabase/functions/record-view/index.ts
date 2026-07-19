// Records a deduplicated blog post view.
// Client posts { post_id }. We compute a salted SHA-256 of IP + User-Agent
// server-side (raw IP is never stored) and call the server-only
// record_post_view RPC, which dedupes per visitor per day.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json", Allow: "POST, OPTIONS" },
    });
  }

  try {
    const { post_id } = await req.json().catch(() => ({}));
    if (typeof post_id !== "string" || !UUID_RE.test(post_id)) {
      return new Response(JSON.stringify({ error: "invalid_post_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const salt = Deno.env.get("VIEW_HASH_SALT") ?? "";
    if (!salt) {
      return new Response(JSON.stringify({ error: "server_misconfigured" }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("cf-connecting-ip") ??
      req.headers.get("x-real-ip") ??
      "unknown";
    const ua = req.headers.get("user-agent") ?? "unknown";
    const today = new Date().toISOString().slice(0, 10);

    const visitor_hash = await sha256Hex(`${salt}|${ip}|${ua}|${today}`);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    const { data, error } = await supabase.rpc("record_post_view", {
      _post_id: post_id,
      _visitor_hash: visitor_hash,
    });

    if (error) {
      return new Response(JSON.stringify({ error: "db_error" }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ recorded: !!data }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (_e) {
    return new Response(JSON.stringify({ error: "internal_error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
