import { useState } from 'react';
import { Globe, Download, RotateCcw, Code } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import ProcessingLoader from '@/components/ProcessingLoader';
import { htmlToPDF, downloadPDF } from '@/lib/pdfUtils';
import { motion } from 'framer-motion';

const HtmlToPdf = () => {
  const [htmlContent, setHtmlContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [pdfData, setPdfData] = useState<Uint8Array | null>(null);

  const handleConvert = async () => {
    if (!htmlContent.trim()) return;
    
    setIsProcessing(true);
    try {
      const result = await htmlToPDF(htmlContent);
      setPdfData(result);
      setIsComplete(true);
    } catch (error) {
      console.error('Conversion error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (pdfData) {
      downloadPDF(pdfData, 'document.pdf');
    }
  };

  const handleReset = () => {
    setHtmlContent('');
    setIsComplete(false);
    setPdfData(null);
  };

  const sampleHtml = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    h1 { color: #333; }
    p { line-height: 1.6; }
  </style>
</head>
<body>
  <h1>Mon Document</h1>
  <p>Ceci est un exemple de contenu HTML qui sera converti en PDF.</p>
</body>
</html>`;

  return (
    <ToolLayout
      title="HTML en PDF"
      description="Convertissez du code HTML en fichiers PDF"
      icon={Globe}
      color="rose"
    >
      {isProcessing ? (
        <ProcessingLoader message="Conversion du HTML en PDF..." />
      ) : isComplete ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
            <Globe className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-foreground">Conversion terminée !</h3>
          <p className="text-muted-foreground">Votre HTML a été converti en PDF</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={handleDownload} size="lg" className="gap-2">
              <Download className="w-5 h-5" />
              Télécharger le PDF
            </Button>
            <Button onClick={handleReset} variant="outline" size="lg" className="gap-2">
              <RotateCcw className="w-5 h-5" />
              Nouvelle conversion
            </Button>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Code HTML</label>
            <Textarea
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
              placeholder="Collez votre code HTML ici..."
              className="min-h-[300px] font-mono text-sm"
            />
          </div>
          
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => setHtmlContent(sampleHtml)}
              variant="outline"
              className="gap-2"
            >
              <Code className="w-4 h-4" />
              Exemple HTML
            </Button>
            
            {htmlContent.trim() && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Button onClick={handleConvert} size="lg" className="gap-2">
                  <Globe className="w-5 h-5" />
                  Convertir en PDF
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      )}
    </ToolLayout>
  );
};

export default HtmlToPdf;