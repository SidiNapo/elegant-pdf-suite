import { motion } from 'framer-motion';
import { ArrowRight, Merge, Split, Minimize2, Image, RotateCw, Droplets, Zap, Shield, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ToolCard from '@/components/ToolCard';

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
  { icon: Zap, title: 'Ultra rapide', description: 'Traitement instantané directement dans votre navigateur' },
  { icon: Shield, title: '100% Sécurisé', description: 'Vos fichiers ne quittent jamais votre appareil' },
  { icon: Globe, title: 'Gratuit', description: 'Tous les outils sont gratuits et sans limite' },
];

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent opacity-50" />
        <div className="container mx-auto px-4 relative">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Tous vos outils <span className="gradient-text">PDF</span> en un seul endroit
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Fusionnez, divisez, compressez et convertissez vos PDF gratuitement. Rapide, sécurisé et sans inscription.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/tools" className="btn-primary inline-flex items-center gap-2">
                Découvrir tous les outils <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/merge" className="btn-secondary">Fusionner PDF</Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Tools */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Outils populaires</h2>
            <p className="text-muted-foreground">Les outils les plus utilisés pour gérer vos PDF</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {popularTools.map((tool) => <ToolCard key={tool.title} {...tool} />)}
          </div>
          <div className="text-center mt-12">
            <Link to="/tools" className="btn-secondary inline-flex items-center gap-2">
              Voir tous les outils <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
