import { motion } from 'framer-motion';
import { ArrowRight, Merge, Split, Minimize2, Image, RotateCw, Droplets, Zap, Shield, Globe, CheckCircle2, Users, FileText, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ToolCard from '@/components/ToolCard';

// Import images
import heroPdf from '@/assets/hero-pdf.jpg';
import mergePdfIllustration from '@/assets/merge-pdf-illustration.jpg';
import splitPdfIllustration from '@/assets/split-pdf-illustration.jpg';
import compressPdfIllustration from '@/assets/compress-pdf-illustration.jpg';
import convertPdfIllustration from '@/assets/convert-pdf-illustration.jpg';
import securityIllustration from '@/assets/security-illustration.jpg';
import speedIllustration from '@/assets/speed-illustration.jpg';
import globalIllustration from '@/assets/global-illustration.jpg';

const popularTools = [
  { title: 'Fusionner PDF', description: 'Combinez plusieurs PDF en un', icon: Merge, href: '/merge', color: 'coral' as const },
  { title: 'Diviser PDF', description: 'Divisez un PDF en plusieurs fichiers', icon: Split, href: '/split', color: 'rose' as const },
  { title: 'Compresser PDF', description: 'Réduisez la taille de vos PDF', icon: Minimize2, href: '/compress', color: 'violet' as const },
  { title: 'JPG en PDF', description: 'Convertissez vos images en PDF', icon: Image, href: '/jpg-to-pdf', color: 'cyan' as const },
  { title: 'PDF en JPG', description: 'Convertissez PDF en images', icon: Image, href: '/pdf-to-jpg', color: 'coral' as const },
  { title: 'Faire pivoter', description: 'Faites pivoter vos pages PDF', icon: RotateCw, href: '/rotate', color: 'rose' as const },
  { title: 'Filigrane', description: 'Ajoutez un filigrane texte', icon: Droplets, href: '/watermark', color: 'violet' as const },
];

const features = [
  { icon: Zap, title: 'Ultra rapide', description: 'Traitement instantané directement dans votre navigateur', image: speedIllustration },
  { icon: Shield, title: '100% Sécurisé', description: 'Vos fichiers ne quittent jamais votre appareil', image: securityIllustration },
  { icon: Globe, title: 'Gratuit', description: 'Tous les outils sont gratuits et sans limite', image: globalIllustration },
];

const showcaseTools = [
  {
    title: 'Fusionner vos PDF',
    description: 'Combinez facilement plusieurs documents PDF en un seul fichier. Idéal pour créer des rapports complets, des portfolios ou des dossiers organisés.',
    image: mergePdfIllustration,
    href: '/merge',
    features: ['Glisser-déposer simple', 'Réorganiser les pages', 'Prévisualisation instantanée'],
  },
  {
    title: 'Diviser vos documents',
    description: 'Séparez un PDF volumineux en plusieurs fichiers distincts. Extrayez des pages spécifiques ou divisez par plages de pages.',
    image: splitPdfIllustration,
    href: '/split',
    features: ['Division par pages', 'Extraction sélective', 'Export multiple'],
  },
  {
    title: 'Compresser sans perte',
    description: 'Réduisez la taille de vos PDF jusqu\'à 90% tout en préservant la qualité. Parfait pour les envois par email.',
    image: compressPdfIllustration,
    href: '/compress',
    features: ['Compression intelligente', 'Qualité préservée', 'Taille réduite'],
  },
  {
    title: 'Convertir facilement',
    description: 'Transformez vos images, documents Word, PowerPoint et Excel en PDF de haute qualité en quelques secondes.',
    image: convertPdfIllustration,
    href: '/jpg-to-pdf',
    features: ['Multi-formats', 'Conversion rapide', 'Qualité optimale'],
  },
];

const stats = [
  { value: '10M+', label: 'Fichiers traités' },
  { value: '500K+', label: 'Utilisateurs satisfaits' },
  { value: '20+', label: 'Outils disponibles' },
  { value: '100%', label: 'Gratuit' },
];

const testimonials = [
  { name: 'Marie L.', role: 'Designer', text: 'E-PDF\'s m\'a fait gagner des heures de travail. Les outils sont intuitifs et rapides.' },
  { name: 'Thomas B.', role: 'Entrepreneur', text: 'Enfin un outil PDF gratuit et sans publicités intrusives. Je recommande vivement!' },
  { name: 'Sophie M.', role: 'Étudiante', text: 'Parfait pour mes cours. Je peux fusionner mes notes PDF en quelques clics.' },
];

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section with Background Image */}
      <section className="pt-24 pb-20 relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img 
            src={heroPdf} 
            alt="E-PDF's - Outils PDF en ligne gratuits pour fusionner, diviser et compresser vos documents" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.8 }}
              className="text-left"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary text-sm font-medium mb-6">
                <Star className="w-4 h-4 fill-primary" />
                #1 Outil PDF en ligne gratuit
              </span>
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                Tous vos outils <span className="gradient-text">PDF</span> en un seul endroit
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-xl">
                Fusionnez, divisez, compressez et convertissez vos PDF gratuitement. Rapide, sécurisé et sans inscription. Plus de 10 millions de fichiers traités.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/tools" className="btn-primary inline-flex items-center justify-center gap-2 text-lg px-8 py-4">
                  Découvrir tous les outils <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/merge" className="btn-secondary inline-flex items-center justify-center gap-2 text-lg px-8 py-4">
                  Fusionner PDF
                </Link>
              </div>
              
              {/* Trust Badges */}
              <div className="flex items-center gap-6 mt-10 pt-10 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <span className="text-sm text-muted-foreground">100% Sécurisé</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Traitement rapide</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="text-sm text-muted-foreground">500K+ utilisateurs</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-rose/20 rounded-3xl blur-3xl" />
                <img 
                  src={heroPdf} 
                  alt="Gestion de documents PDF - Fusionner, diviser, compresser et convertir vos fichiers PDF en ligne" 
                  className="relative rounded-2xl shadow-2xl border border-white/10"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-b from-background to-card/50 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features with Images */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            whileInView={{ opacity: 1 }} 
            viewport={{ once: true }} 
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Pourquoi choisir <span className="gradient-text">E-PDF's</span> ?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Une solution complète pour tous vos besoins PDF, conçue pour être simple, rapide et sécurisée.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div 
                key={feature.title} 
                initial={{ opacity: 0, y: 30 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                transition={{ delay: i * 0.15 }} 
                className="group relative overflow-hidden rounded-3xl bg-card border border-border hover:border-primary/50 transition-all duration-500"
              >
                <div className="aspect-square overflow-hidden">
                  <img 
                    src={feature.image} 
                    alt={`${feature.title} - ${feature.description}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/80 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="w-14 h-14 rounded-2xl bg-primary/20 backdrop-blur-sm flex items-center justify-center mb-4">
                    <feature.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-bold text-2xl mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Showcase Tools with Images - Alternating Layout */}
      <section className="py-24 bg-gradient-to-b from-card/30 to-background">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            whileInView={{ opacity: 1 }} 
            viewport={{ once: true }} 
            className="text-center mb-20"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Outils <span className="gradient-text">puissants</span> et intuitifs
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Découvrez nos outils les plus populaires pour gérer vos documents PDF comme un professionnel.
            </p>
          </motion.div>
          
          <div className="space-y-32">
            {showcaseTools.map((tool, i) => (
              <motion.div
                key={tool.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className={`grid lg:grid-cols-2 gap-12 items-center ${i % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
              >
                <div className={`${i % 2 === 1 ? 'lg:order-2' : ''}`}>
                  <div className="relative group">
                    <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 to-rose/30 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <img 
                      src={tool.image} 
                      alt={`${tool.title} - ${tool.description} - Outil PDF en ligne gratuit`}
                      className="relative rounded-2xl shadow-2xl border border-white/10 w-full"
                    />
                  </div>
                </div>
                <div className={`${i % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <h3 className="text-3xl md:text-4xl font-bold mb-4">{tool.title}</h3>
                  <p className="text-lg text-muted-foreground mb-8">{tool.description}</p>
                  <ul className="space-y-4 mb-8">
                    {tool.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                        </div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link 
                    to={tool.href} 
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    Essayer maintenant <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Tools */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Outils <span className="gradient-text">populaires</span></h2>
            <p className="text-xl text-muted-foreground">Les outils les plus utilisés pour gérer vos documents PDF</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {popularTools.map((tool) => <ToolCard key={tool.title} {...tool} />)}
          </div>
          <div className="text-center mt-12">
            <Link to="/tools" className="btn-secondary inline-flex items-center gap-2 text-lg px-8 py-4">
              Voir tous les outils <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gradient-to-b from-card/30 to-background">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            whileInView={{ opacity: 1 }} 
            viewport={{ once: true }} 
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Ce que disent nos <span className="gradient-text">utilisateurs</span>
            </h2>
            <p className="text-xl text-muted-foreground">Plus de 500 000 personnes font confiance à E-PDF's</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-8 rounded-2xl"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>
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
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={heroPdf} 
            alt="Commencez à utiliser E-PDF's - Outils PDF gratuits en ligne" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-background to-rose/20" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <FileText className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Prêt à simplifier votre travail avec les <span className="gradient-text">PDF</span> ?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Rejoignez plus de 500 000 utilisateurs qui font confiance à E-PDF's pour leurs documents PDF. Gratuit, rapide et sécurisé.
            </p>
            <Link to="/tools" className="btn-primary inline-flex items-center gap-2 text-lg px-10 py-5">
              Commencer maintenant <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* SEO Content Section */}
      <section className="py-16 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto prose prose-invert">
            <h2 className="text-2xl font-bold mb-6 text-foreground">E-PDF's : Votre solution complète pour la gestion de documents PDF</h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                <strong className="text-foreground">E-PDF's</strong> est la plateforme en ligne gratuite la plus complète pour tous vos besoins en matière de <strong className="text-foreground">gestion de fichiers PDF</strong>. 
                Que vous ayez besoin de <strong className="text-foreground">fusionner des PDF</strong>, <strong className="text-foreground">diviser un document PDF</strong>, 
                <strong className="text-foreground">compresser des fichiers PDF</strong> pour réduire leur taille, ou <strong className="text-foreground">convertir des images en PDF</strong>, 
                nos outils sont conçus pour être simples, rapides et efficaces.
              </p>
              <p>
                Nos <strong className="text-foreground">outils PDF en ligne</strong> fonctionnent directement dans votre navigateur, sans nécessiter d'installation de logiciel. 
                Vos documents restent sur votre appareil, garantissant une <strong className="text-foreground">confidentialité totale</strong> de vos données. 
                Avec plus de <strong className="text-foreground">10 millions de fichiers traités</strong>, E-PDF's est devenu la référence pour 
                <strong className="text-foreground">l'édition de PDF gratuite</strong>.
              </p>
              <p>
                Découvrez nos fonctionnalités : <strong className="text-foreground">fusionner plusieurs PDF</strong>, <strong className="text-foreground">extraire des pages PDF</strong>, 
                <strong className="text-foreground">ajouter un filigrane</strong>, <strong className="text-foreground">faire pivoter des pages</strong>, 
                <strong className="text-foreground">convertir Word en PDF</strong>, <strong className="text-foreground">PDF en JPG</strong>, et bien plus encore. 
                Tous nos outils sont <strong className="text-foreground">100% gratuits</strong> et <strong className="text-foreground">sans limite d'utilisation</strong>.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
