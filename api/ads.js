// Serves /ads.txt only when ADSENSE_PUBLISHER_ID is a valid `pub-XXXXXXXXXXXXXXXX` value.
// Otherwise returns a real 404 so we never publish an invalid AdSense declaration.
export default function handler(req, res) {
  if (req.method && req.method !== "GET" && req.method !== "HEAD") {
    res.statusCode = 405;
    res.setHeader("Allow", "GET, HEAD");
    res.end("Method Not Allowed");
    return;
  }
  const pub = String(process.env.ADSENSE_PUBLISHER_ID || "").trim();
  if (!/^pub-\d{16}$/.test(pub)) {
    res.statusCode = 404;
    res.setHeader("Cache-Control", "public, max-age=300");
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("Not Found");
    return;
  }
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  res.end(`google.com, ${pub}, DIRECT, f08c47fec0942fa0\n`);
}
