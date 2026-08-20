# Self-hosting E-Pdf's on a VPS

The Vercel deployment keeps working unchanged. This setup runs the same
`api/` handlers behind Express (`server.mjs`), supervised by PM2, proxied by
Nginx. Nothing in `api/`, `src/` or `vercel.json` is host-specific.

## 1. Server prerequisites (Ubuntu 22.04/24.04)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs nginx git
sudo npm i -g pm2
sudo mkdir -p /var/www/epdfs /var/log/epdfs
sudo chown -R $USER:$USER /var/www/epdfs /var/log/epdfs
```

## 2. Clone and build

```bash
git clone <your-repo-url> /var/www/epdfs
cd /var/www/epdfs
npm ci
VITE_ADMIN_PATH=ctrl-x9k7m2p4q8n1 npm run build
```

Do **not** set `VERCEL=1` when building on this host. `scripts/post-build.mjs`
removes `dist/index.html` only on Vercel; here it must stay in place (it is
copied to `dist/__shell.html`, which `api/render.js` reads as the shell).

After a build both files must exist:

```bash
ls -la dist/__shell.html dist/index.html
```

## 3. Configure and start PM2

Edit `ecosystem.config.cjs` and replace the `REPLACE_ME` values with your
`SUPABASE_URL` and `SUPABASE_ANON_KEY` (publishable/anon key only — never the
service-role key). Then:

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup      # run the command it prints, to survive reboots
pm2 logs epdfs
```

The server refuses to boot (`exit 1`) if `SUPABASE_URL` or
`SUPABASE_ANON_KEY` is missing.

Optional extra env vars: `INDEXNOW_KEY` (enables `/indexnow-key.txt`),
`ADSENSE_PUBLISHER_ID` (enables `/ads.txt`). Both endpoints return 404 while
unset, which is intentional.

## 4. Nginx + TLS

```bash
sudo cp deploy/nginx-e-pdfs.conf /etc/nginx/sites-available/e-pdfs.conf
sudo ln -s /etc/nginx/sites-available/e-pdfs.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

Once DNS for `e-pdfs.com` and `www.e-pdfs.com` points at the box:

```bash
sudo certbot --nginx -d e-pdfs.com -d www.e-pdfs.com
```

## 5. Smoke test

```bash
curl -sI  https://www.e-pdfs.com/ | head -1
curl -s   https://www.e-pdfs.com/ | grep -c '<h1'
curl -sI  https://e-pdfs.com/blog        # expect 301 -> www
curl -s   https://www.e-pdfs.com/sitemap.xml | head -3
curl -sI  https://www.e-pdfs.com/__shell.html | head -1   # expect 404
curl -sI  https://www.e-pdfs.com/assets/does-not-exist.js | head -1  # expect 404, not HTML
```

## 6. Redeploy loop

```bash
cd /var/www/epdfs
git pull
npm ci
VITE_ADMIN_PATH=ctrl-x9k7m2p4q8n1 npm run build
pm2 reload epdfs
```

**Publishing a blog post needs no redeploy.** `api/render.js`, `api/sitemap.js`
and `api/feed.js` query the database on every request, so new or edited posts
appear immediately (subject only to HTTP cache headers). Redeploy only for code
or asset changes.
