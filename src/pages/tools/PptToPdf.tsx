import { useState } from 'react';
import { Presentation, Download, RotateCcw } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import FileUpload from '@/components/FileUpload';
import { Button } from '@/components/ui/button';
import ProcessingLoader from '@/components/ProcessingLoader';
import { pptToPDF, downloadPDF } from '@/lib/pdfUtils';
import { motion } from 'framer-motion';

const PptToPdf = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [pdfData, setPdfData] = useState<Uint8Array | null>(null);

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles(newFiles);
    setIsComplete(false);
    setPdfData(null);
  };

  const handleConvert = async () => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    try {
      const result = await pptToPDF(files[0]);
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
      const originalName = files[0].name.replace(/\.(pptx?|ppt)$/i, '');
      downloadPDF(pdfData, `${originalName}.pdf`);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setIsComplete(false);
    setPdfData(null);
  };

  return (
    <ToolLayout
      title="PowerPoint en PDF"
      description="Convertissez vos présentations PowerPoint en fichiers PDF"
      icon={Presentation}
      color="cyan"
    >
      {isProcessing ? (
        <ProcessingLoader message="Conversion de la présentation..." />
      ) : isComplete ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
            <Presentation className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-foreground">Conversion terminée !</h3>
          <p className="text-muted-foreground">Votre présentation a été convertie en PDF</p>
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
          <FileUpload
            onFilesSelected={handleFilesSelected}
            accept=".ppt,.pptx"
            multiple={false}
            maxFiles={1}
            files={files}
            title="Déposez votre fichier PowerPoint ici"
            description="ou cliquez pour sélectionner (PPT, PPTX)"
          />
          
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center"
            >
              <Button onClick={handleConvert} size="lg" className="gap-2">
                <Presentation className="w-5 h-5" />
                Convertir en PDF
              </Button>
            </motion.div>
          )}
        </div>
      )}
    </ToolLayout>
  );
};

export default PptToPdf;