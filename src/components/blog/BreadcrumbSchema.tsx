import { useEffect } from 'react';

interface Crumb {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  items: Crumb[];
}

/**
 * Injects a BreadcrumbList JSON-LD schema so Google can render breadcrumb
 * rich results for the page. Fully dynamic — pass the real trail per page.
 */
const BreadcrumbSchema = ({ items }: BreadcrumbSchemaProps) => {
  useEffect(() => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    };

    let script = document.querySelector('script[data-schema="breadcrumb"]');
    if (!script) {
      script = document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.setAttribute('data-schema', 'breadcrumb');
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schema);

    // No cleanup: the node is reused (server prerender must survive).
  }, [items]);

  return null;
};

export default BreadcrumbSchema;
