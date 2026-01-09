import { useEffect } from 'react';

interface ArticleSchemaProps {
  title: string;
  description: string;
  image?: string;
  authorName: string;
  publishedAt: string;
  modifiedAt: string;
  url: string;
}

const ArticleSchema = ({
  title,
  description,
  image,
  authorName,
  publishedAt,
  modifiedAt,
  url,
}: ArticleSchemaProps) => {
  useEffect(() => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: title,
      description: description,
      image: image || 'https://e-pdfs.com/og-image.jpg',
      author: {
        '@type': 'Person',
        name: authorName,
      },
      publisher: {
        '@type': 'Organization',
        name: "E-Pdf's",
        logo: {
          '@type': 'ImageObject',
          url: 'https://e-pdfs.com/logo.png',
        },
      },
      datePublished: publishedAt,
      dateModified: modifiedAt,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': url,
      },
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
  }, [title, description, image, authorName, publishedAt, modifiedAt, url]);

  return null;
};

export default ArticleSchema;
