// Single source of truth for IndexNow ownership verification.
// Serves the value of the INDEXNOW_KEY env var as plain text at
// /indexnow-key.txt (rewritten in vercel.json). Returns 404 when the key is
// not configured so we never expose an invalid/placeholder key.
export default function handler(req, res) {
  if (req.method && req.method !== "GET" && req.method !== "HEAD") {
    res.statusCode = 405;
    res.setHeader("Allow", "GET, HEAD");
    res.end("Method Not Allowed");
    return;
  }
  const key = String(process.env.INDEXNOW_KEY || "").trim();
  if (!/^[0-9a-f]{8,128}$/i.test(key)) {
    res.statusCode = 404;
    res.setHeader("Cache-Control", "public, max-age=300");
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("Not Found");
    return;
  }
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  res.end(key + "\n");
}
