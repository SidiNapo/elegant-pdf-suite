import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Cookie, X, Shield, ChevronDown, ChevronUp } from 'lucide-react';
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
        initial: { y: 100, opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: 100, opacity: 0 },
      };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          {...animationProps}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4 md:p-6"
          style={{ willChange: 'transform, opacity' }}
        >
          <div className="max-w-2xl mx-auto">
            {/* Main container with glassmorphism */}
            <div className="relative bg-card/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
              {/* Gradient accent line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-rose-500 to-primary" />
              
              {/* Background decorations */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="relative p-4 sm:p-5 md:p-6">
                {/* Close button */}
                <button
                  onClick={handleDecline}
                  className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-muted/50 transition-colors z-10"
                  aria-label={t('cookieConsent.close')}
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>

                {/* Header */}
                <div className="flex items-start gap-3 mb-4 pr-8">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-primary to-rose-500 flex items-center justify-center shrink-0 shadow-lg">
                    <Cookie className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-foreground mb-0.5">
                      {t('cookieConsent.title')}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2">
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
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-2 mb-4">
                        {/* Essential Cookies */}
                        <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-muted/30 border border-white/5">
                          <div className="flex items-center gap-2.5">
                            <Shield className="w-4 h-4 text-emerald-500" />
                            <div>
                              <p className="text-sm font-medium text-foreground">{t('cookieConsent.essential')}</p>
                              <p className="text-xs text-muted-foreground">{t('cookieConsent.essentialDesc')}</p>
                            </div>
                          </div>
                          <Switch checked={true} disabled className="data-[state=checked]:bg-emerald-500" />
                        </div>

                        {/* Analytics Cookies */}
                        <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-muted/30 border border-white/5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-4 h-4 rounded-full bg-amber-500/20 flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-amber-500" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{t('cookieConsent.analytics')}</p>
                              <p className="text-xs text-muted-foreground">{t('cookieConsent.analyticsDesc')}</p>
                            </div>
                          </div>
                          <Switch
                            checked={preferences.analytics}
                            onCheckedChange={(checked) => setPreferences(p => ({ ...p, analytics: checked }))}
                            className="data-[state=checked]:bg-amber-500"
                          />
                        </div>

                        {/* Advertising Cookies */}
                        <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-muted/30 border border-white/5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-blue-500" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{t('cookieConsent.advertising')}</p>
                              <p className="text-xs text-muted-foreground">{t('cookieConsent.advertisingDesc')}</p>
                            </div>
                          </div>
                          <Switch
                            checked={preferences.advertising}
                            onCheckedChange={(checked) => setPreferences(p => ({ ...p, advertising: checked }))}
                            className="data-[state=checked]:bg-blue-500"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Mobile: Customize toggle */}
                {isMobile && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full flex items-center justify-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors mb-3 py-1"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="w-3.5 h-3.5" />
                        <span>{t('cookieConsent.close')}</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3.5 h-3.5" />
                        <span>{t('cookieConsent.customize', 'Customize preferences')}</span>
                      </>
                    )}
                  </button>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                  <Button
                    onClick={handleDecline}
                    variant="outline"
                    size="sm"
                    className="flex-1 h-9 sm:h-10 text-xs sm:text-sm border-white/10 hover:bg-muted/50"
                  >
                    {t('cookieConsent.essentialOnly')}
                  </Button>
                  <Button
                    onClick={handleAccept}
                    size="sm"
                    className="flex-1 h-9 sm:h-10 text-xs sm:text-sm bg-gradient-to-r from-primary to-rose-500 hover:from-primary/90 hover:to-rose-500/90 text-white shadow-lg shadow-primary/25"
                  >
                    {t('cookieConsent.acceptAll')}
                  </Button>
                </div>

                {/* Learn more link */}
                <div className="mt-3 text-center">
                  <Link
                    to="/privacy"
                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    {t('cookieConsent.learnMore')} →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
