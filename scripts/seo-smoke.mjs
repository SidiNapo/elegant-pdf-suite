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

// ---- IndexNow key files ----------------------------------------------------
const inFiles = fs.readdirSync("public").filter((f) => /^[0-9a-f]{64}\.txt$/i.test(f));
record("IndexNow raw key file present", inFiles.length > 0, inFiles.join(","));
record("IndexNow alias /indexnow-key.txt present", fs.existsSync("public/indexnow-key.txt"));

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
