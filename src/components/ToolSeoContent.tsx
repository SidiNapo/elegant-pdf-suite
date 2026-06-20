import { useTranslation } from 'react-i18next';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { WebApplicationSchema, FAQSchema } from '@/components/StructuredData';
import { getToolSeo, type Lang, type ToolSeoLang } from '@/data/toolSeo';

interface ToolSeoContentProps {
  pathname: string;
  title: string;
  description: string;
  canonicalUrl: string;
}

const ToolSeoContent = ({ pathname, title, description, canonicalUrl }: ToolSeoContentProps) => {
  const { i18n } = useTranslation();
  const lang = (i18n.language?.split('-')[0] as Lang) || 'fr';
  const data = getToolSeo(pathname, title, description);
  const content: ToolSeoLang = data[lang === 'en' ? 'en' : 'fr'];

  return (
    <>
      {/* Structured data for rich snippets */}
      <WebApplicationSchema
        name={`${title} - E-PDF's`}
        description={content.metaDescription}
        url={canonicalUrl}
        applicationCategory="UtilitiesApplication"
        operatingSystem="Web Browser"
        offers={{ price: '0', priceCurrency: 'USD' }}
      />
      <FAQSchema questions={content.faqs.map((f) => ({ question: f.q, answer: f.a }))} />

      {/* On-page SEO copy */}
      <section className="py-16 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">{content.seoHeading}</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              {content.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            {/* FAQ */}
            <h2 className="text-2xl md:text-3xl font-bold mt-12 mb-4">FAQ</h2>
            <Accordion type="single" collapsible className="w-full">
              {content.faqs.map((f, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>
    </>
  );
};

export default ToolSeoContent;
