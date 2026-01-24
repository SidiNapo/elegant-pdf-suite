import { motion } from 'framer-motion';
import { LucideIcon, ArrowLeft, Shield, Zap, CheckCircle2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from './Header';
import Footer from './Footer';
import SEOHead from './SEOHead';

// Import background images
import heroPdf from '@/assets/hero-pdf.jpg';
import mergePdfIllustration from '@/assets/merge-pdf-illustration.jpg';
import splitPdfIllustration from '@/assets/split-pdf-illustration.jpg';
import compressPdfIllustration from '@/assets/compress-pdf-illustration.jpg';
import convertPdfIllustration from '@/assets/convert-pdf-illustration.jpg';
import securityIllustration from '@/assets/security-illustration.jpg';

interface ToolLayoutProps {
  title: string;
  description: string;
  icon: LucideIcon;
  children: React.ReactNode;
  color?: 'coral' | 'rose' | 'violet' | 'cyan';
  seoKeywords?: string;
}

const colorClasses = {
  coral: 'from-coral to-rose',
  rose: 'from-rose to-violet',
  violet: 'from-violet to-cyan',
  cyan: 'from-cyan to-coral',
};

const backgroundImages = {
  coral: heroPdf,
  rose: splitPdfIllustration,
  violet: compressPdfIllustration,
  cyan: convertPdfIllustration,
};

const ToolLayout = ({
  title,
  description,
  icon: Icon,
  children,
  color = 'coral',
  seoKeywords,
}: ToolLayoutProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const bgImage = backgroundImages[color];

  // Generate canonical URL from current path
  const canonicalUrl = `https://e-pdfs.com${location.pathname}`;
  
  // Generate SEO title and description
  const seoTitle = `${title} - E-PDF's | Free Online PDF Tool`;
  const seoDescription = `${description} Free, secure, and fast. No registration required. Process your PDF files directly in your browser.`;

  const benefits = [
    { icon: Zap, text: t('toolLayout.benefits.instant') },
    { icon: Shield, text: t('toolLayout.benefits.secure') },
    { icon: CheckCircle2, text: t('toolLayout.benefits.free') },
  ];
  
  return (
    <>
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords || `${title}, PDF tools, free PDF, online PDF, PDF converter`}
        canonicalUrl={canonicalUrl}
      />
      <div className="min-h-screen flex flex-col">
        <Header />
      
      <main className="flex-1">
        {/* Hero Section with Background Image */}
        <section className="pt-24 pb-12 relative overflow-hidden">
          <div className="absolute inset-0">
            <img 
              src={bgImage} 
              alt={`${title} - Outil PDF en ligne gratuit`}
              className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/90 to-background" />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            {/* Back Button */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-8"
            >
              <Link
                to="/tools"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t('toolLayout.backToTools')}</span>
              </Link>
            </motion.div>

            {/* Tool Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="relative inline-block mb-6">
                <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color]} blur-2xl opacity-50`} />
                <div
                  className={`relative w-24 h-24 rounded-3xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center shadow-2xl`}
                >
                  <Icon className="w-12 h-12 text-white" />
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-4">{title}</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">{description}</p>
              
              {/* Benefits Pills */}
              <div className="flex flex-wrap justify-center gap-3">
                {benefits.map((benefit) => (
                  <div key={benefit.text} className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/80 backdrop-blur-sm border border-border">
                    <benefit.icon className="w-4 h-4 text-primary" />
                    <span className="text-sm">{benefit.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Tool Content */}
        <section className="pb-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {children}
            </motion.div>
          </div>
        </section>

        {/* Related Info Section */}
        <section className="py-16 bg-gradient-to-b from-card/30 to-background border-t border-border">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  {t('toolLayout.howTo.title')} <span className="gradient-text">{title}</span>
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-primary font-bold">1</span>
                    </div>
                    <div>
                      <h3 className="text-foreground font-semibold mb-1">{t('toolLayout.howTo.step1Title')}</h3>
                      <p>{t('toolLayout.howTo.step1Desc')}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-primary font-bold">2</span>
                    </div>
                    <div>
                      <h3 className="text-foreground font-semibold mb-1">{t('toolLayout.howTo.step2Title')}</h3>
                      <p>{t('toolLayout.howTo.step2Desc')}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-primary font-bold">3</span>
                    </div>
                    <div>
                      <h3 className="text-foreground font-semibold mb-1">{t('toolLayout.howTo.step3Title')}</h3>
                      <p>{t('toolLayout.howTo.step3Desc')}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-rose/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <img 
                  src={securityIllustration} 
                  alt={`${title} - Sécurité et confidentialité garanties pour vos documents PDF`}
                  className="relative rounded-2xl border border-border shadow-xl w-full"
                />
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

export default ToolLayout;
