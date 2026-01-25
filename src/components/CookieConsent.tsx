import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X, Shield, BarChart3, Megaphone } from 'lucide-react';
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
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      label: t('cookieConsent.essential'),
      checked: true,
      disabled: true,
      onChange: () => {},
    },
    {
      id: 'analytics',
      icon: BarChart3,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      label: t('cookieConsent.analytics'),
      checked: preferences.analytics,
      disabled: false,
      onChange: (checked: boolean) => setPreferences(p => ({ ...p, analytics: checked })),
    },
    {
      id: 'advertising',
      icon: Megaphone,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
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
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-4 inset-x-4 z-50 sm:bottom-6 sm:left-auto sm:right-6 sm:max-w-sm"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-card/95 backdrop-blur-xl shadow-2xl shadow-black/20">
          {/* Gradient accent */}
          <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-primary via-rose-500 to-violet-500" />
          
          <div className="p-4">
            {/* Close button */}
            <button
              onClick={handleDecline}
              className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'} p-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors`}
              aria-label={t('cookieConsent.close')}
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>

            {/* Header - Compact */}
            <div className={`flex items-center gap-3 mb-3 ${isRTL ? 'pl-8' : 'pr-8'}`}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-rose-500 flex items-center justify-center shrink-0">
                <Cookie className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  {t('cookieConsent.title')}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {t('cookieConsent.description')}
                </p>
              </div>
            </div>

            {/* Cookie Options - Collapsible compact list */}
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-2 mb-3 pt-1">
                    {cookieOptions.map((option) => (
                      <div
                        key={option.id}
                        className={`flex items-center justify-between p-2.5 rounded-xl ${option.bg} border border-white/5`}
                      >
                        <div className="flex items-center gap-2.5">
                          <option.icon className={`w-4 h-4 ${option.color}`} />
                          <span className="text-sm font-medium text-foreground">{option.label}</span>
                        </div>
                        <Switch
                          checked={option.checked}
                          disabled={option.disabled}
                          onCheckedChange={option.onChange}
                          className="scale-90"
                        />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Toggle details */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full text-xs text-primary hover:text-primary/80 transition-colors mb-3 py-1"
            >
              {showDetails ? t('cookieConsent.close') : t('cookieConsent.customize', 'Customize')}
            </button>

            {/* Buttons - Stacked compact */}
            <div className="flex gap-2">
              <Button
                onClick={handleDecline}
                variant="outline"
                size="sm"
                className="flex-1 h-9 text-xs font-medium border-white/10 bg-white/5 hover:bg-white/10"
              >
                {t('cookieConsent.essentialOnly')}
              </Button>
              <Button
                onClick={handleAccept}
                size="sm"
                className="flex-1 h-9 text-xs font-medium bg-gradient-to-r from-primary to-rose-500 hover:opacity-90 text-white"
              >
                {t('cookieConsent.acceptAll')}
              </Button>
            </div>

            {/* Privacy link */}
            <div className="mt-2.5 text-center">
              <Link
                to="/privacy"
                className="text-[10px] text-muted-foreground hover:text-primary transition-colors"
              >
                {t('cookieConsent.learnMore')}
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CookieConsent;
