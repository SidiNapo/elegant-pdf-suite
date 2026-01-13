import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X, Shield, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const CONSENT_KEY = 'epdfs_cookie_consent';

const CookieConsent = () => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      // Show consent banner after a short delay
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ accepted: true, timestamp: Date.now() }));
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ accepted: false, timestamp: Date.now() }));
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
        >
          <div className="max-w-4xl mx-auto">
            <div className="bg-card border border-border rounded-2xl shadow-2xl p-6 md:p-8 relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/5 rounded-full blur-2xl" />
              
              {/* Close button */}
              <button
                onClick={handleDecline}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
                aria-label={t('cookieConsent.close')}
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>

              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Cookie className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-1">
                      {t('cookieConsent.title')}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {t('cookieConsent.description')}
                    </p>
                  </div>
                </div>

                {/* Cookie types */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Shield className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{t('cookieConsent.essential')}</p>
                      <p className="text-xs text-muted-foreground">{t('cookieConsent.essentialDesc')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Cookie className="w-5 h-5 text-amber-500" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{t('cookieConsent.analytics')}</p>
                      <p className="text-xs text-muted-foreground">{t('cookieConsent.analyticsDesc')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <ExternalLink className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{t('cookieConsent.advertising')}</p>
                      <p className="text-xs text-muted-foreground">{t('cookieConsent.advertisingDesc')}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <Button
                    onClick={handleAccept}
                    className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground px-8"
                  >
                    {t('cookieConsent.acceptAll')}
                  </Button>
                  <Button
                    onClick={handleDecline}
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    {t('cookieConsent.essentialOnly')}
                  </Button>
                  <Link
                    to="/privacy"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    {t('cookieConsent.learnMore')}
                    <ExternalLink className="w-3 h-3" />
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
