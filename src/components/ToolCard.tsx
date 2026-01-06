import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ToolCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color?: 'coral' | 'rose' | 'violet' | 'cyan';
}

const colorClasses = {
  coral: 'from-coral to-rose',
  rose: 'from-rose to-violet',
  violet: 'from-violet to-cyan',
  cyan: 'from-cyan to-coral',
};

const ToolCard = ({ title, description, icon: Icon, href, color = 'coral' }: ToolCardProps) => {
  return (
    <Link to={href}>
      <motion.div
        className="tool-card group h-full"
        whileHover={{ y: -5 }}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div
          className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon className="w-7 h-7 text-white" />
        </div>
        <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </motion.div>
    </Link>
  );
};

export default ToolCard;
