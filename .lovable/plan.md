

# SEO Visibility Plan: Make E-PDF's Visible in Morocco and Globally

## Current State Analysis

Your website already has a solid foundation:
- Sitemap with 27+ URLs covering all tools
- Basic structured data (Organization, Website schemas)
- Multi-language support (French, English, Arabic)
- robots.txt properly configured

**However, there are critical gaps preventing visibility:**

1. **Not submitted to Google** - Google doesn't know your site exists
2. **Missing hreflang tags** - Language versions not properly linked
3. **No blog content** - Only 1 test post exists (need 10-15 quality articles)
4. **Missing local signals** - No Morocco-specific targeting
5. **No backlinks strategy** - No external sites linking to you

---

## Phase 1: Submit to Search Engines (Day 1)

### 1.1 Google Search Console Setup

You need to manually register your site with Google. I cannot do this for you, but here are the steps:

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Click "Add Property" → Enter `https://e-pdfs.com`
3. Verify ownership using one of these methods:
   - **HTML file upload** (recommended): Download file, upload to your `public/` folder
   - **DNS record**: Add TXT record to your domain
4. After verification, submit your sitemap:
   - Go to "Sitemaps" → Enter `sitemap.xml` → Submit

### 1.2 Bing Webmaster Tools

1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. Import from Google Search Console (easiest method)
3. This also covers Yahoo! searches

### 1.3 Yandex Webmaster (for international reach)

1. Go to [Yandex Webmaster](https://webmaster.yandex.com)
2. Add and verify your site
3. Submit sitemap

---

## Phase 2: Fix International SEO with Hreflang (Code Changes)

### 2.1 Add Proper Hreflang Tags

Update `index.html` to add hreflang links for all language versions:

```html
<!-- Add to <head> -->
<link rel="alternate" hreflang="fr" href="https://e-pdfs.com/" />
<link rel="alternate" hreflang="en" href="https://e-pdfs.com/?lang=en" />
<link rel="alternate" hreflang="ar" href="https://e-pdfs.com/?lang=ar" />
<link rel="alternate" hreflang="x-default" href="https://e-pdfs.com/" />
```

### 2.2 Dynamic Hreflang in SEOHead Component

Update `src/components/SEOHead.tsx` to inject hreflang tags dynamically for every page:

```tsx
// Add language alternates for current page
const languages = ['fr', 'en', 'ar'];
languages.forEach(lang => {
  const url = `${canonicalUrl}${canonicalUrl?.includes('?') ? '&' : '?'}lang=${lang}`;
  setLinkTag('alternate', url, undefined, undefined, lang);
});
```

---

## Phase 3: Morocco-Specific SEO Optimization

### 3.1 Add Morocco Geo-Targeting

Update `index.html` with geo meta tags:

```html
<meta name="geo.region" content="MA" />
<meta name="geo.placename" content="Morocco" />
<meta name="geo.position" content="31.7917;-7.0926" />
<meta name="ICBM" content="31.7917, -7.0926" />
```

### 3.2 Add Arabic Darija Keywords

Update `src/i18n/locales/ar.json` with Moroccan Arabic terms that users actually search:

- "تحويل pdf" (convert pdf)
- "ضغط ملفات pdf" (compress pdf files)
- "دمج pdf مجانا" (merge pdf free)
- "تقسيم pdf اون لاين" (split pdf online)

### 3.3 Update Structured Data for Morocco

Add `areaServed` to Organization schema in `src/components/StructuredData.tsx`:

```tsx
areaServed: [
  { '@type': 'Country', name: 'Morocco' },
  { '@type': 'Country', name: 'France' },
  { '@type': 'Country', name: 'Algeria' },
  { '@type': 'Country', name: 'Tunisia' }
]
```

---

## Phase 4: Create Blog Content (Critical for Rankings)

Your blog has only 1 test post. For AdSense and SEO, you need **10-15 quality articles** (800-1200 words each).

### Recommended Article Topics:

| Priority | Title (FR/AR/EN) | Target Keywords |
|----------|------------------|-----------------|
| 1 | Comment fusionner des PDF gratuitement | fusionner pdf gratuit, merge pdf |
| 2 | كيفية ضغط ملفات PDF | compress pdf arabic, ضغط pdf |
| 3 | PDF to Word: Complete Guide | pdf to word free online |
| 4 | Convertir des images en PDF | jpg to pdf, image en pdf |
| 5 | Split PDF: Extract Specific Pages | split pdf online free |
| 6 | Protéger vos PDF avec un mot de passe | pdf password protect |
| 7 | تحويل Word إلى PDF مجاناً | word to pdf arabic |
| 8 | Reduce PDF Size for Email | compress pdf for email |
| 9 | How to Add Page Numbers to PDF | pdf page numbers |
| 10 | Meilleurs outils PDF 2025 | best pdf tools 2025 |

---

## Phase 5: Enhanced Sitemap with Images

Update `public/sitemap.xml` to include image information for better indexing:

```xml
<url>
  <loc>https://e-pdfs.com/merge</loc>
  <changefreq>weekly</changefreq>
  <priority>0.9</priority>
  <image:image>
    <image:loc>https://e-pdfs.com/assets/merge-pdf-illustration.jpg</image:loc>
    <image:title>Merge PDF Online Free</image:title>
  </image:image>
</url>
```

---

## Phase 6: Social Signals Setup

### 6.1 Create Social Media Profiles

Create profiles on these platforms and link back to e-pdfs.com:

- **Facebook Page**: "E-PDF's - Outils PDF Gratuits"
- **Twitter/X**: @epdfs
- **LinkedIn Company Page**
- **Pinterest** (great for tutorials)

### 6.2 Update Structured Data with Social Links

Add sameAs property to Organization schema:

```tsx
sameAs: [
  'https://facebook.com/epdfs',
  'https://twitter.com/epdfs',
  'https://linkedin.com/company/epdfs'
]
```

---

## Technical Implementation Summary

| File | Changes |
|------|---------|
| `index.html` | Add hreflang tags, geo meta tags for Morocco |
| `src/components/SEOHead.tsx` | Dynamic hreflang injection, fix language handling |
| `src/components/StructuredData.tsx` | Add areaServed (Morocco focus), social links |
| `public/sitemap.xml` | Add image tags, update with blog URLs |
| `public/robots.txt` | Already configured correctly |

---

## Action Items You Must Do Manually

These cannot be done through code:

| Task | Where | Priority |
|------|-------|----------|
| Submit site to Google Search Console | search.google.com/search-console | Highest |
| Submit site to Bing Webmaster Tools | bing.com/webmasters | High |
| Create 10+ blog articles | Admin panel | High |
| Create social media profiles | Facebook, Twitter, LinkedIn | Medium |
| Get backlinks from Moroccan directories | Local business directories | Medium |
| Request indexing for each tool page | Google Search Console | High |

---

## Expected Timeline to Visibility

| Timeline | Milestone |
|----------|-----------|
| Week 1 | Submit to search engines, fix hreflang |
| Week 2-3 | Publish 5 blog articles |
| Week 4-6 | Publish 5 more articles, build social profiles |
| Month 2-3 | Start appearing in search results |
| Month 3-6 | Rank for long-tail keywords |
| Month 6+ | Compete for main keywords |

**Note:** SEO takes time. Google needs 2-6 months to properly index and rank a new site. Consistency in publishing quality content is key.

