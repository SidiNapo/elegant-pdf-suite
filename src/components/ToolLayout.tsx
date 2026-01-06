import { motion } from 'framer-motion';
import { LucideIcon, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

interface ToolLayoutProps {
  title: string;
  description: string;
  icon: LucideIcon;
  children: React.ReactNode;
  color?: 'coral' | 'rose' | 'violet' | 'cyan';
}

const colorClasses = {
  coral: 'from-coral to-rose',
  rose: 'from-rose to-violet',
  violet: 'from-violet to-cyan',
  cyan: 'from-cyan to-coral',
};

const ToolLayout = ({
  title,
  description,
  icon: Icon,
  children,
  color = 'coral',
}: ToolLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4">
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
              <span>Tous les outils</span>
            </Link>
          </motion.div>

          {/* Tool Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div
              className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center mx-auto mb-6`}
            >
              <Icon className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{title}</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{description}</p>
          </motion.div>

          {/* Tool Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {children}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ToolLayout;
