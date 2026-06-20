// Centralized bilingual (FR/EN) SEO content for every tool page.
// Keyed by the route pathname. Used by ToolLayout to render optimized
// <title>/meta, SoftwareApplication + FAQPage schema, on-page SEO copy and FAQs.
//
// Strategy: lead with the unique competitive angle — 100% local, in-browser
// processing (no server upload) — which the big DR90+ competitors (iLovePDF,
// Smallpdf) cannot always claim. Titles are laser-focused per URL and target
// long-tail, security-led intent.

export type Lang = 'fr' | 'en' | 'ar';

export interface FaqItem {
  q: string;
  a: string;
}

export interface ToolSeoLang {
  /** <title> — laser-focused, security-led, <60 chars when possible */
  metaTitle: string;
  /** meta description — <160 chars */
  metaDescription: string;
  keywords: string;
  /** H2 shown above the SEO copy block */
  seoHeading: string;
  /** 3-4 paragraphs of semantic body copy (300-500 words total) */
  paragraphs: string[];
  faqs: FaqItem[];
}

export interface ToolSeo {
  fr: ToolSeoLang;
  en: ToolSeoLang;
}

const SECURITY_FAQ_FR: FaqItem = {
  q: 'Mes fichiers sont-ils en sécurité ?',
  a: "Oui, à 100 %. Contrairement à la plupart des outils en ligne, E-PDF's traite vos fichiers directement dans votre navigateur (traitement local). Vos documents ne sont jamais téléversés sur un serveur, ne quittent jamais votre ordinateur et ne sont stockés nulle part.",
};
const SECURITY_FAQ_EN: FaqItem = {
  q: 'Are my files secure?',
  a: "Yes, 100%. Unlike most online tools, E-PDF's processes your files directly in your browser (local processing). Your documents are never uploaded to a server, never leave your device and are never stored anywhere.",
};
const FREE_FAQ_FR: FaqItem = {
  q: 'Cet outil est-il vraiment gratuit ?',
  a: "Oui, l'outil est entièrement gratuit, sans inscription, sans limite cachée et sans filigrane ajouté à vos fichiers.",
};
const FREE_FAQ_EN: FaqItem = {
  q: 'Is this tool really free?',
  a: 'Yes, the tool is completely free, with no sign-up, no hidden limits and no watermark added to your files.',
};
const NOINSTALL_FAQ_FR: FaqItem = {
  q: "Dois-je installer un logiciel ?",
  a: "Non. Tout fonctionne en ligne dans votre navigateur (Chrome, Edge, Firefox, Safari) sur Windows, Mac, Linux, Android et iOS. Aucune installation requise.",
};
const NOINSTALL_FAQ_EN: FaqItem = {
  q: 'Do I need to install software?',
  a: 'No. Everything runs online in your browser (Chrome, Edge, Firefox, Safari) on Windows, Mac, Linux, Android and iOS. No installation required.',
};

const commonFaqsFr = [SECURITY_FAQ_FR, FREE_FAQ_FR, NOINSTALL_FAQ_FR];
const commonFaqsEn = [SECURITY_FAQ_EN, FREE_FAQ_EN, NOINSTALL_FAQ_EN];

export const toolSeoData: Record<string, ToolSeo> = {
  '/merge': {
    fr: {
      metaTitle: 'Fusionner PDF en ligne gratuit et sécurisé | E-PDF\'s',
      metaDescription: 'Combinez plusieurs fichiers PDF en un seul, gratuitement. Traitement 100 % local : vos fichiers ne quittent jamais votre navigateur. Sans inscription.',
      keywords: 'fusionner pdf, combiner pdf, joindre pdf, fusionner pdf gratuit, fusion pdf sécurisé sans téléversement',
      seoHeading: 'Fusionner des fichiers PDF en ligne, gratuitement et en toute sécurité',
      paragraphs: [
        "Notre outil de fusion PDF vous permet de combiner plusieurs documents PDF en un seul fichier organisé, en quelques secondes. Glissez-déposez vos fichiers, réorganisez-les dans l'ordre souhaité, puis téléchargez le PDF fusionné. Idéal pour regrouper des factures, des contrats, des rapports ou des chapitres en un document unique.",
        "Ce qui distingue E-PDF's : la fusion s'effectue entièrement dans votre navigateur. Vos fichiers ne sont jamais envoyés vers un serveur distant, ce qui garantit une confidentialité totale — un avantage décisif pour les documents sensibles (RH, juridique, finance) face aux outils qui téléversent vos données.",
        "L'outil est compatible avec tous les appareils et navigateurs modernes, sans installation. Il n'y a aucune limite de nombre de fichiers cachée, aucun filigrane et aucune inscription. Vous gardez le contrôle total sur l'ordre des pages et le résultat final.",
        "Pour fusionner vos PDF : importez au moins deux fichiers, ajustez l'ordre par glisser-déposer, cliquez sur « Fusionner », puis téléchargez instantanément votre document combiné.",
      ],
      faqs: [
        { q: 'Combien de fichiers PDF puis-je fusionner ?', a: 'Vous pouvez fusionner de nombreux fichiers à la fois. Comme le traitement se fait sur votre appareil, la limite dépend principalement de la mémoire de votre navigateur.' },
        { q: 'Puis-je réorganiser les pages avant de fusionner ?', a: 'Oui, vous pouvez réorganiser l\'ordre des fichiers par glisser-déposer avant de lancer la fusion.' },
        ...commonFaqsFr,
      ],
    },
    en: {
      metaTitle: 'Merge PDF Online Free & Secure (No Upload) | E-PDF\'s',
      metaDescription: 'Combine multiple PDF files into one, free. 100% local processing: your files never leave your browser. No registration, no watermark.',
      keywords: 'merge pdf, combine pdf, join pdf, merge pdf free, secure pdf merge no upload',
      seoHeading: 'Merge PDF files online, free and securely',
      paragraphs: [
        'Our PDF merge tool lets you combine several PDF documents into a single, organized file in seconds. Drag and drop your files, reorder them as you like, then download the merged PDF. Perfect for grouping invoices, contracts, reports or chapters into one document.',
        "What sets E-PDF's apart: merging happens entirely inside your browser. Your files are never sent to a remote server, guaranteeing complete privacy — a decisive advantage for sensitive documents (HR, legal, finance) over tools that upload your data.",
        'The tool works on all modern devices and browsers, with no installation. There are no hidden file-count limits, no watermark and no sign-up. You keep full control over page order and the final result.',
        'To merge your PDFs: upload at least two files, adjust the order by dragging, click "Merge", then download your combined document instantly.',
      ],
      faqs: [
        { q: 'How many PDF files can I merge?', a: 'You can merge many files at once. Because processing runs on your device, the limit mainly depends on your browser memory.' },
        { q: 'Can I reorder pages before merging?', a: 'Yes, you can reorder the files by drag and drop before starting the merge.' },
        ...commonFaqsEn,
      ],
    },
  },
  '/split': {
    fr: {
      metaTitle: 'Diviser PDF en ligne gratuit et sécurisé | E-PDF\'s',
      metaDescription: 'Séparez un PDF en plusieurs fichiers ou extrayez des pages, gratuitement. Traitement 100 % local, sans téléversement, sans inscription.',
      keywords: 'diviser pdf, séparer pdf, découper pdf, split pdf gratuit, extraire pages pdf',
      seoHeading: 'Diviser un PDF en ligne, gratuitement et en toute sécurité',
      paragraphs: [
        "L'outil de division PDF vous permet de séparer un document en plusieurs fichiers ou d'extraire des pages précises. Sélectionnez les plages de pages voulues et obtenez instantanément des PDF distincts, parfaits pour partager une seule section d'un long document.",
        "Comme tous nos outils, la division s'effectue localement dans votre navigateur. Vos fichiers restent privés et ne sont jamais téléversés — un atout majeur pour les documents confidentiels.",
        'Aucune installation, aucun filigrane, aucune inscription. Compatible avec Windows, Mac, Linux, Android et iOS.',
        'Pour diviser un PDF : importez votre fichier, indiquez les pages ou plages à séparer, puis téléchargez vos nouveaux documents.',
      ],
      faqs: [
        { q: 'Puis-je extraire une seule page ?', a: 'Oui, vous pouvez extraire une page unique ou des plages de pages spécifiques.' },
        ...commonFaqsFr,
      ],
    },
    en: {
      metaTitle: 'Split PDF Online Free & Secure (No Upload) | E-PDF\'s',
      metaDescription: 'Split a PDF into multiple files or extract pages, free. 100% local processing, no upload, no registration.',
      keywords: 'split pdf, separate pdf, divide pdf, split pdf free, extract pdf pages',
      seoHeading: 'Split a PDF online, free and securely',
      paragraphs: [
        'The split PDF tool lets you separate a document into multiple files or extract specific pages. Select the page ranges you need and instantly get separate PDFs, perfect for sharing a single section of a long document.',
        'Like all our tools, splitting happens locally in your browser. Your files stay private and are never uploaded — a major advantage for confidential documents.',
        'No installation, no watermark, no sign-up. Works on Windows, Mac, Linux, Android and iOS.',
        'To split a PDF: upload your file, choose the pages or ranges to separate, then download your new documents.',
      ],
      faqs: [
        { q: 'Can I extract a single page?', a: 'Yes, you can extract a single page or specific page ranges.' },
        ...commonFaqsEn,
      ],
    },
  },
  '/compress': {
    fr: {
      metaTitle: 'Compresser PDF en ligne gratuit (réduire la taille) | E-PDF\'s',
      metaDescription: 'Réduisez la taille de vos PDF pour les envoyer par email, gratuitement. Traitement 100 % local, sans téléversement, sans perte visible de qualité.',
      keywords: 'compresser pdf, réduire taille pdf, compresser pdf pour email, réduire pdf en ligne, compress pdf gratuit',
      seoHeading: 'Compresser un PDF en ligne pour réduire sa taille',
      paragraphs: [
        'Notre compresseur PDF réduit le poids de vos fichiers tout en préservant une bonne lisibilité. Idéal pour envoyer un PDF par email (Gmail, Outlook), le téléverser sur un portail administratif ou respecter une limite de taille de pièce jointe.',
        "La compression se fait entièrement dans votre navigateur : vos documents ne sont jamais envoyés sur un serveur. C'est l'option la plus sûre pour réduire des fichiers confidentiels sans risque de fuite.",
        "Comment réduire la taille d'un PDF pour l'email : importez votre fichier, lancez la compression, puis téléchargez la version allégée — souvent réduite de moitié ou plus selon le contenu.",
        'Gratuit, sans inscription, sans filigrane et compatible avec tous les appareils.',
      ],
      faqs: [
        { q: 'Comment réduire un PDF pour l\'envoyer par email ?', a: 'Importez votre PDF, lancez la compression, puis téléchargez la version allégée. La plupart des fichiers passent ainsi sous les limites de pièce jointe des messageries.' },
        { q: 'La compression dégrade-t-elle la qualité ?', a: 'La compression optimise les images et la structure du fichier pour réduire le poids tout en conservant une lecture nette à l\'écran.' },
        ...commonFaqsFr,
      ],
    },
    en: {
      metaTitle: 'Compress PDF Online Free (Reduce Size for Email) | E-PDF\'s',
      metaDescription: 'Reduce PDF file size to email it, free. 100% local processing, no upload, no visible quality loss.',
      keywords: 'compress pdf, reduce pdf size, compress pdf for email, reduce pdf online, compress pdf free',
      seoHeading: 'Compress a PDF online to reduce its size',
      paragraphs: [
        'Our PDF compressor reduces file size while keeping good readability. Ideal for emailing a PDF (Gmail, Outlook), uploading to a government portal, or meeting an attachment size limit.',
        'Compression happens entirely in your browser: your documents are never sent to a server. It is the safest way to shrink confidential files with zero leak risk.',
        'How to reduce PDF size for email: upload your file, run the compression, then download the lighter version — often cut by half or more depending on content.',
        'Free, no sign-up, no watermark and works on every device.',
      ],
      faqs: [
        { q: 'How do I reduce a PDF to email it?', a: 'Upload your PDF, run the compression, then download the lighter version. Most files then fall below email attachment limits.' },
        { q: 'Does compression reduce quality?', a: 'Compression optimizes images and file structure to cut size while keeping sharp on-screen reading.' },
        ...commonFaqsEn,
      ],
    },
  },
  '/jpg-to-pdf': {
    fr: {
      metaTitle: 'JPG en PDF gratuit (convertir images en PDF) | E-PDF\'s',
      metaDescription: 'Convertissez vos images JPG, JPEG et PNG en PDF gratuitement. Traitement 100 % local dans le navigateur, sans téléversement ni filigrane.',
      keywords: 'jpg en pdf, image en pdf, convertir jpg pdf, png en pdf, photo en pdf gratuit',
      seoHeading: 'Convertir des images JPG en PDF en ligne',
      paragraphs: [
        'Transformez vos photos et captures (JPG, JPEG, PNG) en un fichier PDF propre et partageable. Ajoutez plusieurs images, réorganisez-les, puis téléchargez un PDF unique — parfait pour numériser des reçus, des documents ou un portfolio.',
        "La conversion s'effectue dans votre navigateur : vos images ne quittent jamais votre appareil. Confidentialité garantie, même pour des documents personnels.",
        'Gratuit, sans inscription et sans filigrane. Compatible avec tous les systèmes et navigateurs.',
        "Pour convertir : importez vos images, ajustez l'ordre, puis générez votre PDF.",
      ],
      faqs: [
        { q: 'Puis-je convertir plusieurs images en un seul PDF ?', a: 'Oui, ajoutez autant d\'images que nécessaire et elles seront réunies dans un seul document PDF.' },
        { q: 'Les formats PNG sont-ils pris en charge ?', a: 'Oui, les fichiers JPG, JPEG et PNG sont pris en charge.' },
        ...commonFaqsFr,
      ],
    },
    en: {
      metaTitle: 'JPG to PDF Free (Convert Images to PDF) | E-PDF\'s',
      metaDescription: 'Convert JPG, JPEG and PNG images to PDF for free. 100% local in-browser processing, no upload, no watermark.',
      keywords: 'jpg to pdf, image to pdf, convert jpg pdf, png to pdf, photo to pdf free',
      seoHeading: 'Convert JPG images to PDF online',
      paragraphs: [
        'Turn your photos and screenshots (JPG, JPEG, PNG) into a clean, shareable PDF. Add multiple images, reorder them, then download a single PDF — perfect for scanning receipts, documents or a portfolio.',
        'Conversion runs in your browser: your images never leave your device. Privacy guaranteed, even for personal documents.',
        'Free, no sign-up and no watermark. Works on every system and browser.',
        'To convert: upload your images, adjust the order, then generate your PDF.',
      ],
      faqs: [
        { q: 'Can I convert several images into one PDF?', a: 'Yes, add as many images as needed and they will be combined into a single PDF document.' },
        { q: 'Is PNG supported?', a: 'Yes, JPG, JPEG and PNG files are supported.' },
        ...commonFaqsEn,
      ],
    },
  },
  '/pdf-to-word': {
    fr: {
      metaTitle: 'PDF en Word gratuit (convertir PDF en DOCX) | E-PDF\'s',
      metaDescription: 'Convertissez vos PDF en documents Word éditables gratuitement. Traitement local et sécurisé dans le navigateur, sans inscription.',
      keywords: 'pdf en word, convertir pdf word, pdf to word gratuit, pdf en docx, extraire texte pdf',
      seoHeading: 'Convertir un PDF en Word en ligne',
      paragraphs: [
        "Notre convertisseur transforme vos fichiers PDF en documents Word modifiables, pour récupérer et réutiliser facilement le texte sans tout retaper.",
        "Le traitement reste sur votre appareil autant que possible, pour protéger vos documents. Aucune inscription, aucun filigrane.",
        'Idéal pour éditer un contrat, un CV ou un rapport reçu au format PDF.',
        'Pour convertir : importez votre PDF, lancez la conversion, puis téléchargez votre document Word.',
      ],
      faqs: [
        { q: 'Le texte reste-t-il éditable ?', a: 'Oui, l\'objectif de la conversion est de produire un document dont le texte peut être modifié.' },
        ...commonFaqsFr,
      ],
    },
    en: {
      metaTitle: 'PDF to Word Free (Convert PDF to DOCX) | E-PDF\'s',
      metaDescription: 'Convert PDF to editable Word documents for free. Secure in-browser processing, no registration.',
      keywords: 'pdf to word, convert pdf word, pdf to word free, pdf to docx, extract pdf text',
      seoHeading: 'Convert a PDF to Word online',
      paragraphs: [
        'Our converter turns your PDF files into editable Word documents so you can recover and reuse text without retyping.',
        'Processing stays on your device as much as possible to protect your documents. No sign-up, no watermark.',
        'Ideal for editing a contract, résumé or report received as a PDF.',
        'To convert: upload your PDF, run the conversion, then download your Word document.',
      ],
      faqs: [
        { q: 'Does the text stay editable?', a: 'Yes, the goal of the conversion is to produce a document whose text can be edited.' },
        ...commonFaqsEn,
      ],
    },
  },
  '/pdf-to-jpg': {
    fr: {
      metaTitle: 'PDF en JPG gratuit (convertir PDF en images) | E-PDF\'s',
      metaDescription: 'Convertissez chaque page de votre PDF en image JPG, gratuitement. Traitement 100 % local, sans téléversement ni filigrane.',
      keywords: 'pdf en jpg, pdf en image, convertir pdf jpg, exporter pdf images, pdf to jpg gratuit',
      seoHeading: 'Convertir un PDF en images JPG',
      paragraphs: [
        'Cet outil convertit chaque page de votre PDF en image JPG de haute qualité, pratique pour insérer une page dans une présentation, un email ou les réseaux sociaux.',
        'La conversion se déroule dans votre navigateur : vos fichiers ne sont jamais téléversés.',
        'Gratuit, sans inscription et sans filigrane, sur tous les appareils.',
        'Pour convertir : importez votre PDF, lancez la conversion, puis téléchargez vos images.',
      ],
      faqs: [
        { q: 'Chaque page devient-elle une image ?', a: 'Oui, chaque page du PDF est exportée en image JPG distincte.' },
        ...commonFaqsFr,
      ],
    },
    en: {
      metaTitle: 'PDF to JPG Free (Convert PDF to Images) | E-PDF\'s',
      metaDescription: 'Convert each page of your PDF to a JPG image, free. 100% local processing, no upload, no watermark.',
      keywords: 'pdf to jpg, pdf to image, convert pdf jpg, export pdf images, pdf to jpg free',
      seoHeading: 'Convert a PDF to JPG images',
      paragraphs: [
        'This tool converts each page of your PDF into a high-quality JPG image, handy for dropping a page into a presentation, email or social post.',
        'Conversion runs in your browser: your files are never uploaded.',
        'Free, no sign-up and no watermark, on every device.',
        'To convert: upload your PDF, run the conversion, then download your images.',
      ],
      faqs: [
        { q: 'Does each page become an image?', a: 'Yes, each page of the PDF is exported as a separate JPG image.' },
        ...commonFaqsEn,
      ],
    },
  },
};

// Fallback content generator for tools without bespoke entries.
export function getToolSeo(pathname: string, title: string, description: string): ToolSeo {
  const exact = toolSeoData[pathname];
  if (exact) return exact;
  return {
    fr: {
      metaTitle: `${title} en ligne gratuit et sécurisé | E-PDF's`,
      metaDescription: `${description} Traitement 100 % local dans votre navigateur, sans téléversement, sans inscription et sans filigrane.`,
      keywords: `${title}, outil pdf gratuit, pdf en ligne, ${title} sécurisé sans téléversement`,
      seoHeading: `${title} en ligne, gratuitement et en toute sécurité`,
      paragraphs: [
        `${description} Cet outil fonctionne directement dans votre navigateur, ce qui vous évite toute installation.`,
        "La particularité d'E-PDF's : le traitement est 100 % local. Vos fichiers ne sont jamais envoyés sur un serveur et restent strictement privés — un avantage de sécurité décisif pour vos documents sensibles.",
        'Gratuit, sans inscription, sans filigrane et compatible avec Windows, Mac, Linux, Android et iOS.',
      ],
      faqs: commonFaqsFr,
    },
    en: {
      metaTitle: `${title} Online Free & Secure | E-PDF's`,
      metaDescription: `${description} 100% local in-browser processing, no upload, no registration and no watermark.`,
      keywords: `${title}, free pdf tool, online pdf, secure ${title} no upload`,
      seoHeading: `${title} online, free and securely`,
      paragraphs: [
        `${description} This tool runs directly in your browser, so there is nothing to install.`,
        "What makes E-PDF's different: processing is 100% local. Your files are never sent to a server and stay strictly private — a decisive security advantage for sensitive documents.",
        'Free, no sign-up, no watermark and works on Windows, Mac, Linux, Android and iOS.',
      ],
      faqs: commonFaqsEn,
    },
  };
}
