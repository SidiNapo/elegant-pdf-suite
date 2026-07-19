import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ShieldAlert, FileWarning, Mail, ListChecks } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';

// DMCA / copyright notice page.
// This page describes the process for submitting a copyright takedown notice.
// It intentionally does NOT invent a legal entity, address, or DMCA agent
// contact — the site owner should complete those fields before publishing the
// page publicly.
const COPY = {
  fr: {
    title: 'Politique DMCA & droits d\'auteur — E-Pdf\'s',
    description:
      "Procédure de notification pour signaler un contenu qui violerait vos droits d'auteur sur E-Pdf's.",
    heading: 'Politique DMCA & droits d\'auteur',
    intro:
      "E-Pdf's respecte les droits d'auteur. Si vous estimez qu'un contenu publié sur ce site (par exemple un article de blog) reproduit sans autorisation une œuvre dont vous êtes titulaire des droits, vous pouvez nous adresser une notification. Nos outils PDF s'exécutent dans le navigateur du visiteur : nous ne stockons ni ne partageons les fichiers traités.",
    scopeTitle: 'Champ d\'application',
    scope:
      "Cette procédure concerne les contenus publiés directement sur e-pdfs.com (articles, illustrations, textes). Elle ne concerne pas les fichiers PDF que les visiteurs traitent avec nos outils, ceux-ci n'étant ni téléversés ni conservés sur nos serveurs.",
    requiredTitle: 'Éléments à inclure dans votre notification',
    required: [
      "Vos coordonnées complètes (nom, adresse email de contact).",
      "Identification précise de l'œuvre protégée dont vous revendiquez les droits.",
      "URL(s) exacte(s) du contenu litigieux sur e-pdfs.com.",
      "Déclaration de bonne foi indiquant que l'utilisation contestée n'est pas autorisée par le titulaire des droits, son représentant, ou la loi.",
      "Déclaration, sous peine de parjure, que les informations fournies sont exactes et que vous êtes le titulaire des droits ou autorisé à agir en son nom.",
      "Votre signature (électronique ou manuscrite).",
    ],
    processTitle: 'Traitement de votre demande',
    process:
      "Après réception d'une notification complète et de bonne foi, nous nous efforçons de retirer ou rendre inaccessible le contenu concerné dans un délai raisonnable, et d'en informer, le cas échéant, l'auteur de la publication. Les notifications abusives ou frauduleuses peuvent engager la responsabilité de leur auteur.",
    counterTitle: 'Contre-notification',
    counter:
      "Si vous êtes l'auteur d'un contenu retiré et estimez le retrait injustifié, vous pouvez nous adresser une contre-notification comportant vos coordonnées, l'URL concernée, et une déclaration de bonne foi expliquant les raisons du désaccord.",
    contactTitle: 'Comment nous joindre',
    contactBody:
      "Envoyez votre notification via notre",
    contactLink: 'page de contact',
    contactSuffix:
      " en indiquant clairement « Notification DMCA » dans l'objet du message. Nous accuserons réception dans les plus brefs délais.",
    updated: 'Dernière mise à jour :',
  },
  en: {
    title: 'DMCA & copyright policy — E-Pdf\'s',
    description:
      "How to report content on E-Pdf's that you believe infringes your copyright.",
    heading: 'DMCA & copyright policy',
    intro:
      "E-Pdf's respects copyright. If you believe that content published on this site (for example a blog article) reproduces without authorization a work you own, you may send us a notice. Our PDF tools run in the visitor's browser: we do not store or share the files that are processed.",
    scopeTitle: 'Scope',
    scope:
      "This procedure covers content published directly on e-pdfs.com (articles, illustrations, text). It does not cover PDF files that visitors process with our tools, since those files are never uploaded to or stored on our servers.",
    requiredTitle: 'What to include in your notice',
    required: [
      'Your full contact information (name, contact email address).',
      'A precise identification of the copyrighted work you claim has been infringed.',
      'The exact URL(s) of the allegedly infringing content on e-pdfs.com.',
      'A good-faith statement that the disputed use is not authorized by the copyright owner, its agent, or the law.',
      'A statement, made under penalty of perjury, that the information you provide is accurate and that you are the copyright owner or authorized to act on their behalf.',
      'Your electronic or physical signature.',
    ],
    processTitle: 'How we handle your request',
    process:
      "Upon receipt of a complete, good-faith notice, we will make reasonable efforts to remove or disable access to the affected content within a reasonable time and, where applicable, notify the person who posted it. Fraudulent or abusive notices may expose their sender to liability.",
    counterTitle: 'Counter-notice',
    counter:
      "If you are the author of removed content and believe the removal was mistaken, you may send us a counter-notice including your contact information, the affected URL, and a good-faith statement explaining the reasons for disagreement.",
    contactTitle: 'How to reach us',
    contactBody: 'Send your notice via our',
    contactLink: 'contact page',
    contactSuffix:
      ' with "DMCA Notice" clearly indicated in the subject line. We will acknowledge receipt as soon as possible.',
    updated: 'Last updated:',
  },
} as const;

const DMCA = () => {
  const { i18n } = useTranslation();
  const lang = (i18n.language?.startsWith('en') ? 'en' : 'fr') as 'fr' | 'en';
  const c = COPY[lang];

  return (
    <>
      <SEOHead
        title={c.title}
        description={c.description}
        canonicalUrl="/dmca"
      />
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <section className="container mx-auto px-4 py-16 max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-center mb-10"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-amber-500 mb-4 shadow-lg shadow-primary/30">
                <ShieldAlert className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">{c.heading}</h1>
              <p className="mt-3 text-muted-foreground">{c.intro}</p>
              <p className="mt-2 text-xs text-muted-foreground">{c.updated} 2026-07-19</p>
            </motion.div>

            <article className="rounded-2xl border border-border bg-card p-5 mb-4">
              <div className="flex items-start gap-3">
                <FileWarning className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-lg font-semibold text-foreground">{c.scopeTitle}</h2>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{c.scope}</p>
                </div>
              </div>
            </article>

            <article className="rounded-2xl border border-border bg-card p-5 mb-4">
              <div className="flex items-start gap-3">
                <ListChecks className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div className="w-full">
                  <h2 className="text-lg font-semibold text-foreground">{c.requiredTitle}</h2>
                  <ul className="mt-2 space-y-2 text-sm text-muted-foreground list-disc pl-5">
                    {c.required.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>

            <article className="rounded-2xl border border-border bg-card p-5 mb-4">
              <h2 className="text-lg font-semibold text-foreground">{c.processTitle}</h2>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{c.process}</p>
            </article>

            <article className="rounded-2xl border border-border bg-card p-5 mb-4">
              <h2 className="text-lg font-semibold text-foreground">{c.counterTitle}</h2>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{c.counter}</p>
            </article>

            <article className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-lg font-semibold text-foreground">{c.contactTitle}</h2>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    {c.contactBody}{' '}
                    <Link to="/contact" className="text-primary hover:underline">
                      {c.contactLink}
                    </Link>
                    {c.contactSuffix}
                  </p>
                </div>
              </div>
            </article>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default DMCA;
