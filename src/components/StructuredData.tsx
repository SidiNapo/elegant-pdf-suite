import { useEffect } from 'react';

interface OrganizationSchemaProps {
  name: string;
  url: string;
  logo: string;
  description: string;
}

interface WebApplicationSchemaProps {
  name: string;
  description: string;
  url: string;
  applicationCategory: string;
  operatingSystem: string;
  offers?: {
    price: string;
    priceCurrency: string;
  };
}

interface FAQSchemaProps {
  questions: Array<{
    question: string;
    answer: string;
  }>;
}

interface BreadcrumbSchemaProps {
  items: Array<{
    name: string;
    url: string;
  }>;
}

// Organization Schema for the whole site
export const OrganizationSchema = ({ name, url, logo, description }: OrganizationSchemaProps) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'organization-schema';
    script.innerHTML = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name,
      url,
      logo: {
        '@type': 'ImageObject',
        url: logo,
        width: 512,
        height: 512
      },
      image: logo,
      description,
      sameAs: [],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        email: 'contact@e-pdfs.com',
        availableLanguage: ['English', 'French', 'Arabic']
      }
    });

    // Remove existing script if present
    const existing = document.getElementById('organization-schema');
    if (existing) existing.remove();
    
    document.head.appendChild(script);
    return () => {
      const el = document.getElementById('organization-schema');
      if (el) el.remove();
    };
  }, [name, url, logo, description]);

  return null;
};

// WebApplication Schema for tool pages
export const WebApplicationSchema = ({ name, description, url, applicationCategory, operatingSystem, offers }: WebApplicationSchemaProps) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = `webapp-schema-${name.replace(/\s+/g, '-').toLowerCase()}`;
    script.innerHTML = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name,
      description,
      url,
      applicationCategory,
      operatingSystem,
      offers: offers ? {
        '@type': 'Offer',
        price: offers.price,
        priceCurrency: offers.priceCurrency
      } : {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD'
      },
      featureList: [
        'No registration required',
        'Browser-based processing',
        'No file uploads to server',
        'Instant processing',
        'Multi-language support'
      ]
    });

    const existing = document.getElementById(script.id);
    if (existing) existing.remove();
    
    document.head.appendChild(script);
    return () => {
      const el = document.getElementById(script.id);
      if (el) el.remove();
    };
  }, [name, description, url, applicationCategory, operatingSystem, offers]);

  return null;
};

// FAQ Schema
export const FAQSchema = ({ questions }: FAQSchemaProps) => {
  useEffect(() => {
    if (questions.length === 0) return;

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'faq-schema';
    script.innerHTML = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: questions.map(q => ({
        '@type': 'Question',
        name: q.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: q.answer
        }
      }))
    });

    const existing = document.getElementById('faq-schema');
    if (existing) existing.remove();
    
    document.head.appendChild(script);
    return () => {
      const el = document.getElementById('faq-schema');
      if (el) el.remove();
    };
  }, [questions]);

  return null;
};

// Breadcrumb Schema
export const BreadcrumbSchema = ({ items }: BreadcrumbSchemaProps) => {
  useEffect(() => {
    if (items.length === 0) return;

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'breadcrumb-schema';
    script.innerHTML = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url
      }))
    });

    const existing = document.getElementById('breadcrumb-schema');
    if (existing) existing.remove();
    
    document.head.appendChild(script);
    return () => {
      const el = document.getElementById('breadcrumb-schema');
      if (el) el.remove();
    };
  }, [items]);

  return null;
};

// Website Schema (for sitelinks search box)
export const WebsiteSchema = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'website-schema';
    script.innerHTML = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'E-PDF\'s',
      alternateName: 'E-PDFs',
      url: 'https://e-pdfs.com',
      description: 'Free online PDF tools - Merge, split, compress, and convert PDF files instantly in your browser.',
      inLanguage: ['en', 'fr', 'ar'],
      publisher: {
        '@type': 'Organization',
        name: 'E-PDF\'s',
        url: 'https://e-pdfs.com'
      }
    });

    const existing = document.getElementById('website-schema');
    if (existing) existing.remove();
    
    document.head.appendChild(script);
    return () => {
      const el = document.getElementById('website-schema');
      if (el) el.remove();
    };
  }, []);

  return null;
};

// Default export combining main schemas for homepage
const StructuredData = () => {
  return (
    <>
      <OrganizationSchema
        name="E-PDF's"
        url="https://e-pdfs.com"
        logo="https://e-pdfs.com/favicon.png"
        description="Free online PDF tools - Merge, split, compress, and convert PDF files instantly in your browser. No registration required, 100% secure browser-based processing."
      />
      <WebsiteSchema />
    </>
  );
};

export default StructuredData;
