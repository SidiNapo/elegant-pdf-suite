import { useState } from 'react';
import { Image, Download, CheckCircle } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import FileUpload from '@/components/FileUpload';
import ProcessingLoader from '@/components/ProcessingLoader';
import { imagesToPDF, downloadPDF } from '@/lib/pdfUtils';
import { motion } from 'framer-motion';

const JpgToPdf = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [resultPdf, setResultPdf] = useState<Uint8Array | null>(null);

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setIsComplete(false);
    setResultPdf(null);
  };

  const handleConvert = async () => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    try {
      const result = await imagesToPDF(files);
      setResultPdf(result);
      setIsComplete(true);
    } catch (error) {
      console.error('Error converting images to PDF:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (resultPdf) {
      downloadPDF(resultPdf, 'images.pdf');
    }
  };

  const handleReset = () => {
    setFiles([]);
    setIsComplete(false);
    setResultPdf(null);
  };

  return (
    <ToolLayout
      title="JPG en PDF"
      description="Convertissez vos images JPG et PNG en un document PDF"
      icon={Image}
      color="rose"
    >
      <div className="max-w-3xl mx-auto">
        {isProcessing ? (
          <ProcessingLoader message="Conversion en cours..." />
        ) : isComplete ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">Conversion terminée !</h3>
            <p className="text-muted-foreground mb-8">
              {files.length} image(s) ont été converties en PDF.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={handleDownload} className="btn-primary flex items-center justify-center gap-2">
                <Download className="w-5 h-5" />
                Télécharger le PDF
              </button>
              <button onClick={handleReset} className="btn-secondary">
                Convertir d'autres images
              </button>
            </div>
          </motion.div>
        ) : (
          <>
            <FileUpload
              onFilesSelected={handleFilesSelected}
              accept=".jpg,.jpeg,.png"
              multiple
              maxFiles={50}
              files={files}
              title="Déposez vos images ici"
              description="JPG, JPEG ou PNG"
            />
            
            {files.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 text-center"
              >
                <button onClick={handleConvert} className="btn-primary">
                  Convertir {files.length} image(s) en PDF
                </button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </ToolLayout>
  );
};

export default JpgToPdf;
