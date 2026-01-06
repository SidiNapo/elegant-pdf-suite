import { LucideIcon } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import { motion } from 'framer-motion';
import { Construction } from 'lucide-react';

interface GenericToolPageProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color?: 'coral' | 'rose' | 'violet' | 'cyan';
}

const GenericToolPage = ({ title, description, icon, color = 'coral' }: GenericToolPageProps) => {
  return (
    <ToolLayout title={title} description={description} icon={icon} color={color}>
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-3xl p-12"
        >
          <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
            <Construction className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-semibold mb-4">Bientôt disponible</h3>
          <p className="text-muted-foreground leading-relaxed">
            Cette fonctionnalité est en cours de développement et sera disponible très prochainement. 
            Merci de votre patience !
          </p>
        </motion.div>
      </div>
    </ToolLayout>
  );
};

export default GenericToolPage;
