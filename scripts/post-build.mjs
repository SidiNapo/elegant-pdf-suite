#!/usr/bin/env node
// Rename dist/index.html -> dist/__shell.html so Vercel's static filesystem
// step does not serve the un-rendered SPA shell at `/`. Every request
// (including `/`) then falls through to the rewrites in vercel.json and is
// handled by api/render.js, which loads the shell from __shell.html and
// injects route-specific <head> + crawlable snapshot.
import fs from "node:fs";
import path from "node:path";

const dist = path.resolve("dist");
const src = path.join(dist, "index.html");
const dest = path.join(dist, "__shell.html");

if (!fs.existsSync(src)) {
  console.warn("[post-build] dist/index.html not found — skipping");
  process.exit(0);
}

// Always provide the shell copy for api/render.js.
fs.copyFileSync(src, dest);

// Only remove dist/index.html on Vercel, where the SSR renderer must handle
// "/". On any other host (Lovable preview/publish, Hostinger, local `vite
// preview`) index.html MUST stay in place or the site serves nothing.
if (process.env.VERCEL) {
  fs.rmSync(src);
  console.log("[post-build] Vercel: dist/index.html -> dist/__shell.html");
} else {
  console.log("[post-build] copied dist/index.html -> dist/__shell.html");
}

