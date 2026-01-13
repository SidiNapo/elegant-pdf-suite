import { Shield, Lock, Server, Zap, Globe, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

interface TrustBadgesProps {
  variant?: 'compact' | 'full';
  className?: string;
}

const TrustBadges = ({ variant = 'compact', className = '' }: TrustBadgesProps) => {
  const { t } = useTranslation();

  const badges = [
    {
      icon: Shield,
      label: t('trustBadges.secure'),
      description: t('trustBadges.secureDesc'),
      color: 'text-green-500'
    },
    {
      icon: Lock,
      label: t('trustBadges.ssl'),
      description: t('trustBadges.sslDesc'),
      color: 'text-blue-500'
    },
    {
      icon: Server,
      label: t('trustBadges.noUpload'),
      description: t('trustBadges.noUploadDesc'),
      color: 'text-purple-500'
    },
    {
      icon: Zap,
      label: t('trustBadges.instant'),
      description: t('trustBadges.instantDesc'),
      color: 'text-amber-500'
    },
    {
      icon: Globe,
      label: t('trustBadges.free'),
      description: t('trustBadges.freeDesc'),
      color: 'text-cyan-500'
    },
    {
      icon: CheckCircle,
      label: t('trustBadges.noAccount'),
      description: t('trustBadges.noAccountDesc'),
      color: 'text-emerald-500'
    }
  ];

  if (variant === 'compact') {
    return (
      <div className={`flex flex-wrap items-center justify-center gap-4 ${className}`}>
        {badges.slice(0, 4).map((badge, index) => (
          <motion.div
            key={badge.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border hover:border-primary/30 transition-colors"
          >
            <badge.icon className={`w-4 h-4 ${badge.color}`} />
            <span className="text-xs font-medium text-foreground">{badge.label}</span>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 ${className}`}>
      {badges.map((badge, index) => (
        <motion.div
          key={badge.label}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 }}
          className="flex flex-col items-center text-center p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all hover:shadow-lg"
        >
          <div className={`w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3`}>
            <badge.icon className={`w-6 h-6 ${badge.color}`} />
          </div>
          <h4 className="font-semibold text-foreground text-sm mb-1">{badge.label}</h4>
          <p className="text-xs text-muted-foreground">{badge.description}</p>
        </motion.div>
      ))}
    </div>
  );
};

export default TrustBadges;
