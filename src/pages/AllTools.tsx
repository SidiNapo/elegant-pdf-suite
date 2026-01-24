import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Merge,
  Split,
  Trash2,
  FileOutput,
  LayoutGrid,
  ScanLine,
  Minimize2,
  Wrench,
  Image,
  FileText,
  Presentation,
  Table,
  RotateCw,
  Hash,
  Droplets,
  Crop,
  Edit,
  GitCompare,
  ArrowRight,
  CheckCircle2,
  Zap,
  Shield,
  Globe,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ToolCard from '@/components/ToolCard';
import SEOHead from '@/components/SEOHead';

// Import images
import heroPdf from '@/assets/hero-pdf.jpg';
import mergePdfIllustration from '@/assets/merge-pdf-illustration.jpg';
import splitPdfIllustration from '@/assets/split-pdf-illustration.jpg';
import compressPdfIllustration from '@/assets/compress-pdf-illustration.jpg';
import convertPdfIllustration from '@/assets/convert-pdf-illustration.jpg';
import securityIllustration from '@/assets/security-illustration.jpg';

const AllTools = () => {
  const { t } = useTranslation();

  const toolCategories = [
    {
      name: t('categories.organize'),
      description: t('categories.organizeDesc'),
      image: mergePdfIllustration,
      tools: [
        {
          title: t('tools.merge.title'),
          description: t('tools.merge.description'),
          icon: Merge,
          href: '/merge',
          color: 'coral' as const,
        },
        {
          title: t('tools.split.title'),
          description: t('tools.split.description'),
          icon: Split,
          href: '/split',
          color: 'rose' as const,
        },
        {
          title: t('tools.deletePages.title'),
          description: t('tools.deletePages.description'),
          icon: Trash2,
          href: '/delete-pages',
          color: 'violet' as const,
        },
        {
          title: t('tools.extractPages.title'),
          description: t('tools.extractPages.description'),
          icon: FileOutput,
          href: '/extract-pages',
          color: 'cyan' as const,
        },
        {
          title: t('tools.organize.title'),
          description: t('tools.organize.description'),
          icon: LayoutGrid,
          href: '/organize',
          color: 'coral' as const,
        },
        {
          title: t('tools.scanToPdf.title'),
          description: t('tools.scanToPdf.description'),
          icon: ScanLine,
          href: '/scan-to-pdf',
          color: 'rose' as const,
        },
      ],
    },
    {
      name: t('categories.optimize'),
      description: t('categories.optimizeDesc'),
      image: compressPdfIllustration,
      tools: [
        {
          title: t('tools.compress.title'),
          description: t('tools.compress.description'),
          icon: Minimize2,
          href: '/compress',
          color: 'violet' as const,
        },
        {
          title: t('tools.repair.title'),
          description: t('tools.repair.description'),
          icon: Wrench,
          href: '/repair',
          color: 'cyan' as const,
        },
      ],
    },
    {
      name: t('categories.convertTo'),
      description: t('categories.convertToDesc'),
      image: convertPdfIllustration,
      tools: [
        {
          title: t('tools.jpgToPdf.title'),
          description: t('tools.jpgToPdf.description'),
          icon: Image,
          href: '/jpg-to-pdf',
          color: 'rose' as const,
        },
        {
          title: t('tools.wordToPdf.title'),
          description: t('tools.wordToPdf.description'),
          icon: FileText,
          href: '/word-to-pdf',
          color: 'violet' as const,
        },
        {
          title: t('tools.pptToPdf.title'),
          description: t('tools.pptToPdf.description'),
          icon: Presentation,
          href: '/ppt-to-pdf',
          color: 'cyan' as const,
        },
        {
          title: t('tools.excelToPdf.title'),
          description: t('tools.excelToPdf.description'),
          icon: Table,
          href: '/excel-to-pdf',
          color: 'coral' as const,
        },
      ],
    },
    {
      name: t('categories.convertFrom'),
      description: t('categories.convertFromDesc'),
      image: splitPdfIllustration,
      tools: [
        {
          title: t('tools.pdfToJpg.title'),
          description: t('tools.pdfToJpg.description'),
          icon: Image,
          href: '/pdf-to-jpg',
          color: 'violet' as const,
        },
        {
          title: t('tools.pdfToWord.title'),
          description: t('tools.pdfToWord.description'),
          icon: FileText,
          href: '/pdf-to-word',
          color: 'cyan' as const,
        },
        {
          title: t('tools.pdfToPpt.title'),
          description: t('tools.pdfToPpt.description'),
          icon: Presentation,
          href: '/pdf-to-ppt',
          color: 'coral' as const,
        },
        {
          title: t('tools.pdfToExcel.title'),
          description: t('tools.pdfToExcel.description'),
          icon: Table,
          href: '/pdf-to-excel',
          color: 'rose' as const,
        },
      ],
    },
    {
      name: t('categories.modify'),
      description: t('categories.modifyDesc'),
      image: securityIllustration,
      tools: [
        {
          title: t('tools.rotate.title'),
          description: t('tools.rotate.description'),
          icon: RotateCw,
          href: '/rotate',
          color: 'cyan' as const,
        },
        {
          title: t('tools.pageNumbers.title'),
          description: t('tools.pageNumbers.description'),
          icon: Hash,
          href: '/page-numbers',
          color: 'coral' as const,
        },
        {
          title: t('tools.watermark.title'),
          description: t('tools.watermark.description'),
          icon: Droplets,
          href: '/watermark',
          color: 'rose' as const,
        },
        {
          title: t('tools.crop.title'),
          description: t('tools.crop.description'),
          icon: Crop,
          href: '/crop',
          color: 'violet' as const,
        },
        {
          title: t('tools.edit.title'),
          description: t('tools.edit.description'),
          icon: Edit,
          href: '/edit',
          color: 'cyan' as const,
        },
      ],
    },
    {
      name: t('categories.compare'),
      description: t('categories.compareDesc'),
      image: heroPdf,
      tools: [
        {
          title: t('tools.compare.title'),
          description: t('tools.compare.description'),
          icon: GitCompare,
          href: '/compare',
          color: 'coral' as const,
        },
      ],
    },
  ];

  const features = [
    { icon: Zap, title: t('allTools.fastProcessing'), description: t('allTools.fastDesc') },
    { icon: Shield, title: t('allTools.totalSecurity'), description: t('allTools.secureDesc') },
    { icon: Globe, title: t('allTools.freeUnlimited'), description: t('allTools.freeDesc') },
  ];

  return (
    <>
      <SEOHead
        title="All PDF Tools - E-PDF's | Free Online PDF Tools"
        description="Complete collection of free online PDF tools. Merge, split, compress, convert, rotate, watermark and edit PDF files. 100% free, secure, and browser-based."
        keywords="PDF tools, all PDF tools, free PDF tools, online PDF, merge PDF, split PDF, compress PDF, convert PDF, PDF editor"
        canonicalUrl="https://e-pdfs.com/tools"
      />
      <div className="min-h-screen flex flex-col">
        <Header />

      <main className="flex-1">
        {/* Hero Section with Image */}
        <section className="pt-24 pb-16 relative overflow-hidden">
          <div className="absolute inset-0">
            <img 
              src={heroPdf} 
              alt="Tous les outils PDF en ligne - Fusionner, diviser, compresser et convertir vos documents PDF gratuitement" 
              className="w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-4xl mx-auto"
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                {t('allTools.title')} <span className="gradient-text">{t('allTools.titleHighlight')}</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-10">
                {t('allTools.subtitle')}
              </p>
              
              {/* Feature Pills */}
              <div className="flex flex-wrap justify-center gap-4">
                {features.map((feature) => (
                  <div key={feature.title} className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
                    <feature.icon className="w-4 h-4 text-primary" />
                    <span className="text-sm">{feature.title}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Tool Categories */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="space-y-24">
              {toolCategories.map((category, categoryIndex) => (
                <motion.section
                  key={category.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: categoryIndex * 0.1 }}
                >
                  {/* Category Header with Image */}
                  <div className="grid lg:grid-cols-2 gap-8 items-center mb-12">
                    <div className={categoryIndex % 2 === 1 ? 'lg:order-2' : ''}>
                      <div className="relative group">
                        <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 to-rose/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        <img 
                          src={category.image} 
                          alt={`${category.name} - ${category.description} - Outils PDF en ligne gratuits`}
                          className="relative rounded-xl w-full h-48 object-cover border border-border"
                        />
                      </div>
                    </div>
                    <div className={categoryIndex % 2 === 1 ? 'lg:order-1' : ''}>
                      <h2 className="text-3xl md:text-4xl font-bold mb-3">{category.name}</h2>
                      <p className="text-lg text-muted-foreground mb-4">{category.description}</p>
                      <div className="flex items-center gap-2 text-sm text-primary">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{category.tools.length} {t('allTools.toolsAvailable')}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Tools Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {category.tools.map((tool) => (
                      <ToolCard key={tool.title} {...tool} />
                    ))}
                  </div>
                </motion.section>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0">
            <img 
              src={securityIllustration} 
              alt="Sécurité des documents PDF - Vos fichiers restent privés et sécurisés" 
              className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-background to-rose/10" />
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-3xl mx-auto"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {t('allTools.ctaTitle')}
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                {t('allTools.ctaDescription')}
              </p>
              <Link to="/" className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4">
                {t('allTools.backHome')} <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* SEO Content */}
        <section className="py-16 border-t border-border">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">{t('allTools.guideTitle')}</h2>
              <div className="text-muted-foreground space-y-4 prose prose-invert">
                <p>{t('allTools.guideIntro')}</p>
                <h3 className="text-foreground text-xl font-semibold mt-6 mb-3">{t('allTools.organizeTitle')}</h3>
                <p>{t('allTools.organizeDesc')}</p>
                <h3 className="text-foreground text-xl font-semibold mt-6 mb-3">{t('allTools.convertTitle')}</h3>
                <p>{t('allTools.convertDesc')}</p>
                <h3 className="text-foreground text-xl font-semibold mt-6 mb-3">{t('allTools.modifyTitle')}</h3>
                <p>{t('allTools.modifyDesc')}</p>
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

export default AllTools;
