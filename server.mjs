#!/usr/bin/env node
// Self-hosted (VPS) entrypoint. Reproduces vercel.json routing on Express and
// mounts the EXISTING api/ handlers unchanged — they use the native (req, res)
// signature, so they are valid Express handlers as-is.
//
// Nginx terminates TLS and proxies to this process on loopback.
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

import render from "./api/render.js";
import sitemap from "./api/sitemap.js";
import feed from "./api/feed.js";
import ads from "./api/ads.js";
import indexnowKey from "./api/indexnow-key.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, "dist");

// Fail fast: the renderer/sitemap/feed all read Supabase per request. Booting
// without credentials would serve 503s for every dynamic route.
for (const name of ["SUPABASE_URL", "SUPABASE_ANON_KEY"]) {
  if (!String(process.env[name] || "").trim()) {
    console.error(
      `[server] Missing required environment variable ${name}. ` +
        `Set it in ecosystem.config.cjs (or the process env) and restart.`,
    );
    process.exit(1);
  }
}

// Any thrown error or rejected promise inside a handler is forwarded to the
// error middleware instead of hanging the request forever.
const wrap = (handler) => (req, res, next) => {
  try {
    Promise.resolve(handler(req, res)).catch(next);
  } catch (err) {
    next(err);
  }
};

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);

// a) Dynamic text/xml endpoints — mirrors the rewrites in vercel.json.
app.get("/sitemap.xml", wrap(sitemap));
app.get("/feed.xml", wrap(feed));
app.get("/ads.txt", wrap(ads));
app.get("/indexnow-key.txt", wrap(indexnowKey));

// b) Build artifacts must never be reachable: they are contentless, indexable
// duplicates of the whole site.
app.get(["/__shell.html", "/index.html"], (_req, res) => {
  res.status(404).type("text/plain").send("Not Found");
});

// c) Hashed assets. fallthrough:false is critical — otherwise a missing JS
// chunk falls through to the renderer and is answered with HTML, and the
// browser rejects the module ("Expected a JavaScript-or-Wasm module script but
// the server responded with a MIME type of text/html").
app.use(
  "/assets",
  express.static(path.join(DIST, "assets"), {
    index: false,
    immutable: true,
    maxAge: "1y",
    fallthrough: false,
  }),
);

// d) Remaining static files (favicon, robots.txt, og-image, manifest…).
// index:false is critical so "/" reaches the renderer instead of being
// short-circuited by dist/index.html.
app.use(
  express.static(DIST, {
    index: false,
    maxAge: "1h",
    dotfiles: "ignore",
  }),
);

// e) Everything else is server-rendered. The handler owns its own status codes
// (200/404/503) and headers — do not override them here.
app.use(wrap(render));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  console.error("[server] unhandled error on", req.method, req.originalUrl, err);
  if (res.headersSent) return;
  res.status(500).type("text/plain").send("Internal Server Error");
});

const PORT = Number(process.env.PORT) || 3000;
const server = app.listen(PORT, "127.0.0.1", () => {
  console.log(`[server] listening on http://127.0.0.1:${PORT}`);
});

const shutdown = (signal) => {
  console.log(`[server] ${signal} received — closing`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 10_000).unref();
};
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
