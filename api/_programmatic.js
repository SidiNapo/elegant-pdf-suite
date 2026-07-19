// SINGLE SOURCE OF TRUTH for programmatic landing pages.
// Consumed by:
//   - api/render.js       (server-rendered snapshot for /p/:slug)
//   - api/sitemap.js      (sitemap entries)
//   - src/data/programmaticPages.ts (client React pages + link lists)
// Add/edit a page here and it appears everywhere. Plain ESM, no TS, so
// Vercel serverless functions can import it without a build step.

/** @typedef {{ metaTitle:string, metaDescription:string, keywords:string, h1:string, intro:string, paragraphs:string[], steps:string[], ctaLabel:string }} ProgLang */
/** @typedef {{ slug:string, toolPath:string, fr:ProgLang, en:ProgLang }} ProgPage */

/** @type {ProgPage[]} */
export const programmaticPages = [
  {
    slug: "compresser-pdf-pour-gmail",
    toolPath: "/compress",
    fr: {
      metaTitle: "Compresser un PDF pour Gmail (réduire la taille) | E-Pdf's",
      metaDescription:
        "Réduisez votre PDF pour l'envoyer par Gmail sans dépasser la limite de 25 Mo. Gratuit, 100 % local, sans téléversement.",
      keywords: "compresser pdf pour gmail, réduire pdf email, pdf trop volumineux gmail",
      h1: "Compresser un PDF pour l'envoyer par Gmail",
      intro:
        "Gmail limite les pièces jointes à 25 Mo. Réduisez la taille de votre PDF en quelques secondes, directement dans votre navigateur, sans téléverser vos fichiers nulle part.",
      paragraphs: [
        "Un PDF trop lourd est l'une des raisons les plus fréquentes d'échec d'envoi par email. Notre compresseur allège votre fichier tout en gardant un texte net et lisible.",
        "Tout se passe localement sur votre appareil : vos documents ne quittent jamais votre navigateur, ce qui en fait la solution la plus sûre pour des fichiers confidentiels.",
      ],
      steps: [
        "Importez votre PDF dans l'outil de compression.",
        "Lancez la compression et patientez quelques secondes.",
        "Téléchargez la version allégée, prête pour Gmail.",
      ],
      ctaLabel: "Compresser mon PDF",
    },
    en: {
      metaTitle: "Compress a PDF for Gmail (reduce size) | E-Pdf's",
      metaDescription:
        "Shrink your PDF to email it via Gmail without exceeding the 25 MB limit. Free, 100% local, no upload.",
      keywords: "compress pdf for gmail, reduce pdf email, pdf too big gmail",
      h1: "Compress a PDF to send it via Gmail",
      intro:
        "Gmail caps attachments at 25 MB. Reduce your PDF size in seconds, right in your browser, without uploading your files anywhere.",
      paragraphs: [
        "An oversized PDF is one of the most common reasons emails fail to send. Our compressor lightens your file while keeping text crisp and readable.",
        "Everything happens locally on your device: your documents never leave your browser, making it the safest option for confidential files.",
      ],
      steps: [
        "Upload your PDF into the compression tool.",
        "Run the compression and wait a few seconds.",
        "Download the lighter version, ready for Gmail.",
      ],
      ctaLabel: "Compress my PDF",
    },
  },
  {
    slug: "reduire-pdf-a-200ko",
    toolPath: "/compress",
    fr: {
      metaTitle: "Réduire un PDF à 200 Ko en ligne gratuit | E-Pdf's",
      metaDescription:
        "Compressez votre PDF jusqu'à environ 200 Ko pour les formulaires en ligne. Gratuit, 100 % local, sans téléversement.",
      keywords: "réduire pdf 200ko, compresser pdf 200 ko, pdf 200kb formulaire",
      h1: "Réduire un PDF à environ 200 Ko",
      intro:
        "De nombreux portails administratifs exigent des PDF légers. Réduisez votre fichier pour respecter ces limites strictes, sans installation.",
      paragraphs: [
        "Les sites de candidature, de visa ou d'inscription imposent souvent une taille maximale. Notre outil compresse efficacement vos documents pour passer ces contrôles.",
        "La compression est réalisée dans votre navigateur, vos fichiers restent privés et ne sont jamais envoyés sur un serveur.",
      ],
      steps: [
        "Importez votre PDF.",
        "Compressez le fichier.",
        "Téléchargez la version réduite et vérifiez la taille obtenue.",
      ],
      ctaLabel: "Réduire mon PDF",
    },
    en: {
      metaTitle: "Reduce a PDF to 200 KB online free | E-Pdf's",
      metaDescription:
        "Compress your PDF down to around 200 KB for online forms. Free, 100% local, no upload.",
      keywords: "reduce pdf to 200kb, compress pdf 200 kb, pdf 200kb form",
      h1: "Reduce a PDF to around 200 KB",
      intro:
        "Many government portals require lightweight PDFs. Shrink your file to meet these strict limits, with no installation.",
      paragraphs: [
        "Application, visa or registration sites often enforce a maximum size. Our tool compresses your documents effectively so they pass these checks.",
        "Compression runs in your browser, your files stay private and are never sent to a server.",
      ],
      steps: [
        "Upload your PDF.",
        "Compress the file.",
        "Download the reduced version and check the resulting size.",
      ],
      ctaLabel: "Reduce my PDF",
    },
  },
  {
    slug: "png-en-pdf",
    toolPath: "/jpg-to-pdf",
    fr: {
      metaTitle: "Convertir PNG en PDF gratuit en ligne | E-Pdf's",
      metaDescription:
        "Transformez vos images PNG en PDF gratuitement. 100 % local dans le navigateur, sans téléversement ni filigrane.",
      keywords: "png en pdf, convertir png pdf, image png en pdf gratuit",
      h1: "Convertir une image PNG en PDF",
      intro:
        "Réunissez une ou plusieurs images PNG dans un PDF propre, idéal pour partager des captures d'écran ou des documents numérisés.",
      paragraphs: [
        "Les fichiers PNG sont parfaits pour les captures, mais peu pratiques à partager en lot. Convertissez-les en un seul PDF organisé.",
        "La conversion se fait sur votre appareil : aucune image n'est téléversée, votre confidentialité est totale.",
      ],
      steps: [
        "Importez vos images PNG.",
        "Réorganisez-les dans l'ordre voulu.",
        "Générez et téléchargez votre PDF.",
      ],
      ctaLabel: "Convertir PNG en PDF",
    },
    en: {
      metaTitle: "Convert PNG to PDF free online | E-Pdf's",
      metaDescription:
        "Turn your PNG images into PDF for free. 100% local in-browser, no upload, no watermark.",
      keywords: "png to pdf, convert png pdf, png image to pdf free",
      h1: "Convert a PNG image to PDF",
      intro:
        "Combine one or more PNG images into a clean PDF, ideal for sharing screenshots or scanned documents.",
      paragraphs: [
        "PNG files are great for screenshots but awkward to share in bulk. Convert them into a single, organized PDF.",
        "Conversion runs on your device: no image is uploaded, your privacy is complete.",
      ],
      steps: [
        "Upload your PNG images.",
        "Reorder them as you like.",
        "Generate and download your PDF.",
      ],
      ctaLabel: "Convert PNG to PDF",
    },
  },
  {
    slug: "fusionner-pdf-sans-telechargement",
    toolPath: "/merge",
    fr: {
      metaTitle: "Fusionner PDF sans téléversement (100 % sécurisé) | E-Pdf's",
      metaDescription:
        "Combinez vos PDF sans les envoyer sur un serveur. Traitement 100 % local dans le navigateur, idéal pour documents confidentiels.",
      keywords: "fusionner pdf sans téléversement, fusion pdf sécurisé, merge pdf no upload",
      h1: "Fusionner des PDF sans téléversement sur un serveur",
      intro:
        "Pour les documents sensibles, le plus sûr est de ne jamais les envoyer en ligne. Notre outil fusionne vos PDF entièrement dans votre navigateur.",
      paragraphs: [
        "Contrairement aux services qui téléversent vos fichiers vers le cloud, E-Pdf's effectue tout le traitement localement. Vos données ne quittent jamais votre ordinateur.",
        "C'est l'option idéale pour les services RH, juridiques et financiers qui manipulent des documents confidentiels.",
      ],
      steps: [
        "Importez vos fichiers PDF.",
        "Organisez l'ordre des documents.",
        "Fusionnez et téléchargez, sans aucun envoi serveur.",
      ],
      ctaLabel: "Fusionner en sécurité",
    },
    en: {
      metaTitle: "Merge PDF Without Upload (100% Secure) | E-Pdf's",
      metaDescription:
        "Combine your PDFs without sending them to a server. 100% local in-browser processing, ideal for confidential documents.",
      keywords: "merge pdf no upload, secure pdf merge, combine pdf without upload",
      h1: "Merge PDFs without uploading to a server",
      intro:
        "For sensitive documents, the safest path is never sending them online. Our tool merges your PDFs entirely inside your browser.",
      paragraphs: [
        "Unlike services that upload your files to the cloud, E-Pdf's does all processing locally. Your data never leaves your computer.",
        "It is the ideal option for HR, legal and finance teams handling confidential documents.",
      ],
      steps: [
        "Upload your PDF files.",
        "Arrange the document order.",
        "Merge and download, with zero server upload.",
      ],
      ctaLabel: "Merge securely",
    },
  },
];

/** Flattened FR view used by the SSR renderer (one entry per page). */
export const PROGRAMMATIC_PAGES = programmaticPages.map((p) => ({
  slug: p.slug,
  toolPath: p.toolPath,
  metaTitle: p.fr.metaTitle,
  metaDescription: p.fr.metaDescription,
  keywords: p.fr.keywords,
  h1: p.fr.h1,
  intro: p.fr.intro,
  paragraphs: p.fr.paragraphs,
  steps: p.fr.steps,
  ctaLabel: p.fr.ctaLabel,
}));

export function getProgrammaticPage(slug) {
  return programmaticPages.find((p) => p.slug === slug);
}
