import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface ProcessingLoaderProps {
  message?: string;
}

const ProcessingLoader = ({ message }: ProcessingLoaderProps) => {
  const { t } = useTranslation();
  const displayMessage = message || t('common.processing');

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <motion.div
        className="relative w-24 h-24"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      >
        <div className="absolute inset-0 rounded-full border-4 border-muted" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary" />
      </motion.div>
      <motion.p
        className="mt-6 text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {displayMessage}
      </motion.p>
    </div>
  );
};

export default ProcessingLoader;
