import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  FileText, Shield, AlertCircle, CheckCircle, 
  Scale, Clock, Mail, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';

const Terms = () => {
  const { t } = useTranslation();

  const sections = [
    {
      id: 'acceptance',
      icon: CheckCircle,
      title: t('terms.sections.acceptance.title'),
      content: t('terms.sections.acceptance.content'),
    },
    {
      id: 'services',
      icon: FileText,
      title: t('terms.sections.services.title'),
      content: t('terms.sections.services.content'),
    },
    {
      id: 'usage',
      icon: Scale,
      title: t('terms.sections.usage.title'),
      content: t('terms.sections.usage.content'),
    },
    {
      id: 'privacy',
      icon: Shield,
      title: t('terms.sections.privacy.title'),
      content: t('terms.sections.privacy.content'),
    },
    {
      id: 'intellectual',
      icon: FileText,
      title: t('terms.sections.intellectual.title'),
      content: t('terms.sections.intellectual.content'),
    },
    {
      id: 'liability',
      icon: AlertCircle,
      title: t('terms.sections.liability.title'),
      content: t('terms.sections.liability.content'),
    },
    {
      id: 'modifications',
      icon: Clock,
      title: t('terms.sections.modifications.title'),
      content: t('terms.sections.modifications.content'),
    },
    {
      id: 'contact',
      icon: Mail,
      title: t('terms.sections.contact.title'),
      content: t('terms.sections.contact.content'),
    },
  ];

  return (
    <>
      <SEOHead
        title={t('terms.seo.title')}
        description={t('terms.seo.description')}
        canonicalUrl="https://e-pdfs.com/terms"
      />

      <div className="min-h-screen bg-background">
        <Header />

        <main className="pt-20">
          {/* Hero Section */}
          <section className="relative py-20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{ duration: 8, repeat: Infinity }}
              className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
            />

            <div className="container mx-auto px-4 relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-accent mb-6"
                >
                  <FileText className="w-10 h-10 text-white" />
                </motion.div>

                <h1 className="text-4xl md:text-6xl font-black mb-6">
                  {t('terms.hero.title')}
                </h1>
                <p className="text-xl text-muted-foreground mb-4">
                  {t('terms.hero.subtitle')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t('terms.hero.lastUpdated')}: {t('terms.hero.date')}
                </p>
              </motion.div>
            </div>
          </section>

          {/* Content Section */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                {/* Introduction */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="glass-card rounded-2xl p-8 mb-8"
                >
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {t('terms.introduction')}
                  </p>
                </motion.div>

                {/* Sections */}
                <div className="space-y-6">
                  {sections.map((section, index) => (
                    <motion.div
                      key={section.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.05 }}
                      className="glass-card rounded-2xl p-8 hover:border-primary/30 transition-all duration-300"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                          <section.icon className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h2 className="text-xl font-bold mb-4">{section.title}</h2>
                          <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                            {section.content}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Google AdSense Disclosure */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="glass-card rounded-2xl p-8 mt-8 border-l-4 border-primary"
                >
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-primary" />
                    {t('terms.advertising.title')}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {t('terms.advertising.content')}
                  </p>
                </motion.div>

                {/* CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="mt-16 text-center"
                >
                  <p className="text-muted-foreground mb-6">
                    {t('terms.cta.text')}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/privacy" className="btn-secondary inline-flex items-center gap-2 px-6 py-3">
                      <Shield className="w-4 h-4" />
                      {t('terms.cta.privacy')}
                    </Link>
                    <Link to="/tools" className="btn-primary inline-flex items-center gap-2 px-6 py-3">
                      {t('terms.cta.tools')}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Terms;
