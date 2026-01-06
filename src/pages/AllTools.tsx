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
  FileSearch,
  Image,
  FileText,
  Presentation,
  Table,
  Globe,
  RotateCw,
  Hash,
  Droplets,
  Crop,
  Edit,
  Unlock,
  Lock,
  PenTool,
  EyeOff,
  GitCompare,
  FileType,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ToolCard from '@/components/ToolCard';

const toolCategories = [
  {
    name: 'Organiser PDF',
    description: 'Organisez vos documents PDF facilement',
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
      {
        title: 'OCR PDF',
        description: 'Rendez vos PDF consultables et modifiables',
        icon: FileSearch,
        href: '/ocr',
        color: 'coral' as const,
      },
    ],
  },
  {
    name: 'Convertir en PDF',
    description: 'Convertissez différents formats en PDF',
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
      {
        title: 'HTML en PDF',
        description: 'Convertissez des pages web en PDF',
        icon: Globe,
        href: '/html-to-pdf',
        color: 'rose' as const,
      },
    ],
  },
  {
    name: 'Convertir depuis PDF',
    description: 'Convertissez vos PDF vers d\'autres formats',
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
      {
        title: 'PDF en PDF/A',
        description: 'Convertissez en format d\'archivage',
        icon: FileType,
        href: '/pdf-to-pdfa',
        color: 'violet' as const,
      },
    ],
  },
  {
    name: 'Modifier PDF',
    description: 'Modifiez et personnalisez vos fichiers PDF',
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
    name: 'Sécurité PDF',
    description: 'Protégez et sécurisez vos fichiers PDF',
    tools: [
      {
        title: 'Déverrouiller PDF',
        description: 'Supprimez le mot de passe de votre PDF',
        icon: Unlock,
        href: '/unlock',
        color: 'coral' as const,
      },
      {
        title: 'Protéger PDF',
        description: 'Ajoutez un mot de passe à votre PDF',
        icon: Lock,
        href: '/protect',
        color: 'rose' as const,
      },
      {
        title: 'Signer PDF',
        description: 'Signez vos documents PDF',
        icon: PenTool,
        href: '/sign',
        color: 'violet' as const,
      },
      {
        title: 'Censurer PDF',
        description: 'Masquez le contenu sensible',
        icon: EyeOff,
        href: '/redact',
        color: 'cyan' as const,
      },
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

const AllTools = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-32 pb-16">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Tous les <span className="gradient-text">outils PDF</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Découvrez notre collection complète d'outils pour gérer, convertir et modifier vos fichiers PDF.
            </p>
          </motion.div>

          {/* Tool Categories */}
          <div className="space-y-16">
            {toolCategories.map((category, categoryIndex) => (
              <motion.section
                key={category.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: categoryIndex * 0.1 }}
              >
                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-2">{category.name}</h2>
                  <p className="text-muted-foreground">{category.description}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {category.tools.map((tool) => (
                    <ToolCard key={tool.title} {...tool} />
                  ))}
                </div>
              </motion.section>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AllTools;
