import { motion } from 'framer-motion';
import { ArrowRight, Merge, Split, Minimize2, Image, RotateCw, Droplets, Zap, Shield, Globe, CheckCircle2, Users, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ToolCard from '@/components/ToolCard';
import StructuredData from '@/components/StructuredData';
import SEOHead from '@/components/SEOHead';

// Import images
import heroPdf from '@/assets/hero-pdf.jpg';
import mergePdfIllustration from '@/assets/merge-pdf-illustration.jpg';
import splitPdfIllustration from '@/assets/split-pdf-illustration.jpg';
import compressPdfIllustration from '@/assets/compress-pdf-illustration.jpg';
import convertPdfIllustration from '@/assets/convert-pdf-illustration.jpg';
import securityIllustration from '@/assets/security-illustration.jpg';
import speedIllustration from '@/assets/speed-illustration.jpg';
import globalIllustration from '@/assets/global-illustration.jpg';
const Index = () => {
  const {
    t
  } = useTranslation();
  const popularTools = [{
    title: t('tools.merge.title'),
    description: t('tools.merge.description'),
    icon: Merge,
    href: '/merge',
    color: 'coral' as const
  }, {
    title: t('tools.split.title'),
    description: t('tools.split.description'),
    icon: Split,
    href: '/split',
    color: 'rose' as const
  }, {
    title: t('tools.compress.title'),
    description: t('tools.compress.description'),
    icon: Minimize2,
    href: '/compress',
    color: 'violet' as const
  }, {
    title: t('tools.jpgToPdf.title'),
    description: t('tools.jpgToPdf.description'),
    icon: Image,
    href: '/jpg-to-pdf',
    color: 'cyan' as const
  }, {
    title: t('tools.pdfToJpg.title'),
    description: t('tools.pdfToJpg.description'),
    icon: Image,
    href: '/pdf-to-jpg',
    color: 'coral' as const
  }, {
    title: t('tools.rotate.title'),
    description: t('tools.rotate.description'),
    icon: RotateCw,
    href: '/rotate',
    color: 'rose' as const
  }, {
    title: t('tools.watermark.title'),
    description: t('tools.watermark.description'),
    icon: Droplets,
    href: '/watermark',
    color: 'violet' as const
  }];
  const features = [{
    icon: Zap,
    title: t('features.fast'),
    description: t('features.fastDesc'),
    image: speedIllustration
  }, {
    icon: Shield,
    title: t('features.secure'),
    description: t('features.secureDesc'),
    image: securityIllustration
  }, {
    icon: Globe,
    title: t('features.free'),
    description: t('features.freeDesc'),
    image: globalIllustration
  }];
  const showcaseTools = [{
    title: t('showcase.merge.title'),
    description: t('showcase.merge.description'),
    image: mergePdfIllustration,
    href: '/merge',
    features: [t('showcase.merge.feature1'), t('showcase.merge.feature2'), t('showcase.merge.feature3')]
  }, {
    title: t('showcase.split.title'),
    description: t('showcase.split.description'),
    image: splitPdfIllustration,
    href: '/split',
    features: [t('showcase.split.feature1'), t('showcase.split.feature2'), t('showcase.split.feature3')]
  }, {
    title: t('showcase.compress.title'),
    description: t('showcase.compress.description'),
    image: compressPdfIllustration,
    href: '/compress',
    features: [t('showcase.compress.feature1'), t('showcase.compress.feature2'), t('showcase.compress.feature3')]
  }, {
    title: t('showcase.convert.title'),
    description: t('showcase.convert.description'),
    image: convertPdfIllustration,
    href: '/jpg-to-pdf',
    features: [t('showcase.convert.feature1'), t('showcase.convert.feature2'), t('showcase.convert.feature3')]
  }];
  const stats = [{
    value: '10M+',
    label: t('stats.filesProcessed')
  }, {
    value: '500K+',
    label: t('stats.satisfiedUsers')
  }, {
    value: '20+',
    label: t('stats.availableTools')
  }, {
    value: '100%',
    label: t('stats.free')
  }];
  const testimonials = [{
    name: t('testimonials.testimonial1.name'),
    role: t('testimonials.testimonial1.role'),
    text: t('testimonials.testimonial1.text')
  }, {
    name: t('testimonials.testimonial2.name'),
    role: t('testimonials.testimonial2.role'),
    text: t('testimonials.testimonial2.text')
  }, {
    name: t('testimonials.testimonial3.name'),
    role: t('testimonials.testimonial3.role'),
    text: t('testimonials.testimonial3.text')
  }];
  return <div className="min-h-screen flex flex-col">
      <SEOHead 
        title="E-PDF's - Free Online PDF Tools | Merge, Split, Compress PDF"
        description="Free online PDF tools to merge, split, compress, and convert PDF files. 100% browser-based processing, no registration required. Secure and fast."
        canonicalUrl="https://e-pdfs.com"
        ogImage="https://e-pdfs.com/og-image.jpg"
      />
      <StructuredData />
      <Header />
      
      {/* Hero Section with Background Image */}
      <section className="pt-32 md:pt-40 pb-20 relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img src={heroPdf} alt="E-PDF's - Outils PDF en ligne gratuits pour fusionner, diviser et compresser vos documents" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{
            opacity: 0,
            x: -50
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            duration: 0.8
          }} className="text-left">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary text-sm font-medium mb-6">
                
                <span>{t('hero.badge')}</span>
              </span>
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                {t('hero.title')} <span className="gradient-text">{t('hero.titleHighlight')}</span> {t('hero.titleEnd')}
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-xl">
                {t('hero.description')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/tools" className="btn-primary inline-flex items-center justify-center gap-2 text-lg px-8 py-4">
                  {t('hero.cta')} <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/merge" className="btn-secondary inline-flex items-center justify-center gap-2 text-lg px-8 py-4">
                  {t('hero.ctaSecondary')}
                </Link>
              </div>
              
              {/* Trust Badges */}
              <div className="flex items-center gap-6 mt-10 pt-10 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <span className="text-sm text-muted-foreground">{t('hero.secure')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  <span className="text-sm text-muted-foreground">{t('hero.fast')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="text-sm text-muted-foreground">{t('hero.users')}</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div initial={{
            opacity: 0,
            scale: 0.8
          }} animate={{
            opacity: 1,
            scale: 1
          }} transition={{
            duration: 0.8,
            delay: 0.2
          }} className="hidden lg:block">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-rose/20 rounded-3xl blur-3xl" />
                <img src={heroPdf} alt="Gestion de documents PDF - Fusionner, diviser, compresser et convertir vos fichiers PDF en ligne" className="relative rounded-2xl shadow-2xl border border-white/10" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-b from-background to-card/50 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => <motion.div key={stat.label} initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            delay: i * 0.1
          }} className="text-center">
                <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </motion.div>)}
          </div>
        </div>
      </section>

      {/* Features with Images */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div initial={{
          opacity: 0
        }} whileInView={{
          opacity: 1
        }} viewport={{
          once: true
        }} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              {t('features.title')} <span className="gradient-text">{t('features.titleHighlight')}</span> ?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('features.subtitle')}
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, i) => <motion.div key={feature.title} initial={{
            opacity: 0,
            y: 30
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            delay: i * 0.15
          }} className="group relative overflow-hidden rounded-3xl bg-card border border-border hover:border-primary/50 transition-all duration-500">
                <div className="aspect-square overflow-hidden">
                  <img src={feature.image} alt={`${feature.title} - ${feature.description}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/80 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="w-14 h-14 rounded-2xl bg-primary/20 backdrop-blur-sm flex items-center justify-center mb-4">
                    <feature.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-bold text-2xl mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </motion.div>)}
          </div>
        </div>
      </section>

      {/* Showcase Tools with Images - Alternating Layout */}
      <section className="py-24 bg-gradient-to-b from-card/30 to-background">
        <div className="container mx-auto px-4">
          <motion.div initial={{
          opacity: 0
        }} whileInView={{
          opacity: 1
        }} viewport={{
          once: true
        }} className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              {t('showcase.title')} <span className="gradient-text">{t('showcase.titleHighlight')}</span> {t('showcase.titleEnd')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('showcase.subtitle')}
            </p>
          </motion.div>
          
          <div className="space-y-32">
            {showcaseTools.map((tool, i) => <motion.div key={tool.title} initial={{
            opacity: 0,
            y: 50
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true,
            margin: "-100px"
          }} transition={{
            duration: 0.6
          }} className={`grid lg:grid-cols-2 gap-12 items-center ${i % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                <div className={`${i % 2 === 1 ? 'lg:order-2' : ''}`}>
                  <div className="relative group">
                    <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 to-rose/30 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <img src={tool.image} alt={`${tool.title} - ${tool.description} - Outil PDF en ligne gratuit`} className="relative rounded-2xl shadow-2xl border border-white/10 w-full" />
                  </div>
                </div>
                <div className={`${i % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <h3 className="text-3xl md:text-4xl font-bold mb-4">{tool.title}</h3>
                  <p className="text-lg text-muted-foreground mb-8">{tool.description}</p>
                  <ul className="space-y-4 mb-8">
                    {tool.features.map(feature => <li key={feature} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                        </div>
                        <span>{feature}</span>
                      </li>)}
                  </ul>
                  <Link to={tool.href} className="btn-primary inline-flex items-center gap-2">
                    {t('showcase.tryNow')} <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>)}
          </div>
        </div>
      </section>

      {/* Popular Tools */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div initial={{
          opacity: 0
        }} whileInView={{
          opacity: 1
        }} viewport={{
          once: true
        }} className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">{t('popularTools.title')} <span className="gradient-text">{t('popularTools.titleHighlight')}</span></h2>
            <p className="text-xl text-muted-foreground">{t('popularTools.subtitle')}</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {popularTools.map(tool => <ToolCard key={tool.title} {...tool} />)}
          </div>
          <div className="text-center mt-12">
            <Link to="/tools" className="btn-secondary inline-flex items-center gap-2 text-lg px-8 py-4">
              {t('popularTools.viewAll')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gradient-to-b from-card/30 to-background">
        <div className="container mx-auto px-4">
          <motion.div initial={{
          opacity: 0
        }} whileInView={{
          opacity: 1
        }} viewport={{
          once: true
        }} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              {t('testimonials.title')} <span className="gradient-text">{t('testimonials.titleHighlight')}</span>
            </h2>
            <p className="text-xl text-muted-foreground">{t('testimonials.subtitle')}</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => <motion.div key={testimonial.name} initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            delay: i * 0.1
          }} className="glass-card p-8 rounded-2xl">
                <p className="text-lg mb-6">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-rose flex items-center justify-center text-white font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>)}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroPdf} alt="Commencez à utiliser E-PDF's - Outils PDF gratuits en ligne" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-background to-rose/20" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{
          opacity: 0,
          y: 30
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} className="text-center max-w-3xl mx-auto">
            <FileText className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              {t('cta.title')} <span className="gradient-text">{t('cta.titleHighlight')}</span> ?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              {t('cta.description')}
            </p>
            <Link to="/tools" className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4">
              {t('cta.button')} <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* SEO Content */}
      <section className="py-16 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">{t('seo.title')}</h2>
            <div className="text-muted-foreground space-y-4">
              <p>{t('seo.paragraph1')}</p>
              <p>{t('seo.paragraph2')}</p>
              <p>{t('seo.paragraph3')}</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>;
};
export default Index;