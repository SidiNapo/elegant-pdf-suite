import { useState } from 'react';
import { FileSearch, Download, RotateCcw, Copy, Check } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import FileUpload from '@/components/FileUpload';
import { Button } from '@/components/ui/button';
import ProcessingLoader from '@/components/ProcessingLoader';
import { extractTextFromPDF } from '@/lib/pdfUtils';
import { motion } from 'framer-motion';

const OcrPDF = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [extractedText, setExtractedText] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles(newFiles);
    setIsComplete(false);
    setExtractedText([]);
  };

  const handleExtract = async () => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    try {
      const pages = await extractTextFromPDF(files[0]);
      setExtractedText(pages);
      setIsComplete(true);
    } catch (error) {
      console.error('Error extracting text:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = async () => {
    const allText = extractedText.join('\n\n--- Page ---\n\n');
    await navigator.clipboard.writeText(allText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const allText = extractedText.map((text, i) => `--- Page ${i + 1} ---\n\n${text}`).join('\n\n');
    const blob = new Blob([allText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = files[0].name.replace('.pdf', '_text.txt');
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setFiles([]);
    setIsComplete(false);
    setExtractedText([]);
    setCopied(false);
  };

  const totalChars = extractedText.reduce((sum, p) => sum + p.length, 0);

  return (
    <ToolLayout
      title="OCR PDF"
      description="Extrayez le texte de vos documents PDF"
      icon={FileSearch}
      color="coral"
    >
      {isProcessing ? (
        <ProcessingLoader message="Extraction du texte en cours..." />
      ) : isComplete ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          <div className="text-center">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-4">
              <FileSearch className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">Extraction terminée !</h3>
            <p className="text-muted-foreground mt-2">
              {extractedText.length} page(s) • {totalChars.toLocaleString()} caractères extraits
            </p>
          </div>
          
          <div className="bg-muted rounded-lg p-4 max-h-96 overflow-auto">
            {extractedText.length > 0 ? (
              extractedText.map((text, i) => (
                <div key={i} className="mb-4">
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                    Page {i + 1}
                  </h4>
                  <p className="text-sm whitespace-pre-wrap">
                    {text || <em className="text-muted-foreground">Aucun texte détecté sur cette page</em>}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground italic">
                Aucun texte n'a pu être extrait de ce document.
                Il s'agit peut-être d'un PDF scanné (image uniquement).
              </p>
            )}
          </div>
          
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              <strong>Note :</strong> Cette fonctionnalité extrait le texte intégré dans le PDF.
              Pour les documents scannés (images), une vraie OCR nécessite un traitement côté serveur.
            </p>
          </div>
          
          <div className="flex gap-4 justify-center flex-wrap">
            <Button onClick={handleCopy} variant="outline" className="gap-2">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copié !' : 'Copier le texte'}
            </Button>
            <Button onClick={handleDownload} className="gap-2">
              <Download className="w-5 h-5" />
              Télécharger (.txt)
            </Button>
            <Button onClick={handleReset} variant="outline" className="gap-2">
              <RotateCcw className="w-5 h-5" />
              Nouveau fichier
            </Button>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-6">
          <FileUpload
            onFilesSelected={handleFilesSelected}
            accept=".pdf"
            multiple={false}
            maxFiles={1}
            files={files}
            title="Déposez votre fichier PDF ici"
            description="ou cliquez pour sélectionner"
          />
          
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center"
            >
              <Button onClick={handleExtract} size="lg" className="gap-2">
                <FileSearch className="w-5 h-5" />
                Extraire le texte
              </Button>
            </motion.div>
          )}
        </div>
      )}
    </ToolLayout>
  );
};

export default OcrPDF;
