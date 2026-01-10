import { Shield, Zap, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '@/assets/logo.png';
import heroPdf from '@/assets/hero-pdf.jpg';

const Footer = () => {
  const toolCategories = [{
    title: 'Organiser',
    links: [{
      name: 'Fusionner PDF',
      href: '/merge'
    }, {
      name: 'Diviser PDF',
      href: '/split'
    }, {
      name: 'Supprimer des pages',
      href: '/delete-pages'
    }, {
      name: 'Extraire des pages',
      href: '/extract-pages'
    }]
  }, {
    title: 'Convertir',
    links: [{
      name: 'JPG en PDF',
      href: '/jpg-to-pdf'
    }, {
      name: 'PDF en JPG',
      href: '/pdf-to-jpg'
    }, {
      name: 'Word en PDF',
      href: '/word-to-pdf'
    }, {
      name: 'PDF en Word',
      href: '/pdf-to-word'
    }]
  }, {
    title: 'Ressources',
    links: [{
      name: 'Blog',
      href: '/blog'
    }, {
      name: 'Tous les outils',
      href: '/tools'
    }, {
      name: 'Compresser PDF',
      href: '/compress'
    }, {
      name: 'Faire pivoter PDF',
      href: '/rotate'
    }]
  }];
  
  const features = [{
    icon: Shield,
    text: 'Sécurisé'
  }, {
    icon: Zap,
    text: 'Rapide'
  }, {
    icon: Globe,
    text: 'Gratuit'
  }];
  
  return (
    <footer className="border-t border-border mt-24 relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img src={heroPdf} alt="E-PDF's - Outils PDF en ligne gratuits" className="w-full h-full object-cover opacity-5" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background to-background/95" />
      </div>
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-6">
            <Link to="/" className="inline-block group">
              <img 
                src={logo} 
                alt="E-Pdfs - Outils PDF en ligne gratuits" 
                className="h-24 md:h-28 lg:h-32 w-auto object-contain drop-shadow-[0_0_25px_rgba(236,72,153,0.6)] transition-all duration-300 group-hover:drop-shadow-[0_0_35px_rgba(236,72,153,0.8)] group-hover:scale-105" 
              />
            </Link>
            <p className="text-muted-foreground leading-relaxed max-w-md">
              E-PDF's est votre solution complète pour la gestion de documents PDF. 
              Fusionnez, divisez, compressez et convertissez vos fichiers gratuitement, 
              directement dans votre navigateur. Plus de 10 millions de fichiers traités.
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
                  <li key={link.name}>
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
            <strong className="text-muted-foreground">E-PDF's</strong> - Outils PDF en ligne gratuits : 
            fusionner PDF, diviser PDF, compresser PDF, convertir JPG en PDF, PDF en Word, 
            Word en PDF, PDF en JPG, ajouter filigrane, numéros de page, faire pivoter PDF, 
            extraire pages, supprimer pages, réparer PDF, Excel en PDF, PowerPoint en PDF.
          </p>
        </div>

        {/* Bottom */}
        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 E-Pdf's. Tous droits réservés. Outils PDF gratuits en ligne.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/tools" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Tous les outils
            </Link>
            <Link to="/blog" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Blog
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
