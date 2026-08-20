// Vercel serverless function: dynamic server-side rendering for crawlers/social scrapers.
// Returns fully-formed HTML with correct <head> and a crawlable snapshot inside
// #root for every indexable route. The React SPA hydrates and replaces the
// snapshot on the client — client behaviour is unchanged.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PROGRAMMATIC_PAGES } from "./_programmatic.js";
import { ROBOTS_INDEX, ROBOTS_NOINDEX } from "./_seo.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



// ---- Self-contained, dependency-free HTML sanitizer -------------------------
// Content originates from the trusted admin editor (already sanitized client-side
// with sanitize-html on save). This server pass is defense-in-depth: it strips
// dangerous tags/attributes and demotes H1 -> H2. No browser APIs, no external deps.
const SANITIZE_ALLOWED_TAGS = new Set([
  "h2", "h3", "h4", "p", "ul", "ol", "li", "a", "strong", "em",
  "blockquote", "img", "figure", "figcaption", "table", "thead",
  "tbody", "tr", "th", "td", "code", "pre", "br", "hr",
]);
const TAG_ALIASES = { h1: "h2", b: "strong", i: "em" };

function sanitizeBlogHtml(html) {
  if (!html) return "";
  let out = String(html);
  // Remove entire dangerous blocks (script/style/iframe/object/embed/svg/noscript).
  out = out.replace(/<(script|style|iframe|object|embed|svg|noscript)[\s\S]*?<\/\1>/gi, "");
  // Remove comments.
  out = out.replace(/<!--[\s\S]*?-->/g, "");

  // Process every tag: drop disallowed ones, strip unsafe attributes.
  out = out.replace(/<(\/?)([a-zA-Z0-9]+)((?:[^>"']|"[^"]*"|'[^']*')*)>/g, (match, closing, rawName, attrs) => {
    let name = rawName.toLowerCase();
    if (TAG_ALIASES[name]) name = TAG_ALIASES[name];
    if (!SANITIZE_ALLOWED_TAGS.has(name)) return "";
    if (closing) return `</${name}>`;

    const allowedAttrs = {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "width", "height", "loading", "decoding"],
      th: ["colspan", "rowspan"],
      td: ["colspan", "rowspan"],
    }[name] || [];
    const kept = [];
    const attrRe = /([a-zA-Z0-9:-]+)\s*=\s*("([^"]*)"|'([^']*)')/g;
    let m;
    while ((m = attrRe.exec(attrs)) !== null) {
      const attr = m[1].toLowerCase();
      const value = m[3] !== undefined ? m[3] : m[4] || "";
      if (attr.startsWith("on")) continue;
      if (!allowedAttrs.includes(attr)) continue;
      if ((attr === "href" || attr === "src") && /^\s*(javascript|data|vbscript):/i.test(value)) continue;
      kept.push(`${attr}="${value.replace(/"/g, "&quot;")}"`);
    }
    if (name === "a" && /target\s*=\s*["']_blank["']/i.test(attrs) && !kept.some((k) => k.startsWith("rel="))) {
      kept.push('rel="noopener noreferrer"');
    }
    if (name === "img") {
      if (!kept.some((k) => k.startsWith("loading="))) kept.push('loading="lazy"');
      if (!kept.some((k) => k.startsWith("decoding="))) kept.push('decoding="async"');
      if (!kept.some((k) => k.startsWith("alt="))) kept.push('alt=""');
    }
    return `<${name}${kept.length ? " " + kept.join(" ") : ""}>`;
  });

  return out;
}

// Single canonical host. Production redirects e-pdfs.com -> www.e-pdfs.com.
const SITE_URL = "https://www.e-pdfs.com";
const SITE_NAME = "E-Pdf's";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;
const ADMIN_PATH = process.env.ADMIN_PATH || process.env.VITE_ADMIN_PATH || "ctrl-x9k7m2p4q8n1";

// Canonical sanitizer — strips external hosts, query strings, and fragments.
// Only used for non-blog routes. Blog posts use strictBlogCanonical below,
// which refuses anything that isn't the exact expected URL for the slug.
function safeCanonical(input, fallbackPath) {
  let p = fallbackPath || "/";
  if (input) {
    try {
      const u = new URL(String(input), SITE_URL);
      p = u.pathname || "/";
    } catch {
      p = String(input).split("?")[0].split("#")[0] || p;
    }
  }
  if (!p.startsWith("/")) p = "/" + p;
  if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
  return SITE_URL + p;
}

// Slug format for blog articles. Anything that doesn't match this pattern is
// treated as a non-existent article (404), so the canonical URL derived from
// a slug is always safe to embed in HTML / JSON-LD.
const BLOG_SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
function isValidBlogSlug(slug) {
  return typeof slug === "string" && BLOG_SLUG_RE.test(slug);
}

// Strict canonical builder for blog posts. This function IGNORES any value
// passed as the first argument — the canonical URL is derived purely from
// the validated slug so that stale, external, malformed, or malicious values
// stored in `blog_posts.canonical_url` can NEVER leak into the rendered
// <link rel="canonical">. The first parameter is kept for signature
// backwards-compatibility with regression tests that assert the historical
// "input is silently discarded" behaviour.
function strictBlogCanonical(_ignoredInput, slug) {
  if (!isValidBlogSlug(slug)) {
    // Callers that reach this branch have already resolved a real post from
    // the DB, so an invalid slug here means upstream validation failed.
    // Refuse to construct a URL rather than emit a broken canonical.
    throw new Error("strictBlogCanonical: invalid slug");
  }
  return `${SITE_URL}/blog/${slug}`;
}

export { safeCanonical, strictBlogCanonical, isValidBlogSlug, SITE_URL };


// Public rendering uses ONLY the anon key. The service-role key MUST NEVER be
// referenced here — it's reserved for privileged jobs (api/cleanup, protected
// Edge Functions). RLS on blog_posts allows public reads of published rows.
const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || "";

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
function escapeJsonLd(str) {
  return String(str).replace(/</g, "\\u003c").replace(/>/g, "\\u003e");
}

// ---- Static route → meta map ----------------------------------------------
const DEFAULT_DESC =
  "Outils PDF gratuits en ligne. Fusionnez, divisez, compressez et convertissez vos fichiers PDF. 100% sécurisé, rapide et sans inscription.";

const STATIC_ROUTES = {
  "/": { title: "E-Pdf's - Outils PDF Gratuits en Ligne | Fusionner, Diviser, Compresser", description: DEFAULT_DESC, h1: "Outils PDF gratuits en ligne" },
  "/tools": { title: "Tous les Outils PDF Gratuits en Ligne | E-Pdf's", description: "Découvrez tous nos outils PDF : fusionner, diviser, compresser, convertir et plus. 100% gratuit, sécurisé et sans inscription.", h1: "Tous les outils PDF" },
  "/blog": { title: "Blog PDF — Guides & Astuces pour vos Documents | E-Pdf's", description: "Guides, astuces et tutoriels pour gérer, convertir et optimiser vos fichiers PDF gratuitement et en toute sécurité.", h1: "Blog E-Pdf's" },
  "/about": { title: "À propos d'E-Pdf's — Outils PDF 100% Sécurisés", description: "Découvrez E-Pdf's : des outils PDF gratuits qui traitent vos fichiers localement dans votre navigateur, sans téléversement.", h1: "À propos d'E-Pdf's" },
  "/contact": { title: "Contact | E-Pdf's", description: "Une question ou une suggestion ? Contactez l'équipe E-Pdf's, nous vous répondrons rapidement.", h1: "Nous contacter" },
  "/privacy": { title: "Politique de Confidentialité | E-Pdf's", description: "Notre politique de confidentialité : vos fichiers sont traités localement et ne sont jamais téléversés sur nos serveurs.", h1: "Politique de confidentialité" },
  "/terms": { title: "Conditions d'Utilisation | E-Pdf's", description: "Conditions générales d'utilisation des outils PDF gratuits E-Pdf's.", h1: "Conditions d'utilisation" },
  "/cookies": { title: "Politique de Cookies | E-Pdf's", description: "Comment E-Pdf's utilise les cookies : cookies essentiels par défaut, aucune publicité ni analytics sans votre consentement.", h1: "Politique de cookies" },
  "/dmca": { title: "Politique DMCA | E-Pdf's", description: "Procédure DMCA pour signaler un contenu prétendument illicite. E-Pdf's respecte les droits d'auteur.", h1: "Politique DMCA" },
  "/merge": { title: "Fusionner PDF en ligne gratuit et sécurisé | E-Pdf's", description: "Fusionnez plusieurs fichiers PDF en un seul document. Traitement 100% local, sans téléversement, gratuit et sans filigrane.", h1: "Fusionner PDF" },
  "/split": { title: "Diviser PDF en ligne gratuit et sécurisé | E-Pdf's", description: "Divisez un PDF en plusieurs fichiers ou extrayez des pages. Traitement 100% local, gratuit et sans inscription.", h1: "Diviser PDF" },
  "/delete-pages": { title: "Supprimer des pages PDF gratuit | E-Pdf's", description: "Supprimez des pages d'un PDF facilement. Traitement 100% local dans votre navigateur, gratuit et sécurisé.", h1: "Supprimer des pages PDF" },
  "/extract-pages": { title: "Extraire des pages PDF gratuit | E-Pdf's", description: "Extrayez des pages spécifiques d'un PDF. Traitement 100% local, gratuit et sans téléversement.", h1: "Extraire des pages PDF" },
  "/organize": { title: "Organiser un PDF gratuit | E-Pdf's", description: "Réorganisez, faites pivoter et gérez les pages de votre PDF. Traitement 100% local et sécurisé.", h1: "Organiser un PDF" },
  "/scan-to-pdf": { title: "Scanner vers PDF gratuit | E-Pdf's", description: "Transformez vos scans et images en PDF. Traitement 100% local dans votre navigateur, gratuit.", h1: "Scanner vers PDF" },
  "/compress": { title: "Compresser PDF en ligne gratuit et sécurisé | E-Pdf's", description: "Réduisez la taille de vos PDF sans perte de qualité. Traitement 100% local, gratuit et sans inscription.", h1: "Compresser PDF" },
  "/repair": { title: "Réparer un PDF endommagé gratuit | E-Pdf's", description: "Réparez vos fichiers PDF corrompus. Traitement 100% local dans votre navigateur, gratuit.", h1: "Réparer un PDF" },
  "/jpg-to-pdf": { title: "JPG en PDF gratuit et sécurisé | E-Pdf's", description: "Convertissez vos images JPG/PNG en PDF. Traitement 100% local, gratuit et sans filigrane.", h1: "JPG en PDF" },
  "/word-to-pdf": { title: "Word en PDF gratuit | E-Pdf's", description: "Convertissez vos documents Word en PDF. Traitement 100% local et sécurisé, gratuit.", h1: "Word en PDF" },
  "/ppt-to-pdf": { title: "PowerPoint en PDF gratuit | E-Pdf's", description: "Convertissez vos présentations PowerPoint en PDF. Traitement 100% local, gratuit.", h1: "PowerPoint en PDF" },
  "/excel-to-pdf": { title: "Excel en PDF gratuit | E-Pdf's", description: "Convertissez vos feuilles Excel en PDF. Traitement 100% local et sécurisé, gratuit.", h1: "Excel en PDF" },
  "/pdf-to-jpg": { title: "PDF en JPG gratuit et sécurisé | E-Pdf's", description: "Convertissez chaque page PDF en image JPG. Traitement 100% local, gratuit et sans inscription.", h1: "PDF en JPG" },
  "/pdf-to-word": { title: "PDF en Word gratuit | E-Pdf's", description: "Convertissez vos PDF en documents Word éditables. Traitement 100% local et sécurisé, gratuit.", h1: "PDF en Word" },
  "/pdf-to-ppt": { title: "PDF en PowerPoint gratuit | E-Pdf's", description: "Convertissez vos PDF en présentations PowerPoint. Traitement 100% local, gratuit.", h1: "PDF en PowerPoint" },
  "/pdf-to-excel": { title: "PDF en Excel gratuit | E-Pdf's", description: "Convertissez vos PDF en feuilles Excel. Traitement 100% local et sécurisé, gratuit.", h1: "PDF en Excel" },
  "/rotate": { title: "Faire pivoter un PDF gratuit | E-Pdf's", description: "Faites pivoter les pages de votre PDF. Traitement 100% local dans votre navigateur, gratuit.", h1: "Faire pivoter un PDF" },
  "/page-numbers": { title: "Ajouter des numéros de page PDF gratuit | E-Pdf's", description: "Ajoutez une numérotation à votre PDF. Traitement 100% local et sécurisé, gratuit.", h1: "Numéros de page PDF" },
  "/watermark": { title: "Ajouter un filigrane PDF gratuit | E-Pdf's", description: "Ajoutez un filigrane texte ou image à votre PDF. Traitement 100% local, gratuit.", h1: "Filigrane PDF" },
  "/crop": { title: "Rogner un PDF gratuit | E-Pdf's", description: "Rognez les marges de votre PDF. Traitement 100% local dans votre navigateur, gratuit.", h1: "Rogner un PDF" },
  "/edit": { title: "Éditer un PDF gratuit | E-Pdf's", description: "Éditez et annotez vos PDF. Traitement 100% local et sécurisé, gratuit.", h1: "Éditer un PDF" },
  "/compare": { title: "Comparer deux PDF gratuit | E-Pdf's", description: "Comparez deux fichiers PDF pour repérer les différences. Traitement 100% local, gratuit.", h1: "Comparer deux PDF" },
  "/convert": { title: "Convertir un PDF gratuit | E-Pdf's", description: "Convertissez vos fichiers vers et depuis le PDF. Traitement 100% local et sécurisé, gratuit.", h1: "Convertir un PDF" },
};

// ---- index.html template loading ------------------------------------------
function loadTemplate() {
  // Prefer the renamed shell (dist/__shell.html) — post-build.mjs moves
  // dist/index.html out of the way so Vercel's static filesystem step
  // cannot short-circuit the renderer for `/`.
  const candidates = [
    path.join(process.cwd(), "dist", "__shell.html"),
    path.join(__dirname, "..", "dist", "__shell.html"),
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
  if (/<title>[\s\S]*?<\/title>/i.test(html)) return html.replace(/<title>[\s\S]*?<\/title>/i, t);
  return html.replace(/<\/head>/i, `  ${t}\n</head>`);
}
function replaceMetaByName(html, name, content) {
  const re = new RegExp(`<meta[^>]*name=["']${name}["'][^>]*>`, "i");
  const tag = `<meta name="${name}" content="${escapeHtml(content)}" />`;
  if (re.test(html)) return html.replace(re, tag);
  return html.replace(/<\/head>/i, `  ${tag}\n</head>`);
}
function replaceMetaByProperty(html, property, content) {
  const re = new RegExp(`<meta[^>]*property=["']${property}["'][^>]*>`, "i");
  const tag = `<meta property="${property}" content="${escapeHtml(content)}" />`;
  if (re.test(html)) return html.replace(re, tag);
  return html.replace(/<\/head>/i, `  ${tag}\n</head>`);
}
function removeMetaByProperty(html, property) {
  return html.replace(new RegExp(`\\s*<meta[^>]*property=["']${property}["'][^>]*>`, "gi"), "");
}
function replaceCanonical(html, href) {
  const re = /<link[^>]*rel=["']canonical["'][^>]*>/i;
  const tag = `<link rel="canonical" href="${escapeHtml(href)}" />`;
  if (re.test(html)) return html.replace(re, tag);
  return html.replace(/<\/head>/i, `  ${tag}\n</head>`);
}
function injectHead(html, extraHead) {
  return html.replace(/<\/head>/i, `${extraHead}\n</head>`);
}
function injectIntoRoot(html, bodyHtml) {
  return html.replace(/(<div id="root"[^>]*>)/i, `$1${bodyHtml}`);
}
// Inject a <script type="application/json"> data island just before </body>.
function injectIntoBody(html, markup) {
  if (/<\/body>/i.test(html)) return html.replace(/<\/body>/i, `${markup}\n</body>`);
  return html + markup;
}
// Rewrite <html lang="..."> (and dir) to match the rendered document language.
function setHtmlLang(html, lang, dir) {
  return html.replace(/<html\b[^>]*>/i, `<html lang="${escapeHtml(lang)}"${dir ? ` dir="${escapeHtml(dir)}"` : ""}>`);
}
// Serialize an object into a JSON data island. escapeJsonLd() neutralises
// "<" / ">" so the payload can never break out of the <script> element.
function jsonIsland(id, data) {
  return `  <script id="${id}" type="application/json">${escapeJsonLd(JSON.stringify(data))}</script>`;
}

/**
 * Apply a full, route-specific SEO head. `opts` may include article-only fields.
 * Non-article routes get stale article meta stripped.
 */
function applyHead(html, opts) {
  const {
    title, description, canonical, robots = ROBOTS_INDEX,
    ogType = "website", image = DEFAULT_OG_IMAGE, imageAlt = SITE_NAME,
    imageWidth = 1200, imageHeight = 630, keywords,
    publishedTime, modifiedTime, author, isArticle = false, ogLocale,
  } = opts;

  html = replaceOrInsertTitle(html, title);
  html = replaceMetaByName(html, "description", description);
  html = replaceMetaByName(html, "robots", robots);
  if (keywords) html = replaceMetaByName(html, "keywords", keywords);
  html = replaceCanonical(html, canonical);

  // Open Graph
  html = replaceMetaByProperty(html, "og:type", ogType);
  html = replaceMetaByProperty(html, "og:site_name", SITE_NAME);
  html = replaceMetaByProperty(html, "og:title", title);
  html = replaceMetaByProperty(html, "og:description", description);
  html = replaceMetaByProperty(html, "og:url", canonical);
  html = replaceMetaByProperty(html, "og:image", image);
  html = replaceMetaByProperty(html, "og:image:secure_url", image);
  html = replaceMetaByProperty(html, "og:image:width", String(imageWidth));
  html = replaceMetaByProperty(html, "og:image:height", String(imageHeight));
  html = replaceMetaByProperty(html, "og:image:alt", imageAlt);

  // Twitter
  html = replaceMetaByName(html, "twitter:card", "summary_large_image");
  html = replaceMetaByName(html, "twitter:url", canonical);
  html = replaceMetaByName(html, "twitter:title", title);
  html = replaceMetaByName(html, "twitter:description", description);
  html = replaceMetaByName(html, "twitter:image", image);

  if (isArticle) {
    // Article pages declare a single, real locale — alternates would be false
    // since translated URLs don't exist.
    if (ogLocale) html = replaceMetaByProperty(html, "og:locale", ogLocale);
    html = removeMetaByProperty(html, "og:locale:alternate");
    const extra = [
      publishedTime ? `  <meta property="article:published_time" content="${escapeHtml(publishedTime)}" />` : "",
      modifiedTime ? `  <meta property="article:modified_time" content="${escapeHtml(modifiedTime)}" />` : "",
      author ? `  <meta name="author" content="${escapeHtml(author)}" />` : "",
    ].filter(Boolean).join("\n");
    if (extra) html = injectHead(html, extra);
  } else {
    html = removeMetaByProperty(html, "article:published_time");
    html = removeMetaByProperty(html, "article:modified_time");
    html = html.replace(/\s*<meta[^>]*name=["']author["'][^>]*>/gi, "");
  }
  return html;
}


// ---- Supabase fetch --------------------------------------------------------
const SB_HEADERS = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  Accept: "application/json",
};
async function sbFetch(query) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${query}`, { headers: SB_HEADERS });
  if (!res.ok) throw new Error(`supabase ${res.status}`);
  return res.json();
}
async function fetchPost(slug) {
  const rows = await sbFetch(
    `blog_posts?select=*,blog_categories(id,name,slug)&slug=eq.${encodeURIComponent(slug)}&is_published=eq.true&limit=1`
  );
  return Array.isArray(rows) && rows.length ? rows[0] : null;
}
async function fetchPublishedList() {
  return sbFetch(
    `blog_posts?select=id,slug,title,excerpt,featured_image,featured_image_alt,featured_image_width,featured_image_height,author_name,published_at,created_at,updated_at,views_count,category_id,blog_categories(id,name,slug)&is_published=eq.true&order=published_at.desc`
  );
}

// ---- Client hydration data islands -----------------------------------------
// The SPA seeds react-query from these payloads (see src/lib/ssrData.ts) so the
// article renders on the FIRST client paint with zero network calls — the
// prerendered snapshot is never lost after hydration.
function postIsland(post, safeContent) {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt ?? null,
    // ALWAYS the sanitized server output, never raw post.content.
    content: safeContent,
    featured_image: post.featured_image ?? null,
    featured_image_alt: post.featured_image_alt ?? null,
    featured_image_width: post.featured_image_width ?? null,
    featured_image_height: post.featured_image_height ?? null,
    author_name: post.author_name ?? SITE_NAME,
    language: post.language ?? "fr",
    meta_title: post.meta_title ?? null,
    meta_description: post.meta_description ?? null,
    meta_keywords: post.meta_keywords ?? null,
    og_image: post.og_image ?? null,
    published_at: post.published_at ?? null,
    created_at: post.created_at ?? null,
    updated_at: post.updated_at ?? null,
    views_count: post.views_count ?? 0,
    category_id: post.category_id ?? null,
    category: post.blog_categories
      ? {
          id: post.blog_categories.id ?? null,
          name: post.blog_categories.name ?? null,
          slug: post.blog_categories.slug ?? null,
        }
      : null,
  };
}
function listIsland(posts) {
  return (posts || []).map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt ?? null,
    featured_image: p.featured_image ?? null,
    author_name: p.author_name ?? SITE_NAME,
    published_at: p.published_at ?? null,
    created_at: p.created_at ?? null,
    views_count: p.views_count ?? 0,
    category_id: p.category_id ?? null,
    category: p.blog_categories
      ? {
          id: p.blog_categories.id ?? null,
          name: p.blog_categories.name ?? null,
          slug: p.blog_categories.slug ?? null,
        }
      : null,
  }));
}


// ---- Renderers -------------------------------------------------------------
function renderStatic(html, route) {
  const meta = STATIC_ROUTES[route];
  const canonical = safeCanonical(route, "/");
  html = applyHead(html, { title: meta.title, description: meta.description, canonical });
  if (route === "/") {
    // Homepage snapshot: single meaningful H1, short intro, and crawlable
    // primary-nav links (/tools, /blog) so crawlers see the site graph
    // before React hydrates.
    const snapshot =
      `<main>` +
      `<h1>${escapeHtml(meta.h1)}</h1>` +
      `<p>${escapeHtml(meta.description)}</p>` +
      `<nav aria-label="Navigation principale"><ul>` +
      `<li><a href="/tools">Tous les outils PDF</a></li>` +
      `<li><a href="/blog">Blog E-Pdf's</a></li>` +
      `<li><a href="/merge">Fusionner PDF</a></li>` +
      `<li><a href="/split">Diviser PDF</a></li>` +
      `<li><a href="/compress">Compresser PDF</a></li>` +
      `<li><a href="/about">À propos</a></li>` +
      `<li><a href="/contact">Contact</a></li>` +
      `</ul></nav>` +
      `</main>`;
    html = injectIntoRoot(html, snapshot);
    return html;
  }
  html = injectIntoRoot(html, `<h1>${escapeHtml(meta.h1)}</h1><p>${escapeHtml(meta.description)}</p>`);
  return html;
}

function renderProgrammatic(html, page) {
  const canonical = safeCanonical(`/p/${page.slug}`);
  html = applyHead(html, {
    title: page.metaTitle, description: page.metaDescription, canonical, keywords: page.keywords,
  });

  // HowTo JSON-LD from the steps for richer indexing.
  const steps = page.steps || [];
  if (steps.length) {
    const howTo = {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: page.h1,
      description: page.metaDescription,
      step: steps.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s })),
    };
    html = injectHead(html, `  <script type="application/ld+json">${escapeJsonLd(JSON.stringify(howTo))}</script>`);
  }

  const paragraphs = (page.paragraphs || []).map((p) => `<p>${escapeHtml(p)}</p>`).join("");
  const stepsHtml = steps.length
    ? `<h2>Comment faire</h2><ol>${steps.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ol>`
    : "";
  const cta = page.toolPath
    ? `<p><a href="${escapeHtml(page.toolPath)}">${escapeHtml(page.ctaLabel || "Ouvrir l'outil")}</a></p>`
    : "";
  const snapshot =
    `<article><h1>${escapeHtml(page.h1)}</h1>` +
    `<p>${escapeHtml(page.intro)}</p>` +
    paragraphs +
    stepsHtml +
    cta +
    `</article>`;
  html = injectIntoRoot(html, snapshot);
  return html;
}


function langName(code) {
  return code === "en" ? "en" : code === "ar" ? "ar" : "fr";
}

function renderBlogIndex(html, posts) {
  const meta = STATIC_ROUTES["/blog"];
  const canonical = safeCanonical("/blog");
  html = applyHead(html, { title: meta.title, description: meta.description, canonical });

  const cards = (posts || []).map((p) => {
    const date = (p.published_at || p.updated_at || "").slice(0, 10);
    const cat = p.blog_categories && p.blog_categories.name ? p.blog_categories.name : "";
    const img = p.featured_image
      ? `<img src="${escapeHtml(p.featured_image)}" alt="${escapeHtml(p.featured_image_alt || p.title)}" width="${p.featured_image_width || 1200}" height="${p.featured_image_height || 630}" loading="lazy" decoding="async" />`
      : "";
    return (
      `<article>` +
      `<a href="/blog/${escapeHtml(p.slug)}">` +
      img +
      `<h2>${escapeHtml(p.title)}</h2>` +
      `</a>` +
      (cat ? `<span>${escapeHtml(cat)}</span>` : "") +
      (p.excerpt ? `<p>${escapeHtml(p.excerpt)}</p>` : "") +
      (p.author_name ? `<span>${escapeHtml(p.author_name)}</span>` : "") +
      (date ? `<time datetime="${escapeHtml(date)}">${escapeHtml(date)}</time>` : "") +
      `</article>`
    );
  }).join("");

  const snapshot = `<section><h1>${escapeHtml(meta.h1)}</h1><p>${escapeHtml(meta.description)}</p>${cards}</section>`;
  html = injectIntoRoot(html, snapshot);
  html = injectIntoBody(html, jsonIsland("__BLOG_LIST__", listIsland(posts)));
  return html;
}

function renderPost(html, slug, post, related) {
  const title = post.meta_title || post.title;
  const description = post.meta_description || post.excerpt || DEFAULT_DESC;
  // Canonical URL is ALWAYS derived from the (already-validated) slug. The
  // stored `post.canonical_url` value is intentionally ignored so bad data
  // in the DB cannot leak into the rendered <link rel="canonical">.
  const canonical = strictBlogCanonical(null, slug);


  const image = post.og_image || post.featured_image || DEFAULT_OG_IMAGE;
  const imageAlt = post.featured_image_alt || post.title;
  const imageWidth = post.featured_image_width || 1200;
  const imageHeight = post.featured_image_height || 630;
  const published = post.published_at || post.created_at || "";
  const modified = post.updated_at || published;
  const inLanguage = langName(post.language);
  const category = post.blog_categories && post.blog_categories.name ? post.blog_categories.name : "";

  const ogLocale = inLanguage === "en" ? "en_US" : inLanguage === "ar" ? "ar_AR" : "fr_FR";

  // The shell ships lang="fr" — rewrite it to the article's real language
  // (and switch direction for Arabic).
  html = setHtmlLang(html, inLanguage, inLanguage === "ar" ? "rtl" : undefined);

  html = applyHead(html, {
    title, description, canonical, keywords: post.meta_keywords, ogType: "article",
    image, imageAlt, imageWidth, imageHeight,
    publishedTime: published, modifiedTime: modified, author: post.author_name || SITE_NAME,
    isArticle: true, ogLocale,
  });

  // BlogPosting JSON-LD (headline = post.title, not meta_title)
  const blogPosting = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description,
    image: { "@type": "ImageObject", url: image, width: imageWidth, height: imageHeight },
    author: { "@type": "Person", name: post.author_name || SITE_NAME },
    publisher: {
      "@type": "Organization", name: SITE_NAME,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/favicon.png`, width: 512, height: 512 },
    },
    datePublished: published,
    dateModified: modified,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    inLanguage,
    ...(category ? { articleSection: category } : {}),
    ...(post.meta_keywords ? { keywords: post.meta_keywords } : {}),
  };
  // BreadcrumbList JSON-LD
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: canonical },
    ],
  };
  // data-schema attributes let the client REUSE these exact <script> nodes
  // instead of appending a second copy of the same JSON-LD after hydration.
  html = injectHead(html,
    `  <script type="application/ld+json" data-schema="article">${escapeJsonLd(JSON.stringify(blogPosting))}</script>\n` +
    `  <script type="application/ld+json" data-schema="breadcrumb">${escapeJsonLd(JSON.stringify(breadcrumb))}</script>`
  );

  // Crawlable article snapshot
  const imgTag = post.featured_image
    ? `<img src="${escapeHtml(post.featured_image)}" alt="${escapeHtml(imageAlt)}" width="${imageWidth}" height="${imageHeight}" loading="eager" decoding="async" />`
    : "";
  const excerptHtml = post.excerpt ? `<p>${escapeHtml(post.excerpt)}</p>` : "";
  // Sanitize stored content server-side (never inject raw DB HTML).
  const safeContent = sanitizeBlogHtml(post.content || "");
  const relatedHtml = (related || []).length
    ? `<aside><h2>Articles similaires</h2><ul>` +
      related.map((r) => `<li><a href="/blog/${escapeHtml(r.slug)}">${escapeHtml(r.title)}</a></li>`).join("") +
      `</ul></aside>`
    : "";
  const nav = `<nav aria-label="Fil d'Ariane"><a href="/">Accueil</a> / <a href="/blog">Blog</a> / <span>${escapeHtml(post.title)}</span></nav>`;
  const snapshot =
    nav +
    `<article lang="${escapeHtml(inLanguage)}">` +
    `<h1>${escapeHtml(post.title)}</h1>` +
    imgTag +
    excerptHtml +
    `<div>${safeContent}</div>` +
    (category ? `<p>${escapeHtml(category)}</p>` : "") +
    `</article>` +
    relatedHtml;
  html = injectIntoRoot(html, snapshot);
  html = injectIntoBody(html, jsonIsland("__BLOG_POST__", postIsland(post, safeContent)));
  if ((related || []).length) {
    html = injectIntoBody(html, jsonIsland("__BLOG_RELATED__", listIsland(related)));
  }
  return html;
}

function renderNotFound(html, route) {
  html = applyHead(html, {
    title: "Page introuvable (404) | E-Pdf's",
    description: "La page que vous recherchez est introuvable.",
    canonical: safeCanonical(route),
    robots: ROBOTS_NOINDEX,
  });
  html = injectIntoRoot(html, `<h1>Page introuvable</h1>`);
  return html;
}

function renderAdmin(html, route) {
  html = applyHead(html, {
    title: "Administration | E-Pdf's",
    description: "Espace d'administration.",
    canonical: safeCanonical(route),
    robots: "noindex, nofollow, noarchive",
  });
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

  let route = (req.url || "/").split("?")[0];
  if (route.length > 1 && route.endsWith("/")) route = route.slice(0, -1);

  res.setHeader("Content-Type", "text/html; charset=utf-8");

  // Admin: never indexable.
  if (route === `/${ADMIN_PATH}` || route.startsWith(`/${ADMIN_PATH}/`)) {
    res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
    res.setHeader("Cache-Control", "no-store");
    res.statusCode = 200;
    res.end(renderAdmin(template, route));
    return;
  }

  res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=86400");

  try {
    // Blog post
    const blogMatch = route.match(/^\/blog\/([^/]+)$/);
    if (blogMatch) {
      const slug = decodeURIComponent(blogMatch[1]);
      // Slug shape gate — anything outside [a-z0-9-] cannot map to a real
      // article and must never reach the DB or the canonical builder.
      if (!isValidBlogSlug(slug)) {
        res.statusCode = 404;
        res.setHeader("X-Robots-Tag", "noindex, nofollow");
        res.end(renderNotFound(template, route));
        return;
      }
      const post = await fetchPost(slug);
      if (post) {
        let related = [];
        try {
          const all = await fetchPublishedList();
          related = (all || [])
            .filter((p) => p.slug !== slug)
            .sort((a, b) => (a.category_id === post.category_id ? -1 : 1))
            .slice(0, 6);
        } catch (_e) { /* related is best-effort */ }
        res.statusCode = 200;
        res.end(renderPost(template, slug, post, related));
        return;
      }
      // Genuine not-found (fetchPost only returns null when query succeeded)
      res.statusCode = 404;
      res.setHeader("X-Robots-Tag", "noindex, nofollow");
      res.end(renderNotFound(template, route));
      return;
    }

    // Blog index
    if (route === "/blog") {
      const posts = await fetchPublishedList();
      res.statusCode = 200;
      res.end(renderBlogIndex(template, posts));
      return;
    }

    // Programmatic landing pages
    const pMatch = route.match(/^\/p\/([^/]+)$/);
    if (pMatch) {
      const page = PROGRAMMATIC_PAGES.find((x) => x.slug === decodeURIComponent(pMatch[1]));
      if (page) {
        res.statusCode = 200;
        res.end(renderProgrammatic(template, page));
        return;
      }
      res.statusCode = 404;
      res.setHeader("X-Robots-Tag", "noindex, nofollow");
      res.end(renderNotFound(template, route));
      return;
    }

    // Static / tool routes
    if (STATIC_ROUTES[route]) {
      res.statusCode = 200;
      res.end(renderStatic(template, route));
      return;
    }

    // Unknown public route -> 404 + noindex
    res.statusCode = 404;
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
    res.end(renderNotFound(template, route));
  } catch (err) {
    // Safe server-side logging only. Never expose error/stack/secrets in response.
    console.error({ route, error: err?.message, stack: err?.stack });
    // Supabase/transient failure: do NOT mislabel as 404. Serve the shell so
    // the SPA can recover, with a temporary status and no-cache.
    res.statusCode = 503;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Retry-After", "30");
    res.end(template);
  }
}

// Exported for the SEO smoke test (data-island regression).
export { renderPost, renderBlogIndex };
