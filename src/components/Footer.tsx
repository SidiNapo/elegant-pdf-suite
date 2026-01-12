import { Shield, Zap, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import logo from '@/assets/logo.png';
import heroPdf from '@/assets/hero-pdf.jpg';

const Footer = () => {
  const { t } = useTranslation();

  const toolCategories = [{
    title: t('footer.organize'),
    links: [{
      name: t('tools.merge.title'),
      href: '/merge'
    }, {
      name: t('tools.split.title'),
      href: '/split'
    }, {
      name: t('tools.deletePages.title'),
      href: '/delete-pages'
    }, {
      name: t('tools.extractPages.title'),
      href: '/extract-pages'
    }]
  }, {
    title: t('footer.convert'),
    links: [{
      name: t('tools.jpgToPdf.title'),
      href: '/jpg-to-pdf'
    }, {
      name: t('tools.pdfToJpg.title'),
      href: '/pdf-to-jpg'
    }, {
      name: t('tools.wordToPdf.title'),
      href: '/word-to-pdf'
    }, {
      name: t('tools.pdfToWord.title'),
      href: '/pdf-to-word'
    }]
  }, {
    title: t('footer.resources'),
    links: [{
      name: t('nav.blog'),
      href: '/blog'
    }, {
      name: t('nav.allTools'),
      href: '/tools'
    }, {
      name: t('tools.compress.title'),
      href: '/compress'
    }, {
      name: t('tools.rotate.title'),
      href: '/rotate'
    }]
  }];
  
  const features = [{
    icon: Shield,
    text: t('footer.secure')
  }, {
    icon: Zap,
    text: t('footer.fast')
  }, {
    icon: Globe,
    text: t('footer.free')
  }];
  
  return (
    <footer className="border-t border-border mt-24 relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img src={heroPdf} alt="E-PDF's" className="w-full h-full object-cover opacity-5" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background to-background/95" />
      </div>
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-6">
            <Link to="/" className="inline-block group">
              <img 
                src={logo} 
                alt="E-Pdfs" 
                className="h-24 md:h-28 lg:h-32 w-auto object-contain drop-shadow-[0_0_25px_rgba(236,72,153,0.6)] transition-all duration-300 group-hover:drop-shadow-[0_0_35px_rgba(236,72,153,0.8)] group-hover:scale-105" 
              />
            </Link>
            <p className="text-muted-foreground leading-relaxed max-w-md">
              {t('footer.description')}
            </p>
            
            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3">
              {features.map(feature => (
                <div key={feature.text} className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border hover:border-primary/50 transition-colors">
                  <feature.icon className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tool Categories */}
          {toolCategories.map(category => (
            <div key={category.title}>
              <h3 className="font-bold mb-4 text-lg text-foreground">{category.title}</h3>
              <ul className="space-y-3">
                {category.links.map(link => (
                  <li key={link.href}>
                    <Link to={link.href} className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/50 group-hover:bg-primary transition-colors" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* SEO Keywords */}
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-xs text-muted-foreground/70 text-center max-w-4xl mx-auto">
            {t('footer.seoKeywords')}
          </p>
        </div>

        {/* Bottom */}
        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {t('footer.copyright')}
          </p>
          <div className="flex items-center gap-4">
            <Link to="/tools" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              {t('footer.allTools')}
            </Link>
            <Link to="/blog" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              {t('nav.blog')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
