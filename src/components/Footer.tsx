import { FileText, Heart, Shield, Zap, Globe, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

// Import images
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
  return <footer className="border-t border-border mt-24 relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img src={heroPdf} alt="E-PDF's - Outils PDF en ligne gratuits" className="w-full h-full object-cover opacity-5" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background to-background/95" />
      </div>
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-6">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold gradient-text">E-Pdf's</span>
            </Link>
            <p className="text-muted-foreground leading-relaxed max-w-md">
              E-PDF's est votre solution complète pour la gestion de documents PDF. 
              Fusionnez, divisez, compressez et convertissez vos fichiers gratuitement, 
              directement dans votre navigateur. Plus de 10 millions de fichiers traités.
            </p>
            
            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3">
              {features.map(feature => <div key={feature.text} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border">
                  <feature.icon className="w-4 h-4 text-primary" />
                  <span className="text-sm">{feature.text}</span>
                </div>)}
            </div>

            {/* Contact Info */}
            
          </div>

          {/* Tool Categories */}
          {toolCategories.map(category => <div key={category.title}>
              <h3 className="font-semibold mb-4 text-lg">{category.title}</h3>
              <ul className="space-y-3">
                {category.links.map(link => <li key={link.name}>
                    <Link to={link.href} className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/50 group-hover:bg-primary transition-colors" />
                      {link.name}
                    </Link>
                  </li>)}
              </ul>
            </div>)}
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
          
        </div>
      </div>
    </footer>;
};
export default Footer;