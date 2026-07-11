// Vercel serverless function: dynamic server-side rendering for crawlers/social scrapers.
// Intercepts indexable HTML routes and returns fully-formed HTML with the correct
// <head> and a server-rendered <article> inside #root. The React SPA then hydrates
// and replaces the snapshot on the client — client behaviour is unchanged.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_URL = "https://e-pdfs.com";
const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "https://obetkqazuirhntzpjzou.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iZXRrcWF6dWlyaG50enBqem91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3MjE2NjcsImV4cCI6MjA4MzI5NzY2N30.IhL7av9GynEuMDTkVYV8g-yOUHYutySu3KcD_H8Vrzk";

// ---- HTML escaping helpers -------------------------------------------------
function escapeHtml(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
// For values placed inside a JSON-LD <script> block.
function escapeJsonLd(str) {
  return String(str).replace(/</g, "\\u003c").replace(/>/g, "\\u003e");
}

// ---- Static route → meta map ----------------------------------------------
const DEFAULT_DESC =
  "Outils PDF gratuits en ligne. Fusionnez, divisez, compressez et convertissez vos fichiers PDF. 100% sécurisé, rapide et sans inscription.";

const STATIC_ROUTES = {
  "/": {
    title:
      "E-Pdf's - Outils PDF Gratuits en Ligne | Fusionner, Diviser, Compresser",
    description: DEFAULT_DESC,
  },
  "/tools": {
    title: "Tous les Outils PDF Gratuits en Ligne | E-Pdf's",
    description:
      "Découvrez tous nos outils PDF : fusionner, diviser, compresser, convertir et plus. 100% gratuit, sécurisé et sans inscription.",
  },
  "/blog": {
    title: "Blog PDF — Guides & Astuces pour vos Documents | E-Pdf's",
    description:
      "Guides, astuces et tutoriels pour gérer, convertir et optimiser vos fichiers PDF gratuitement et en toute sécurité.",
  },
  "/about": {
    title: "À propos d'E-Pdf's — Outils PDF 100% Sécurisés",
    description:
      "Découvrez E-Pdf's : des outils PDF gratuits qui traitent vos fichiers localement dans votre navigateur, sans téléversement.",
  },
  "/contact": {
    title: "Contact | E-Pdf's",
    description:
      "Une question ou une suggestion ? Contactez l'équipe E-Pdf's, nous vous répondrons rapidement.",
  },
  "/privacy": {
    title: "Politique de Confidentialité | E-Pdf's",
    description:
      "Notre politique de confidentialité : vos fichiers sont traités localement et ne sont jamais téléversés sur nos serveurs.",
  },
  "/terms": {
    title: "Conditions d'Utilisation | E-Pdf's",
    description: "Conditions générales d'utilisation des outils PDF gratuits E-Pdf's.",
  },
  "/merge": { title: "Fusionner PDF en ligne gratuit et sécurisé | E-Pdf's", description: "Fusionnez plusieurs fichiers PDF en un seul document. Traitement 100% local, sans téléversement, gratuit et sans filigrane." },
  "/split": { title: "Diviser PDF en ligne gratuit et sécurisé | E-Pdf's", description: "Divisez un PDF en plusieurs fichiers ou extrayez des pages. Traitement 100% local, gratuit et sans inscription." },
  "/delete-pages": { title: "Supprimer des pages PDF gratuit | E-Pdf's", description: "Supprimez des pages d'un PDF facilement. Traitement 100% local dans votre navigateur, gratuit et sécurisé." },
  "/extract-pages": { title: "Extraire des pages PDF gratuit | E-Pdf's", description: "Extrayez des pages spécifiques d'un PDF. Traitement 100% local, gratuit et sans téléversement." },
  "/organize": { title: "Organiser un PDF gratuit | E-Pdf's", description: "Réorganisez, faites pivoter et gérez les pages de votre PDF. Traitement 100% local et sécurisé." },
  "/scan-to-pdf": { title: "Scanner vers PDF gratuit | E-Pdf's", description: "Transformez vos scans et images en PDF. Traitement 100% local dans votre navigateur, gratuit." },
  "/compress": { title: "Compresser PDF en ligne gratuit et sécurisé | E-Pdf's", description: "Réduisez la taille de vos PDF sans perte de qualité. Traitement 100% local, gratuit et sans inscription." },
  "/repair": { title: "Réparer un PDF endommagé gratuit | E-Pdf's", description: "Réparez vos fichiers PDF corrompus. Traitement 100% local dans votre navigateur, gratuit." },
  "/jpg-to-pdf": { title: "JPG en PDF gratuit et sécurisé | E-Pdf's", description: "Convertissez vos images JPG/PNG en PDF. Traitement 100% local, gratuit et sans filigrane." },
  "/word-to-pdf": { title: "Word en PDF gratuit | E-Pdf's", description: "Convertissez vos documents Word en PDF. Traitement 100% local et sécurisé, gratuit." },
  "/ppt-to-pdf": { title: "PowerPoint en PDF gratuit | E-Pdf's", description: "Convertissez vos présentations PowerPoint en PDF. Traitement 100% local, gratuit." },
  "/excel-to-pdf": { title: "Excel en PDF gratuit | E-Pdf's", description: "Convertissez vos feuilles Excel en PDF. Traitement 100% local et sécurisé, gratuit." },
  "/pdf-to-jpg": { title: "PDF en JPG gratuit et sécurisé | E-Pdf's", description: "Convertissez chaque page PDF en image JPG. Traitement 100% local, gratuit et sans inscription." },
  "/pdf-to-word": { title: "PDF en Word gratuit | E-Pdf's", description: "Convertissez vos PDF en documents Word éditables. Traitement 100% local et sécurisé, gratuit." },
  "/pdf-to-ppt": { title: "PDF en PowerPoint gratuit | E-Pdf's", description: "Convertissez vos PDF en présentations PowerPoint. Traitement 100% local, gratuit." },
  "/pdf-to-excel": { title: "PDF en Excel gratuit | E-Pdf's", description: "Convertissez vos PDF en feuilles Excel. Traitement 100% local et sécurisé, gratuit." },
  "/rotate": { title: "Faire pivoter un PDF gratuit | E-Pdf's", description: "Faites pivoter les pages de votre PDF. Traitement 100% local dans votre navigateur, gratuit." },
  "/page-numbers": { title: "Ajouter des numéros de page PDF gratuit | E-Pdf's", description: "Ajoutez une numérotation à votre PDF. Traitement 100% local et sécurisé, gratuit." },
  "/watermark": { title: "Ajouter un filigrane PDF gratuit | E-Pdf's", description: "Ajoutez un filigrane texte ou image à votre PDF. Traitement 100% local, gratuit." },
  "/crop": { title: "Rogner un PDF gratuit | E-Pdf's", description: "Rognez les marges de votre PDF. Traitement 100% local dans votre navigateur, gratuit." },
  "/edit": { title: "Éditer un PDF gratuit | E-Pdf's", description: "Éditez et annotez vos PDF. Traitement 100% local et sécurisé, gratuit." },
  "/compare": { title: "Comparer deux PDF gratuit | E-Pdf's", description: "Comparez deux fichiers PDF pour repérer les différences. Traitement 100% local, gratuit." },
  "/convert": { title: "Convertir un PDF gratuit | E-Pdf's", description: "Convertissez vos fichiers vers et depuis le PDF. Traitement 100% local et sécurisé, gratuit." },
};

// ---- index.html template loading ------------------------------------------
function loadTemplate() {
  const candidates = [
    path.join(process.cwd(), "dist", "index.html"),
    path.join(process.cwd(), "index.html"),
    path.join(__dirname, "..", "dist", "index.html"),
    path.join(__dirname, "..", "index.html"),
  ];
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) return fs.readFileSync(p, "utf8");
    } catch (_e) {
      /* ignore */
    }
  }
  return null;
}

// ---- <head> manipulation ---------------------------------------------------
function replaceOrInsertTitle(html, title) {
  const t = `<title>${escapeHtml(title)}</title>`;
  if (/<title>[\s\S]*?<\/title>/i.test(html)) {
    return html.replace(/<title>[\s\S]*?<\/title>/i, t);
  }
  return html.replace(/<\/head>/i, `  ${t}\n</head>`);
}

function replaceMetaByName(html, name, content) {
  const re = new RegExp(
    `<meta[^>]*name=["']${name}["'][^>]*>`,
    "i"
  );
  const tag = `<meta name="${name}" content="${escapeHtml(content)}" />`;
  if (re.test(html)) return html.replace(re, tag);
  return html.replace(/<\/head>/i, `  ${tag}\n</head>`);
}

function replaceMetaByProperty(html, property, content) {
  const re = new RegExp(
    `<meta[^>]*property=["']${property}["'][^>]*>`,
    "i"
  );
  const tag = `<meta property="${property}" content="${escapeHtml(content)}" />`;
  if (re.test(html)) return html.replace(re, tag);
  return html.replace(/<\/head>/i, `  ${tag}\n</head>`);
}

function replaceCanonical(html, href) {
  const re = /<link[^>]*rel=["']canonical["'][^>]*>/i;
  const tag = `<link rel="canonical" href="${escapeHtml(href)}" />`;
  if (re.test(html)) return html.replace(re, tag);
  return html.replace(/<\/head>/i, `  ${tag}\n</head>`);
}

function replaceOgUrl(html, url) {
  return replaceMetaByProperty(html, "og:url", url);
}

function injectHead(html, extraHead) {
  return html.replace(/<\/head>/i, `${extraHead}\n</head>`);
}

function injectIntoRoot(html, bodyHtml) {
  // Insert the crawlable snapshot inside #root; React replaces it on mount.
  return html.replace(
    /(<div id="root"[^>]*>)/i,
    `$1${bodyHtml}`
  );
}

// ---- Supabase fetch --------------------------------------------------------
async function fetchPost(slug) {
  const url =
    `${SUPABASE_URL}/rest/v1/blog_posts?select=*,blog_categories(name,slug)` +
    `&slug=eq.${encodeURIComponent(slug)}&is_published=eq.true&limit=1`;
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      Accept: "application/json",
    },
  });
  if (!res.ok) return null;
  const rows = await res.json();
  return Array.isArray(rows) && rows.length ? rows[0] : null;
}

// ---- Renderers -------------------------------------------------------------
function renderStatic(html, route) {
  const meta = STATIC_ROUTES[route] || STATIC_ROUTES["/"];
  const canonical = route === "/" ? `${SITE_URL}/` : `${SITE_URL}${route}`;
  html = replaceOrInsertTitle(html, meta.title);
  html = replaceMetaByName(html, "description", meta.description);
  html = replaceCanonical(html, canonical);
  html = replaceMetaByProperty(html, "og:title", meta.title);
  html = replaceMetaByProperty(html, "og:description", meta.description);
  html = replaceOgUrl(html, canonical);
  return html;
}

function renderPost(html, slug, post) {
  const title = post.meta_title || post.title;
  const description = post.meta_description || post.excerpt || DEFAULT_DESC;
  let canonical = post.canonical_url || `${SITE_URL}/blog/${slug}`;
  if (canonical && !/^https?:\/\//i.test(canonical)) {
    canonical = `https://${canonical.replace(/^\/+/, "")}`;
  }
  const image =
    post.og_image || post.featured_image || `${SITE_URL}/og-image.jpg`;
  const published = post.published_at || post.created_at || "";
  const modified = post.updated_at || published;

  html = replaceOrInsertTitle(html, title);
  html = replaceMetaByName(html, "description", description);
  if (post.meta_keywords) {
    html = replaceMetaByName(html, "keywords", post.meta_keywords);
  }
  html = replaceMetaByName(html, "robots", "index, follow");
  html = replaceCanonical(html, canonical);

  // Open Graph
  html = replaceMetaByProperty(html, "og:type", "article");
  html = replaceMetaByProperty(html, "og:title", title);
  html = replaceMetaByProperty(html, "og:description", description);
  html = replaceOgUrl(html, canonical);
  html = replaceMetaByProperty(html, "og:image", image);

  // Extra article + twitter tags
  const extraHead = `
  <meta property="article:published_time" content="${escapeHtml(published)}" />
  <meta property="article:modified_time" content="${escapeHtml(modified)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${escapeHtml(image)}" />`;
  html = injectHead(html, extraHead);

  // BlogPosting JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description: description,
    image: { "@type": "ImageObject", url: image, width: 1200, height: 630 },
    author: { "@type": "Person", name: post.author_name || "E-Pdf's" },
    publisher: {
      "@type": "Organization",
      name: "E-Pdf's",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/favicon.png`,
        width: 512,
        height: 512,
      },
    },
    datePublished: published,
    dateModified: modified,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    inLanguage: "fr",
}
  html = injectHead(
    html,
    `  <script type="application/ld+json">${escapeJsonLd(
      JSON.stringify(jsonLd)
    )}</script>`
  );

  // Crawlable article snapshot inside #root
  const imgTag = post.featured_image
    ? `<img src="${escapeHtml(post.featured_image)}" alt="${escapeHtml(
        post.title
      )}" width="1200" height="630" />`
    : "";
  const excerptHtml = post.excerpt
    ? `<p>${escapeHtml(post.excerpt)}</p>`
    : "";
  // content may already contain HTML; render as-is for crawlers.
  const contentHtml = post.content || "";
  const snapshot =
    `<article>` +
    `<h1>${escapeHtml(post.title)}</h1>` +
    imgTag +
    excerptHtml +
    `<div>${contentHtml}</div>` +
    `</article>`;
  html = injectIntoRoot(html, snapshot);

  return html;
}

function renderNotFound(html, route) {
  html = replaceOrInsertTitle(html, "Page introuvable (404) | E-Pdf's");
  html = replaceMetaByName(
    html,
    "description",
    "La page que vous recherchez est introuvable."
  );
  html = replaceMetaByName(html, "robots", "noindex, nofollow");
  html = replaceCanonical(html, `${SITE_URL}${route}`);
  return html;
}

// ---- Handler ---------------------------------------------------------------
export default async function handler(req, res) {
  const template = loadTemplate();
  if (!template) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("Render template not found");
    return;
  }

  // Determine route (strip query string).
  let route = (req.url || "/").split("?")[0];
  if (route.length > 1 && route.endsWith("/")) route = route.slice(0, -1);

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=600, stale-while-revalidate=86400"
  );

  try {
    const blogMatch = route.match(/^\/blog\/([^/]+)$/);
    if (blogMatch) {
      const slug = decodeURIComponent(blogMatch[1]);
      const post = await fetchPost(slug);
      if (post) {
        res.statusCode = 200;
        res.end(renderPost(template, slug, post));
        return;
      }
      res.statusCode = 404;
      res.end(renderNotFound(template, route));
      return;
    }

    if (STATIC_ROUTES[route]) {
      res.statusCode = 200;
      res.end(renderStatic(template, route));
      return;
    }

    // Unknown route: serve shell unmodified, let the SPA handle it.
    res.statusCode = 200;
    res.end(template);
  } catch (err) {
    // On any failure, fall back to the untouched shell so the SPA still works.
    res.statusCode = 200;
    res.end(template);
  }
};
