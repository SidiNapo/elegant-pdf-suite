import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X, Shield, BarChart3, Megaphone, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useIsRTL } from '@/hooks/useDirection';

const CONSENT_KEY = 'epdfs_cookie_consent';

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  advertising: boolean;
}

const CookieConsent = () => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: true,
    advertising: true,
  });
  const isRTL = useIsRTL();

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ 
      accepted: true, 
      preferences,
      timestamp: Date.now() 
    }));
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ 
      accepted: false, 
      preferences: { essential: true, analytics: false, advertising: false },
      timestamp: Date.now() 
    }));
    setIsVisible(false);
  };

  const cookieOptions = [
    {
      id: 'essential',
      icon: Shield,
      gradient: 'from-emerald-500 to-teal-500',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      glow: 'shadow-emerald-500/20',
      label: t('cookieConsent.essential'),
      checked: true,
      disabled: true,
      onChange: () => {},
    },
    {
      id: 'analytics',
      icon: BarChart3,
      gradient: 'from-amber-500 to-orange-500',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      glow: 'shadow-amber-500/20',
      label: t('cookieConsent.analytics'),
      checked: preferences.analytics,
      disabled: false,
      onChange: (checked: boolean) => setPreferences(p => ({ ...p, analytics: checked })),
    },
    {
      id: 'advertising',
      icon: Megaphone,
      gradient: 'from-blue-500 to-indigo-500',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      glow: 'shadow-blue-500/20',
      label: t('cookieConsent.advertising'),
      checked: preferences.advertising,
      disabled: false,
      onChange: (checked: boolean) => setPreferences(p => ({ ...p, advertising: checked })),
    },
  ];

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 120, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 120, opacity: 0, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 260, damping: 25 }}
        className="fixed bottom-4 inset-x-4 z-50 sm:bottom-6 sm:left-auto sm:right-6 sm:max-w-sm"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Outer glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary via-rose-500 to-violet-500 rounded-3xl blur-lg opacity-30 animate-pulse" />
        
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-card via-card to-card/80 backdrop-blur-xl shadow-2xl">
          
          {/* Animated gradient border */}
          <div className="absolute inset-0 rounded-2xl p-[1px] bg-gradient-to-r from-primary via-rose-500 to-violet-500 opacity-50" style={{ WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude' }} />
          
          {/* Floating particles effect */}
          <div className="absolute top-2 right-8 w-1 h-1 bg-primary rounded-full animate-ping opacity-60" />
          <div className="absolute top-6 right-4 w-0.5 h-0.5 bg-rose-500 rounded-full animate-ping opacity-40" style={{ animationDelay: '0.5s' }} />
          <div className="absolute bottom-12 left-6 w-1 h-1 bg-violet-500 rounded-full animate-ping opacity-50" style={{ animationDelay: '1s' }} />
          
          <div className="relative p-4">
            {/* Close button */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleDecline}
              className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'} p-1.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 transition-all z-10`}
              aria-label={t('cookieConsent.close')}
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </motion.button>

            {/* Header */}
            <div className={`flex items-center gap-3 mb-3 ${isRTL ? 'pl-8' : 'pr-8'}`}>
              <motion.div 
                className="relative"
                animate={{ rotate: [0, -5, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary via-rose-500 to-violet-500 flex items-center justify-center shadow-lg shadow-primary/30">
                  <Cookie className="w-5 h-5 text-white" />
                </div>
                <motion.div 
                  className={`absolute -top-1 ${isRTL ? '-left-1' : '-right-1'}`}
                  animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </motion.div>
              </motion.div>
              
              <div className="flex-1">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  {t('cookieConsent.title')}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {t('cookieConsent.description')}
                </p>
              </div>
            </div>

            {/* Cookie Options */}
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="space-y-2 mb-3 pt-1">
                    {cookieOptions.map((option, index) => (
                      <motion.div
                        key={option.id}
                        initial={{ opacity: 0, x: isRTL ? 15 : -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.08 }}
                        className={`group relative flex items-center justify-between p-2.5 rounded-xl ${option.bg} border ${option.border} transition-all hover:shadow-lg ${option.glow}`}
                      >
                        {/* Icon with gradient background */}
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${option.gradient} flex items-center justify-center shadow-md transition-transform group-hover:scale-110`}>
                            <option.icon className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-sm font-medium text-foreground">{option.label}</span>
                        </div>
                        <Switch
                          checked={option.checked}
                          disabled={option.disabled}
                          onCheckedChange={option.onChange}
                          className="scale-90"
                        />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Toggle details */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowDetails(!showDetails)}
              className="w-full text-xs text-primary hover:text-primary/80 transition-colors mb-3 py-1.5 rounded-lg hover:bg-primary/5 font-medium"
            >
              {showDetails ? t('cookieConsent.close') : t('cookieConsent.customize', 'Customize')}
            </motion.button>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={handleDecline}
                variant="outline"
                size="sm"
                className="flex-1 h-10 text-xs font-semibold border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all"
              >
                {t('cookieConsent.essentialOnly')}
              </Button>
              <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={handleAccept}
                  size="sm"
                  className="w-full h-10 text-xs font-semibold bg-gradient-to-r from-primary via-rose-500 to-violet-500 hover:opacity-90 text-white shadow-lg shadow-primary/25 border-0"
                >
                  {t('cookieConsent.acceptAll')}
                </Button>
              </motion.div>
            </div>

            {/* Privacy link */}
            <div className="mt-3 text-center">
              <Link
                to="/privacy"
                className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors group"
              >
                <span>{t('cookieConsent.learnMore')}</span>
                <span className={`transition-transform group-hover:translate-x-0.5 ${isRTL ? 'rotate-180 group-hover:-translate-x-0.5' : ''}`}>→</span>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CookieConsent;
