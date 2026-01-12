import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Shield, Eye, Lock, Database, Cookie, 
  UserCheck, Globe, Mail, ArrowRight, FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';

const Privacy = () => {
  const { t } = useTranslation();

  const sections = [
    {
      id: 'collection',
      icon: Database,
      title: t('privacy.sections.collection.title'),
      content: t('privacy.sections.collection.content'),
    },
    {
      id: 'usage',
      icon: Eye,
      title: t('privacy.sections.usage.title'),
      content: t('privacy.sections.usage.content'),
    },
    {
      id: 'storage',
      icon: Lock,
      title: t('privacy.sections.storage.title'),
      content: t('privacy.sections.storage.content'),
    },
    {
      id: 'cookies',
      icon: Cookie,
      title: t('privacy.sections.cookies.title'),
      content: t('privacy.sections.cookies.content'),
    },
    {
      id: 'thirdParty',
      icon: Globe,
      title: t('privacy.sections.thirdParty.title'),
      content: t('privacy.sections.thirdParty.content'),
    },
    {
      id: 'rights',
      icon: UserCheck,
      title: t('privacy.sections.rights.title'),
      content: t('privacy.sections.rights.content'),
    },
    {
      id: 'children',
      icon: Shield,
      title: t('privacy.sections.children.title'),
      content: t('privacy.sections.children.content'),
    },
    {
      id: 'contact',
      icon: Mail,
      title: t('privacy.sections.contact.title'),
      content: t('privacy.sections.contact.content'),
    },
  ];

  const highlights = [
    {
      icon: Shield,
      title: t('privacy.highlights.noStorage.title'),
      description: t('privacy.highlights.noStorage.description'),
    },
    {
      icon: Lock,
      title: t('privacy.highlights.encryption.title'),
      description: t('privacy.highlights.encryption.description'),
    },
    {
      icon: Eye,
      title: t('privacy.highlights.noTracking.title'),
      description: t('privacy.highlights.noTracking.description'),
    },
  ];

  return (
    <>
      <SEOHead
        title={t('privacy.seo.title')}
        description={t('privacy.seo.description')}
        canonicalUrl="https://e-pdfs.com/privacy"
      />

      <div className="min-h-screen bg-background">
        <Header />

        <main className="pt-20">
          {/* Hero Section */}
          <section className="relative py-20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-background to-primary/5" />
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{ duration: 10, repeat: Infinity }}
              className="absolute top-20 left-20 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl"
            />
            <motion.div
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{ duration: 8, repeat: Infinity }}
              className="absolute bottom-10 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
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
                  className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 mb-6"
                >
                  <Shield className="w-10 h-10 text-white" />
                </motion.div>

                <h1 className="text-4xl md:text-6xl font-black mb-6">
                  {t('privacy.hero.title')}
                </h1>
                <p className="text-xl text-muted-foreground mb-4">
                  {t('privacy.hero.subtitle')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t('privacy.hero.lastUpdated')}: {t('privacy.hero.date')}
                </p>
              </motion.div>
            </div>
          </section>

          {/* Highlights */}
          <section className="py-12 -mt-8 relative z-20">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="grid md:grid-cols-3 gap-4">
                  {highlights.map((item, index) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="glass-card rounded-2xl p-6 text-center hover:border-emerald-500/30 transition-all duration-300"
                    >
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/20 mb-4">
                        <item.icon className="w-6 h-6 text-emerald-500" />
                      </div>
                      <h3 className="font-bold mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
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
                    {t('privacy.introduction')}
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
                      className="glass-card rounded-2xl p-8 hover:border-emerald-500/30 transition-all duration-300"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                          <section.icon className="w-6 h-6 text-emerald-500" />
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

                {/* Google AdSense Privacy Notice */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="glass-card rounded-2xl p-8 mt-8 border-l-4 border-emerald-500"
                >
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Cookie className="w-5 h-5 text-emerald-500" />
                    {t('privacy.advertising.title')}
                  </h2>
                  <div className="text-muted-foreground leading-relaxed space-y-4">
                    <p>{t('privacy.advertising.content')}</p>
                    <p>{t('privacy.advertising.optOut')}</p>
                  </div>
                </motion.div>

                {/* CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="mt-16 text-center"
                >
                  <p className="text-muted-foreground mb-6">
                    {t('privacy.cta.text')}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/terms" className="btn-secondary inline-flex items-center gap-2 px-6 py-3">
                      <FileText className="w-4 h-4" />
                      {t('privacy.cta.terms')}
                    </Link>
                    <Link to="/tools" className="btn-primary inline-flex items-center gap-2 px-6 py-3">
                      {t('privacy.cta.tools')}
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

export default Privacy;
