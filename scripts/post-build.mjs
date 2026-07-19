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
fs.renameSync(src, dest);
console.log("[post-build] renamed dist/index.html -> dist/__shell.html");
