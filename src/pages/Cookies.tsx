import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Cookie, Shield, BarChart3, Megaphone, Settings2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { getConsent, declineAll, acceptAll } from '@/lib/consent';

// Cookies policy — accurate, generic wording. No invented company details.
// Copy describes ONLY what this site actually loads today: essential storage
// (consent, language, session) and optional analytics/advertising that stay
// off until the user explicitly accepts them.
const COPY = {
  fr: {
    title: 'Politique de cookies — E-Pdf\'s',
    description:
      "Comment E-Pdf's utilise les cookies et le stockage local, et comment gérer vos préférences.",
    heading: 'Politique de cookies',
    intro:
      "Cette page explique quels cookies et technologies de stockage local nous utilisons, dans quel but, et comment vous pouvez modifier votre consentement à tout moment.",
    updated: 'Dernière mise à jour :',
    sections: [
      {
        icon: Shield,
        title: 'Cookies essentiels',
        body:
          "Requis pour le fonctionnement du site : mémorisation de vos préférences de langue, de votre choix de consentement aux cookies, et du bon fonctionnement des formulaires. Ces cookies sont toujours actifs et ne peuvent pas être désactivés depuis la bannière.",
      },
      {
        icon: BarChart3,
        title: 'Cookies d\'analyse',
        body:
          "Désactivés par défaut. Ne sont chargés qu'après votre consentement explicite. Ils nous aident à comprendre quelles pages sont consultées afin d'améliorer le service. Aucun outil d'analyse tiers n'est actuellement chargé tant que vous n'avez pas accepté.",
      },
      {
        icon: Megaphone,
        title: 'Cookies publicitaires',
        body:
          "Désactivés par défaut. Ne sont chargés qu'après votre consentement explicite ET une fois que nos identifiants publicitaires de production sont configurés. Tant que ces deux conditions ne sont pas réunies, aucune publicité ni cookie publicitaire n'est diffusé sur le site.",
      },
      {
        icon: Settings2,
        title: 'Gérer votre consentement',
        body:
          "Vous pouvez à tout moment ré-ouvrir la bannière de consentement en cliquant sur le bouton ci-dessous, ou effacer les données du site depuis les réglages de votre navigateur.",
      },
    ],
    contactPrefix: 'Une question sur cette politique ? Contactez-nous via la',
    contactLink: 'page de contact',
    reset: 'Réinitialiser mes préférences',
    accept: 'Tout accepter',
    decline: 'Refuser (essentiels uniquement)',
  },
  en: {
    title: 'Cookie policy — E-Pdf\'s',
    description:
      "How E-Pdf's uses cookies and local storage, and how you can manage your preferences.",
    heading: 'Cookie policy',
    intro:
      'This page describes the cookies and local storage technologies we use, why we use them, and how you can change your consent at any time.',
    updated: 'Last updated:',
    sections: [
      {
        icon: Shield,
        title: 'Essential cookies',
        body:
          'Required for the site to function: remembering your language preference, your cookie consent choice, and keeping forms working. These are always on and cannot be disabled from the banner.',
      },
      {
        icon: BarChart3,
        title: 'Analytics cookies',
        body:
          "Off by default. Loaded only after your explicit consent. They help us understand which pages are visited so we can improve the service. No third-party analytics tool is loaded until you accept.",
      },
      {
        icon: Megaphone,
        title: 'Advertising cookies',
        body:
          "Off by default. Loaded only after your explicit consent AND once our production advertising IDs are configured. Until both conditions are met, no ads and no advertising cookies are served on the site.",
      },
      {
        icon: Settings2,
        title: 'Manage your consent',
        body:
          'You can re-open the consent banner at any time using the button below, or clear this site\'s data from your browser settings.',
      },
    ],
    contactPrefix: 'Have a question about this policy? Reach us via the',
    contactLink: 'contact page',
    reset: 'Reset my preferences',
    accept: 'Accept all',
    decline: 'Decline (essential only)',
  },
} as const;

const Cookies = () => {
  const { i18n } = useTranslation();
  const lang = (i18n.language?.startsWith('en') ? 'en' : 'fr') as 'fr' | 'en';
  const c = COPY[lang];
  const consent = getConsent();

  return (
    <>
      <SEOHead
        title={c.title}
        description={c.description}
        canonicalUrl="/cookies"
      />
      <div className="min-h-dvh bg-background">
        <Header />
        <main id="main-content">
          <section className="container mx-auto px-4 py-16 max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-center mb-10"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-rose-500 mb-4 shadow-lg shadow-primary/30">
                <Cookie className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">{c.heading}</h1>
              <p className="mt-3 text-muted-foreground">{c.intro}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {c.updated} 2026-07-19
              </p>
            </motion.div>

            <div className="grid gap-4">
              {c.sections.map((s) => (
                <article
                  key={s.title}
                  className="rounded-2xl border border-border bg-card p-5"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                      <s.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">{s.title}</h2>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                        {s.body}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-border bg-card p-5 space-y-4">
              <p className="text-sm text-muted-foreground">
                {c.contactPrefix}{' '}
                <Link to="/contact" className="text-primary hover:underline">
                  {c.contactLink}
                </Link>
                .
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => { declineAll(); window.location.reload(); }}>
                  {c.decline}
                </Button>
                <Button onClick={() => { acceptAll(); window.location.reload(); }}>
                  {c.accept}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {lang === 'fr' ? 'État actuel :' : 'Current state:'}{' '}
                <span className="font-mono">
                  analytics={String(consent.analytics)} · advertising={String(consent.advertising)}
                </span>
              </p>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Cookies;
