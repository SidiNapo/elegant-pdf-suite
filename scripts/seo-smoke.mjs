#!/usr/bin/env node
// SEO smoke test — runs offline checks on repo artifacts and (optionally)
// read-only checks against production. Never touches the database.
//
// Local checks always run:
//   - vercel.json is valid JSON with the required rewrites/redirects
//   - every api/*.js parses (dynamic import syntax check)
//   - every src/i18n/locales/*.json parses
//   - robots.txt references the canonical sitemap URL
//   - IndexNow key files present
//
// Set SMOKE_PROD=1 to also curl https://www.e-pdfs.com endpoints
// (200/301/308/404, canonical/robots headers, sitemap+feed content-types).
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const results = [];
const record = (name, ok, detail = "") => {
  results.push({ name, ok, detail });
  const tag = ok ? "PASS" : "FAIL";
  process.stdout.write(`[${tag}] ${name}${detail ? " — " + detail : ""}\n`);
};

// ---- vercel.json -----------------------------------------------------------
try {
  const v = JSON.parse(fs.readFileSync("vercel.json", "utf8"));
  const rw = (v.rewrites || []).map((r) => r.source);
  record("vercel.json parses", true);
  record(
    "vercel.json rewrites /sitemap.xml, /feed.xml, /ads.txt, /indexnow-key.txt, SPA",
    rw.includes("/sitemap.xml") &&
      rw.includes("/feed.xml") &&
      rw.includes("/ads.txt") &&
      rw.includes("/indexnow-key.txt") &&
      rw.some((s) => s.includes("api/render") || s.includes("(?!api")),
  );
  // Explicit homepage rewrite MUST exist and MUST come before the catch-all,
  // otherwise Vercel's static filesystem step can serve dist/index.html at "/"
  // and skip api/render entirely.
  const rootIdx = rw.indexOf("/");
  const catchAllIdx = rw.findIndex((s) => s.includes("(?!api"));
  record(
    "vercel.json has explicit '/' rewrite before the SPA catch-all",
    rootIdx !== -1 && (catchAllIdx === -1 || rootIdx < catchAllIdx),
  );
  const hasApex = (v.redirects || []).some((r) =>
    (r.has || []).some((h) => h.type === "host" && h.value === "e-pdfs.com"),
  );
  record("vercel.json apex→www redirect present", hasApex);
} catch (e) {
  record("vercel.json parses", false, e.message);
}

// ---- api/*.js syntax -------------------------------------------------------
const apiDir = "api";
if (fs.existsSync(apiDir)) {
  for (const f of fs.readdirSync(apiDir)) {
    if (!f.endsWith(".js")) continue;
    const abs = path.resolve(apiDir, f);
    try {
      await import(pathToFileURL(abs).href);
      record(`api/${f} imports cleanly`, true);
    } catch (e) {
      record(`api/${f} imports cleanly`, false, e.message);
    }
  }
}

// ---- translations ----------------------------------------------------------
const locDir = "src/i18n/locales";
if (fs.existsSync(locDir)) {
  for (const f of fs.readdirSync(locDir)) {
    if (!f.endsWith(".json")) continue;
    try {
      JSON.parse(fs.readFileSync(path.join(locDir, f), "utf8"));
      record(`locales/${f} parses`, true);
    } catch (e) {
      record(`locales/${f} parses`, false, e.message);
    }
  }
}

// ---- robots.txt ------------------------------------------------------------
try {
  const r = fs.readFileSync("public/robots.txt", "utf8");
  record(
    "robots.txt references https://www.e-pdfs.com/sitemap.xml",
    /Sitemap:\s*https:\/\/www\.e-pdfs\.com\/sitemap\.xml/i.test(r),
  );
} catch (e) {
  record("robots.txt readable", false, e.message);
}

// ---- IndexNow ownership: dynamic handler, no static key files -------------
record(
  "IndexNow handler api/indexnow-key.js exists",
  fs.existsSync("api/indexnow-key.js"),
);
const strayIn = fs
  .readdirSync("public")
  .filter((f) => /^[0-9a-f]{40,}\.txt$/i.test(f) || f === "indexnow-key.txt");
record(
  "no obsolete IndexNow key files under public/",
  strayIn.length === 0,
  strayIn.join(","),
);

// ---- No service-role key referenced in public render functions ------------
for (const f of ["api/render.js", "api/sitemap.js", "api/feed.js"]) {
  const src = fs.readFileSync(f, "utf8");
  record(
    `${f} does not reference SUPABASE_SERVICE_ROLE_KEY`,
    !/SUPABASE_SERVICE_ROLE_KEY/.test(src),
  );
}

// ---- Cookies + DMCA coverage ----------------------------------------------
const renderSrc = fs.readFileSync("api/render.js", "utf8");
record("api/render.js handles /cookies", /"\/cookies"/.test(renderSrc));
record("api/render.js handles /dmca", /"\/dmca"/.test(renderSrc));
const sitemapSrc = fs.readFileSync("api/sitemap.js", "utf8");
record("api/sitemap.js lists /cookies", /"\/cookies"/.test(sitemapSrc));
record("api/sitemap.js lists /dmca", /"\/dmca"/.test(sitemapSrc));
const footerSrc = fs.readFileSync("src/components/Footer.tsx", "utf8");
record("Footer links to /cookies", /['"]\/cookies['"]/.test(footerSrc));
record("Footer links to /dmca", /['"]\/dmca['"]/.test(footerSrc));

// ---- ads.txt: no committed placeholder publisher id -----------------------
const adsSrc = fs.readFileSync("api/ads.js", "utf8");
record(
  "api/ads.js gates on real ADSENSE_PUBLISHER_ID (pub-XXXXXXXXXXXXXXXX)",
  /pub-\\d\{16\}/.test(adsSrc) || /pub-\\\\d\{16\}/.test(adsSrc) || /\/\^pub-\\d\{16\}\$\//.test(adsSrc) || /pub-\d{16}/.test(adsSrc),
);
record(
  "no committed placeholder pub-id string in ads.js",
  !/pub-0{16}|pub-1{16}|pub-1234567890123456/.test(adsSrc),
);

// ---- Optional production HEAD/GET checks -----------------------------------
if (process.env.SMOKE_PROD === "1") {
  const BASE = "https://www.e-pdfs.com";
  const check = async (label, url, expect) => {
    try {
      const r = await fetch(url, { redirect: "manual" });
      const ok = expect(r);
      record(`prod ${label} (${r.status})`, ok, r.headers.get("location") || "");
    } catch (e) {
      record(`prod ${label}`, false, e.message);
    }
  };
  await check("apex→www redirect", "https://e-pdfs.com/", (r) => [301, 308].includes(r.status));
  await check("/ 200", `${BASE}/`, (r) => r.status === 200);
  await check("/blog 200", `${BASE}/blog`, (r) => r.status === 200);
  await check("/cookies 200", `${BASE}/cookies`, (r) => r.status === 200);
  await check("/dmca 200", `${BASE}/dmca`, (r) => r.status === 200);
  await check("/sitemap.xml", `${BASE}/sitemap.xml`, (r) => r.status === 200 && (r.headers.get("content-type") || "").includes("xml"));
  await check("/feed.xml", `${BASE}/feed.xml`, (r) => r.status === 200 && (r.headers.get("content-type") || "").includes("xml"));
  await check("/robots.txt", `${BASE}/robots.txt`, (r) => r.status === 200);
  await check("unknown → 404", `${BASE}/__definitely_missing_${Date.now()}`, (r) => r.status === 404);
}

// ---- Summary ---------------------------------------------------------------
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
if (failed.length) {
  console.error("Failed:");
  for (const f of failed) console.error(`  - ${f.name}: ${f.detail}`);
  process.exit(1);
}
