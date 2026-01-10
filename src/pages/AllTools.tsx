import { motion } from 'framer-motion';
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

// Import images
import heroPdf from '@/assets/hero-pdf.jpg';
import mergePdfIllustration from '@/assets/merge-pdf-illustration.jpg';
import splitPdfIllustration from '@/assets/split-pdf-illustration.jpg';
import compressPdfIllustration from '@/assets/compress-pdf-illustration.jpg';
import convertPdfIllustration from '@/assets/convert-pdf-illustration.jpg';
import securityIllustration from '@/assets/security-illustration.jpg';

const toolCategories = [
  {
    name: 'Organiser PDF',
    description: 'Organisez vos documents PDF facilement',
    image: mergePdfIllustration,
    tools: [
      {
        title: 'Fusionner PDF',
        description: 'Combinez plusieurs fichiers PDF en un seul document',
        icon: Merge,
        href: '/merge',
        color: 'coral' as const,
      },
      {
        title: 'Diviser PDF',
        description: 'Divisez un PDF en plusieurs fichiers séparés',
        icon: Split,
        href: '/split',
        color: 'rose' as const,
      },
      {
        title: 'Supprimer des pages',
        description: 'Supprimez les pages indésirables de votre PDF',
        icon: Trash2,
        href: '/delete-pages',
        color: 'violet' as const,
      },
      {
        title: 'Extraire des pages',
        description: 'Extrayez des pages spécifiques de votre PDF',
        icon: FileOutput,
        href: '/extract-pages',
        color: 'cyan' as const,
      },
      {
        title: 'Organiser PDF',
        description: 'Réorganisez les pages de votre PDF',
        icon: LayoutGrid,
        href: '/organize',
        color: 'coral' as const,
      },
      {
        title: 'Numériser au format PDF',
        description: 'Convertissez vos images numérisées en PDF',
        icon: ScanLine,
        href: '/scan-to-pdf',
        color: 'rose' as const,
      },
    ],
  },
  {
    name: 'Optimiser le PDF',
    description: 'Optimisez et réparez vos fichiers PDF',
    image: compressPdfIllustration,
    tools: [
      {
        title: 'Compresser PDF',
        description: 'Réduisez la taille de vos fichiers PDF',
        icon: Minimize2,
        href: '/compress',
        color: 'violet' as const,
      },
      {
        title: 'Réparer PDF',
        description: 'Réparez les fichiers PDF corrompus',
        icon: Wrench,
        href: '/repair',
        color: 'cyan' as const,
      },
    ],
  },
  {
    name: 'Convertir en PDF',
    description: 'Convertissez différents formats en PDF',
    image: convertPdfIllustration,
    tools: [
      {
        title: 'JPG en PDF',
        description: 'Convertissez vos images JPG en documents PDF',
        icon: Image,
        href: '/jpg-to-pdf',
        color: 'rose' as const,
      },
      {
        title: 'Word en PDF',
        description: 'Convertissez vos documents Word en PDF',
        icon: FileText,
        href: '/word-to-pdf',
        color: 'violet' as const,
      },
      {
        title: 'PowerPoint en PDF',
        description: 'Convertissez vos présentations en PDF',
        icon: Presentation,
        href: '/ppt-to-pdf',
        color: 'cyan' as const,
      },
      {
        title: 'Excel en PDF',
        description: 'Convertissez vos feuilles de calcul en PDF',
        icon: Table,
        href: '/excel-to-pdf',
        color: 'coral' as const,
      },
    ],
  },
  {
    name: 'Convertir depuis PDF',
    description: 'Convertissez vos PDF vers d\'autres formats',
    image: splitPdfIllustration,
    tools: [
      {
        title: 'PDF en JPG',
        description: 'Convertissez chaque page en image JPG',
        icon: Image,
        href: '/pdf-to-jpg',
        color: 'violet' as const,
      },
      {
        title: 'PDF en Word',
        description: 'Convertissez vos PDF en documents Word',
        icon: FileText,
        href: '/pdf-to-word',
        color: 'cyan' as const,
      },
      {
        title: 'PDF en PowerPoint',
        description: 'Convertissez vos PDF en présentations',
        icon: Presentation,
        href: '/pdf-to-ppt',
        color: 'coral' as const,
      },
      {
        title: 'PDF en Excel',
        description: 'Convertissez vos PDF en feuilles de calcul',
        icon: Table,
        href: '/pdf-to-excel',
        color: 'rose' as const,
      },
    ],
  },
  {
    name: 'Modifier PDF',
    description: 'Modifiez et personnalisez vos fichiers PDF',
    image: securityIllustration,
    tools: [
      {
        title: 'Faire pivoter PDF',
        description: 'Faites pivoter les pages de votre PDF',
        icon: RotateCw,
        href: '/rotate',
        color: 'cyan' as const,
      },
      {
        title: 'Numéros de pages',
        description: 'Ajoutez des numéros aux pages de votre PDF',
        icon: Hash,
        href: '/page-numbers',
        color: 'coral' as const,
      },
      {
        title: 'Ajouter un filigrane',
        description: 'Ajoutez un filigrane à votre PDF',
        icon: Droplets,
        href: '/watermark',
        color: 'rose' as const,
      },
      {
        title: 'Rogner PDF',
        description: 'Recadrez les pages de votre PDF',
        icon: Crop,
        href: '/crop',
        color: 'violet' as const,
      },
      {
        title: 'Modifier PDF',
        description: 'Modifiez le texte et les images de votre PDF',
        icon: Edit,
        href: '/edit',
        color: 'cyan' as const,
      },
    ],
  },
  {
    name: 'Comparer PDF',
    description: 'Comparez vos fichiers PDF',
    image: heroPdf,
    tools: [
      {
        title: 'Comparer PDF',
        description: 'Comparez deux fichiers PDF',
        icon: GitCompare,
        href: '/compare',
        color: 'coral' as const,
      },
    ],
  },
];

const features = [
  { icon: Zap, title: 'Traitement rapide', description: 'Vos fichiers sont traités instantanément' },
  { icon: Shield, title: 'Sécurité totale', description: 'Vos fichiers restent sur votre appareil' },
  { icon: Globe, title: 'Gratuit et illimité', description: 'Tous les outils sans restriction' },
];

const AllTools = () => {
  return (
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
                Tous les <span className="gradient-text">outils PDF</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-10">
                Découvrez notre collection complète d'outils pour gérer, convertir et modifier vos fichiers PDF. 
                Plus de 20 outils gratuits pour tous vos besoins en matière de documents PDF.
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
                        <span>{category.tools.length} outil{category.tools.length > 1 ? 's' : ''} disponible{category.tools.length > 1 ? 's' : ''}</span>
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
                Besoin d'aide pour choisir le bon outil ?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Retournez à la page d'accueil pour découvrir nos outils les plus populaires et comment ils peuvent vous aider.
              </p>
              <Link to="/" className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4">
                Retour à l'accueil <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* SEO Content */}
        <section className="py-16 border-t border-border">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">Guide complet des outils PDF en ligne</h2>
              <div className="text-muted-foreground space-y-4 prose prose-invert">
                <p>
                  E-PDF's offre une suite complète d'<strong className="text-foreground">outils PDF gratuits</strong> pour répondre à tous vos besoins de gestion documentaire. 
                  Que vous soyez un professionnel, un étudiant ou un particulier, nos outils sont conçus pour être <strong className="text-foreground">simples et efficaces</strong>.
                </p>
                <h3 className="text-foreground text-xl font-semibold mt-6 mb-3">Organiser vos PDF</h3>
                <p>
                  Utilisez nos outils pour <strong className="text-foreground">fusionner plusieurs PDF</strong> en un seul document, 
                  <strong className="text-foreground">diviser un PDF volumineux</strong> en fichiers séparés, ou 
                  <strong className="text-foreground">réorganiser les pages</strong> selon vos besoins.
                </p>
                <h3 className="text-foreground text-xl font-semibold mt-6 mb-3">Convertir vos documents</h3>
                <p>
                  Transformez facilement vos fichiers avec nos convertisseurs : <strong className="text-foreground">JPG en PDF</strong>, 
                  <strong className="text-foreground">Word en PDF</strong>, <strong className="text-foreground">Excel en PDF</strong>, 
                  et inversement. Tous les formats populaires sont supportés.
                </p>
                <h3 className="text-foreground text-xl font-semibold mt-6 mb-3">Modifier et personnaliser</h3>
                <p>
                  Ajoutez un <strong className="text-foreground">filigrane</strong>, des <strong className="text-foreground">numéros de page</strong>, 
                  ou <strong className="text-foreground">faites pivoter vos pages PDF</strong>. Nos outils de modification vous donnent un contrôle total sur vos documents.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AllTools;
