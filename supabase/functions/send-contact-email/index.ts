import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

const ALLOWED_ORIGINS = new Set([
  "https://www.e-pdfs.com",
  "https://e-pdfs.com",
  "http://localhost:8080",
  "http://localhost:5173",
]);

function corsHeadersFor(origin: string | null) {
  const allow = origin && ALLOWED_ORIGINS.has(origin) ? origin : "https://www.e-pdfs.com";
  return {
    "Access-Control-Allow-Origin": allow,
    "Vary": "Origin",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
  website?: string; // honeypot
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function sha256Hex(input: string): Promise<string> {
  const buf = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

const handler = async (req: Request): Promise<Response> => {
  const origin = req.headers.get("origin");
  const cors = corsHeadersFor(origin);

  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { "Content-Type": "application/json", ...cors },
    });
  }

  try {
    const body = (await req.json()) as ContactFormData;
    const { firstName, lastName, email, subject, message, website } = body || {};

    // Honeypot: silently succeed
    if (website && website.trim().length > 0) {
      console.log("Honeypot triggered");
      return new Response(JSON.stringify({ success: true }), {
        status: 200, headers: { "Content-Type": "application/json", ...cors },
      });
    }

    if (!firstName || !lastName || !email || !subject || !message) {
      return new Response(JSON.stringify({ error: "All fields are required" }), {
        status: 400, headers: { "Content-Type": "application/json", ...cors },
      });
    }
    if (!emailRegex.test(email) || email.length > 200) {
      return new Response(JSON.stringify({ error: "Invalid email" }), {
        status: 400, headers: { "Content-Type": "application/json", ...cors },
      });
    }
    if (firstName.length > 100 || lastName.length > 100 || subject.length > 300 || message.length > 5000 || message.length < 10) {
      return new Response(JSON.stringify({ error: "Invalid field length" }), {
        status: 400, headers: { "Content-Type": "application/json", ...cors },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Rate-limit: 5 messages / 10 minutes per hashed IP
    const salt = Deno.env.get("CONTACT_RATE_LIMIT_SALT") || "fallback-salt";
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";
    const ipHash = await sha256Hex(`${ip}:${salt}`);

    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("created_at", tenMinAgo);

    if ((count ?? 0) >= 5) {
      return new Response(JSON.stringify({ error: "Too many requests. Please try again later." }), {
        status: 429, headers: { "Content-Type": "application/json", ...cors },
      });
    }

    const { data: inserted, error: insertError } = await supabase
      .from("contact_messages")
      .insert({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim().toLowerCase(),
        subject: subject.trim(),
        message: message.trim(),
        ip_hash: ipHash,
        user_agent: userAgent.slice(0, 500),
        status: "new",
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Insert failed:", insertError);
      return new Response(JSON.stringify({ error: "Could not save message" }), {
        status: 500, headers: { "Content-Type": "application/json", ...cors },
      });
    }

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (resendKey) {
      try {
        const resend = new Resend(resendKey);
        const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
        const html = `
          <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
            <h2 style="color:#ec4899;margin:0 0 16px;">New contact message</h2>
            <p style="margin:4px 0"><strong>From:</strong> ${esc(firstName)} ${esc(lastName)} &lt;${esc(email)}&gt;</p>
            <p style="margin:4px 0"><strong>Subject:</strong> ${esc(subject)}</p>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0"/>
            <p style="white-space:pre-wrap;line-height:1.6">${esc(message)}</p>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0"/>
            <p style="font-size:12px;color:#6b7280">Reply directly to this email to respond to ${esc(firstName)}.</p>
          </div>`;
        await resend.emails.send({
          from: "E-PDF's Contact <onboarding@resend.dev>",
          to: ["contact@e-pdfs.com"],
          reply_to: email,
          subject: `[Contact] ${subject}`,
          html,
        });
      } catch (e) {
        console.error("Resend failure (message still stored):", e);
      }
    }

    return new Response(JSON.stringify({ success: true, id: inserted?.id }), {
      status: 200, headers: { "Content-Type": "application/json", ...cors },
    });
  } catch (err) {
    console.error("send-contact-email error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500, headers: { "Content-Type": "application/json", ...cors },
    });
  }
};

serve(handler);
