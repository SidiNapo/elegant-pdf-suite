import { useParams, Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Shield, CheckCircle2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { FAQSchema } from '@/components/StructuredData';
import { getProgrammaticPage } from '@/data/programmaticPages';
import type { Lang } from '@/data/toolSeo';

const ProgrammaticLanding = () => {
  const { slug } = useParams();
  const { i18n } = useTranslation();
  const page = getProgrammaticPage(slug);

  if (!page) return <Navigate to="/tools" replace />;

  const lang = (i18n.language?.split('-')[0] as Lang) || 'fr';
  const c = page[lang === 'en' ? 'en' : 'fr'];
  const canonicalUrl = `https://e-pdfs.com/p/${page.slug}`;

  return (
    <>
      <SEOHead
        title={c.metaTitle}
        description={c.metaDescription}
        keywords={c.keywords}
        canonicalUrl={canonicalUrl}
      />
      <FAQSchema
        questions={[
          {
            question: c.h1,
            answer: c.intro,
          },
        ]}
      />
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <section className="pt-28 pb-16">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl md:text-5xl font-bold mb-6">{c.h1}</h1>
                <p className="text-xl text-muted-foreground mb-8">{c.intro}</p>

                <Link
                  to={page.toolPath}
                  className="btn-primary inline-flex items-center gap-2 mb-12"
                >
                  {c.ctaLabel}
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <div className="space-y-4 text-muted-foreground leading-relaxed mb-12">
                  {c.paragraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>

                <div className="glass-card rounded-2xl p-6 mb-12">
                  <h2 className="text-2xl font-bold mb-4">
                    {lang === 'en' ? 'How it works' : 'Comment ça marche'}
                  </h2>
                  <ol className="space-y-3">
                    {c.steps.map((s, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="w-7 h-7 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center flex-shrink-0">
                          {i + 1}
                        </span>
                        <span className="text-muted-foreground pt-0.5">{s}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    {lang === 'en' ? '100% local — no upload' : '100 % local — sans téléversement'}
                  </span>
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    {lang === 'en' ? 'Free, no sign-up' : 'Gratuit, sans inscription'}
                  </span>
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default ProgrammaticLanding;
