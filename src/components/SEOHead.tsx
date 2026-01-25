import { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  noIndex?: boolean;
}

const SEOHead = ({
  title,
  description,
  keywords,
  canonicalUrl,
  ogImage,
  ogType = 'website',
  author,
  publishedTime,
  modifiedTime,
  noIndex = false,
}: SEOHeadProps) => {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Helper to update or create meta tag
    const setMetaTag = (name: string, content: string, property = false) => {
      const attr = property ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attr}="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Helper to update or create link tag
    const setLinkTag = (rel: string, href: string, type?: string, sizes?: string) => {
      let selector = `link[rel="${rel}"]`;
      if (sizes) selector += `[sizes="${sizes}"]`;
      
      let link = document.querySelector(selector) as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = rel;
        if (type) link.type = type;
        if (sizes) link.setAttribute('sizes', sizes);
        document.head.appendChild(link);
      }
      link.href = href;
    };

    // Ensure favicon is always set to our custom icon (for Google indexing)
    const faviconUrl = 'https://e-pdfs.com/favicon.png';
    setLinkTag('icon', '/favicon.png', 'image/png', '32x32');
    setLinkTag('icon', '/favicon.png', 'image/png', '16x16');
    setLinkTag('apple-touch-icon', '/favicon.png', undefined, '180x180');
    setLinkTag('shortcut icon', '/favicon.png', 'image/png');

    // Basic meta tags
    setMetaTag('description', description);
    if (keywords) setMetaTag('keywords', keywords);
    if (noIndex) {
      setMetaTag('robots', 'noindex, nofollow');
    } else {
      setMetaTag('robots', 'index, follow');
    }

    // Open Graph tags
    setMetaTag('og:title', title, true);
    setMetaTag('og:description', description, true);
    setMetaTag('og:type', ogType, true);
    // Always set og:image - use provided image or fallback to favicon
    const effectiveOgImage = ogImage || 'https://e-pdfs.com/favicon.png';
    setMetaTag('og:image', effectiveOgImage, true);
    setMetaTag('og:image:width', '512', true);
    setMetaTag('og:image:height', '512', true);
    setMetaTag('og:image:alt', 'E-Pdf\'s Logo', true);
    if (canonicalUrl) {
      setMetaTag('og:url', canonicalUrl, true);
      // Update or create canonical link
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', canonicalUrl);
    }

    // Twitter Card tags
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', title);
    setMetaTag('twitter:description', description);
    setMetaTag('twitter:image', effectiveOgImage);

    // Article specific meta tags
    if (ogType === 'article') {
      if (author) setMetaTag('author', author);
      if (publishedTime) setMetaTag('article:published_time', publishedTime, true);
      if (modifiedTime) setMetaTag('article:modified_time', modifiedTime, true);
    }

    // Cleanup function to reset to default
    return () => {
      document.title = "E-Pdf's - Outils PDF Gratuits en Ligne";
    };
  }, [title, description, keywords, canonicalUrl, ogImage, ogType, author, publishedTime, modifiedTime, noIndex]);

  return null;
};

export default SEOHead;
