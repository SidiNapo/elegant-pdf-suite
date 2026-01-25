import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Cookie, X, Shield, ChevronDown, ChevronUp, Sparkles, BarChart3, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

const CONSENT_KEY = 'epdfs_cookie_consent';

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  advertising: boolean;
}

const CookieConsent = () => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: true,
    advertising: true,
  });
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();

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

  const animationProps = prefersReducedMotion 
    ? { initial: {}, animate: {}, exit: {} }
    : {
        initial: { y: 100, opacity: 0, scale: 0.95 },
        animate: { y: 0, opacity: 1, scale: 1 },
        exit: { y: 100, opacity: 0, scale: 0.95 },
      };

  const cookieOptions = [
    {
      id: 'essential',
      icon: Shield,
      iconColor: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      switchColor: 'data-[state=checked]:bg-emerald-500',
      label: t('cookieConsent.essential'),
      desc: t('cookieConsent.essentialDesc'),
      checked: true,
      disabled: true,
      onChange: () => {},
    },
    {
      id: 'analytics',
      icon: BarChart3,
      iconColor: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
      switchColor: 'data-[state=checked]:bg-amber-500',
      label: t('cookieConsent.analytics'),
      desc: t('cookieConsent.analyticsDesc'),
      checked: preferences.analytics,
      disabled: false,
      onChange: (checked: boolean) => setPreferences(p => ({ ...p, analytics: checked })),
    },
    {
      id: 'advertising',
      icon: Megaphone,
      iconColor: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      switchColor: 'data-[state=checked]:bg-blue-500',
      label: t('cookieConsent.advertising'),
      desc: t('cookieConsent.advertisingDesc'),
      checked: preferences.advertising,
      disabled: false,
      onChange: (checked: boolean) => setPreferences(p => ({ ...p, advertising: checked })),
    },
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop for mobile */}
          {isMobile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={handleDecline}
            />
          )}
          
          <motion.div
            {...animationProps}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4 md:p-6"
            style={{ willChange: 'transform, opacity' }}
          >
            <div className="max-w-lg mx-auto">
              {/* Main container */}
              <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-gradient-to-b from-card/98 to-card shadow-[0_-20px_60px_-15px_rgba(236,72,153,0.15)]">
                
                {/* Animated gradient border top */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary via-rose-500 to-violet-500 animate-[shimmer_3s_ease-in-out_infinite]" 
                  style={{ backgroundSize: '200% 100%' }} 
                />
                
                {/* Glow effects */}
                <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />
                
                <div className="relative p-4 sm:p-6">
                  {/* Close button */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleDecline}
                    className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors z-10"
                    aria-label={t('cookieConsent.close')}
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </motion.button>

                  {/* Header */}
                  <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-5 pr-10">
                    {/* Animated cookie icon */}
                    <motion.div 
                      className="relative shrink-0"
                      animate={prefersReducedMotion ? {} : { rotate: [0, -10, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    >
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-primary via-rose-500 to-violet-500 flex items-center justify-center shadow-lg shadow-primary/30">
                        <Cookie className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                      </div>
                      <motion.div 
                        className="absolute -top-1 -right-1"
                        animate={prefersReducedMotion ? {} : { scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <Sparkles className="w-4 h-4 text-amber-400" />
                      </motion.div>
                    </motion.div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold text-foreground mb-1">
                        {t('cookieConsent.title')}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {t('cookieConsent.description')}
                      </p>
                    </div>
                  </div>

                  {/* Expandable Cookie Options */}
                  <AnimatePresence>
                    {(!isMobile || isExpanded) && (
                      <motion.div
                        initial={isMobile ? { height: 0, opacity: 0 } : false}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-5">
                          {cookieOptions.map((option, index) => (
                            <motion.div
                              key={option.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className={`flex items-center justify-between p-3 sm:p-4 rounded-xl ${option.bgColor} border ${option.borderColor} backdrop-blur-sm transition-all hover:border-white/20`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${option.bgColor} flex items-center justify-center`}>
                                  <option.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${option.iconColor}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm sm:text-base font-semibold text-foreground">{option.label}</p>
                                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">{option.desc}</p>
                                </div>
                              </div>
                              <Switch
                                checked={option.checked}
                                disabled={option.disabled}
                                onCheckedChange={option.onChange}
                                className={`ml-3 shrink-0 ${option.switchColor}`}
                              />
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Mobile: Customize toggle */}
                  {isMobile && (
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="w-full flex items-center justify-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors mb-4 py-2 rounded-xl bg-primary/5 border border-primary/20"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-4 h-4" />
                          <span className="font-medium">{t('cookieConsent.close')}</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          <span className="font-medium">{t('cookieConsent.customize', 'Customize preferences')}</span>
                        </>
                      )}
                    </motion.button>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-stretch gap-2 sm:gap-3">
                    <Button
                      onClick={handleDecline}
                      variant="outline"
                      className="flex-1 h-11 sm:h-12 text-sm sm:text-base font-semibold border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-sm transition-all"
                    >
                      {t('cookieConsent.essentialOnly')}
                    </Button>
                    <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={handleAccept}
                        className="w-full h-11 sm:h-12 text-sm sm:text-base font-semibold bg-gradient-to-r from-primary via-rose-500 to-violet-500 hover:opacity-90 text-white shadow-xl shadow-primary/30 transition-all"
                      >
                        {t('cookieConsent.acceptAll')}
                      </Button>
                    </motion.div>
                  </div>

                  {/* Learn more link */}
                  <div className="mt-4 text-center">
                    <Link
                      to="/privacy"
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors group"
                    >
                      <span>{t('cookieConsent.learnMore')}</span>
                      <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
