import { useEffect } from 'react';

interface ArticleSchemaProps {
  title: string;
  description: string;
  image?: string;
  imageWidth?: number;
  imageHeight?: number;
  authorName: string;
  publishedAt: string;
  modifiedAt: string;
  url: string;
  inLanguage?: string;
  section?: string;
  keywords?: string;
}

const ArticleSchema = ({
  title,
  description,
  image,
  imageWidth = 1200,
  imageHeight = 630,
  authorName,
  publishedAt,
  modifiedAt,
  url,
  inLanguage = 'fr',
  section,
  keywords,
}: ArticleSchemaProps) => {
  useEffect(() => {
    const imageUrl = image || 'https://www.e-pdfs.com/og-image.jpg';
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: title,
      description: description,
      inLanguage,
      image: {
        '@type': 'ImageObject',
        url: imageUrl,
        width: imageWidth,
        height: imageHeight,
      },
      author: {
        '@type': 'Person',
        name: authorName,
      },
      publisher: {
        '@type': 'Organization',
        name: "E-Pdf's",
        logo: {
          '@type': 'ImageObject',
          url: 'https://www.e-pdfs.com/favicon.png',
          width: 512,
          height: 512,
        },
      },
      datePublished: publishedAt,
      dateModified: modifiedAt,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': url,
      },
      ...(section ? { articleSection: section } : {}),
      ...(keywords ? { keywords } : {}),
    };

    // Create or update the script tag
    let script = document.querySelector('script[data-schema="article"]');
    if (!script) {
      script = document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.setAttribute('data-schema', 'article');
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schema);

    // Cleanup
    return () => {
      const existingScript = document.querySelector('script[data-schema="article"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [title, description, image, imageWidth, imageHeight, authorName, publishedAt, modifiedAt, url, inLanguage, section, keywords]);

  return null;
};

export default ArticleSchema;
