import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Cookie, X, Shield, ChevronDown, ChevronUp, Sparkles, BarChart3, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: true,
    advertising: true,
  });
  const isMobile = useIsMobile();
  const isRTL = useIsRTL();
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
        initial: { y: 100, opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: 100, opacity: 0 },
      };

  const cookieOptions = [
    {
      id: 'essential',
      icon: Shield,
      iconColor: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
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
      borderColor: 'border-amber-500/30',
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
      borderColor: 'border-blue-500/30',
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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
            onClick={handleDecline}
          />
          
          <motion.div
            {...animationProps}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6"
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <div className="max-w-md mx-auto">
              {/* Main container */}
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-card/95 backdrop-blur-xl shadow-2xl">
                
                {/* Gradient border top */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-rose-500 to-violet-500" />
                
                {/* Content */}
                <div className="p-5 sm:p-6">
                  
                  {/* Close button */}
                  <button
                    onClick={handleDecline}
                    className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors`}
                    aria-label={t('cookieConsent.close')}
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>

                  {/* Header */}
                  <div className={`flex items-start gap-4 mb-5 ${isRTL ? 'pl-10' : 'pr-10'}`}>
                    <motion.div 
                      className="shrink-0"
                      animate={prefersReducedMotion ? {} : { rotate: [0, -8, 8, -8, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
                    >
                      <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-primary via-rose-500 to-violet-500 flex items-center justify-center shadow-lg shadow-primary/25">
                        <Cookie className="w-7 h-7 text-white" />
                        <motion.div 
                          className={`absolute -top-1 ${isRTL ? '-left-1' : '-right-1'}`}
                          animate={prefersReducedMotion ? {} : { scale: [1, 1.3, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <Sparkles className="w-4 h-4 text-amber-400" />
                        </motion.div>
                      </div>
                    </motion.div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-foreground mb-1.5">
                        {t('cookieConsent.title')}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {t('cookieConsent.description')}
                      </p>
                    </div>
                  </div>

                  {/* Cookie Options - Always visible, cleaner layout */}
                  <AnimatePresence>
                    {(!isMobile || isExpanded) && (
                      <motion.div
                        initial={isMobile ? { height: 0, opacity: 0 } : false}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-3 mb-5">
                          {cookieOptions.map((option, index) => (
                            <motion.div
                              key={option.id}
                              initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.08 }}
                              className={`flex items-center gap-3 p-3.5 rounded-2xl ${option.bgColor} border ${option.borderColor} transition-all`}
                            >
                              {/* Icon */}
                              <div className={`shrink-0 w-10 h-10 rounded-xl ${option.bgColor} border ${option.borderColor} flex items-center justify-center`}>
                                <option.icon className={`w-5 h-5 ${option.iconColor}`} />
                              </div>
                              
                              {/* Text */}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-foreground">{option.label}</p>
                                <p className="text-xs text-muted-foreground truncate">{option.desc}</p>
                              </div>
                              
                              {/* Switch */}
                              <Switch
                                checked={option.checked}
                                disabled={option.disabled}
                                onCheckedChange={option.onChange}
                                className={`shrink-0 ${option.switchColor}`}
                              />
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Mobile: Expand toggle */}
                  {isMobile && (
                    <button
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="w-full flex items-center justify-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors mb-4 py-2.5 rounded-xl bg-primary/5 border border-primary/20"
                    >
                      {isExpanded ? (
                        <>
                          <span className="font-medium">{t('cookieConsent.close')}</span>
                          <ChevronUp className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          <span className="font-medium">{t('cookieConsent.customize', 'Customize')}</span>
                          <ChevronDown className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3">
                    <Button
                      onClick={handleAccept}
                      className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary via-rose-500 to-violet-500 hover:opacity-90 text-white shadow-lg shadow-primary/25"
                    >
                      {t('cookieConsent.acceptAll')}
                    </Button>
                    <Button
                      onClick={handleDecline}
                      variant="outline"
                      className="w-full h-12 text-base font-medium border-white/10 bg-white/5 hover:bg-white/10"
                    >
                      {t('cookieConsent.essentialOnly')}
                    </Button>
                  </div>

                  {/* Learn more link */}
                  <div className="mt-4 text-center">
                    <Link
                      to="/privacy"
                      className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      <span>{t('cookieConsent.learnMore')}</span>
                      <span className={isRTL ? 'rotate-180' : ''}>→</span>
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
