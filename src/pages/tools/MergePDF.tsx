import { useState } from 'react';
import { Merge, Download, CheckCircle } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import FileUpload from '@/components/FileUpload';
import ProcessingLoader from '@/components/ProcessingLoader';
import { mergePDFs, downloadPDF } from '@/lib/pdfUtils';
import { motion } from 'framer-motion';

const MergePDF = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [mergedPdf, setMergedPdf] = useState<Uint8Array | null>(null);

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setIsComplete(false);
    setMergedPdf(null);
  };

  const handleMerge = async () => {
    if (files.length < 2) return;
    
    setIsProcessing(true);
    try {
      const result = await mergePDFs(files);
      setMergedPdf(result);
      setIsComplete(true);
    } catch (error) {
      console.error('Error merging PDFs:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (mergedPdf) {
      downloadPDF(mergedPdf, 'merged.pdf');
    }
  };

  const handleReset = () => {
    setFiles([]);
    setIsComplete(false);
    setMergedPdf(null);
  };

  return (
    <ToolLayout
      title="Fusionner PDF"
      description="Combinez plusieurs fichiers PDF en un seul document facilement et rapidement"
      icon={Merge}
      color="coral"
    >
      <div className="max-w-3xl mx-auto">
        {isProcessing ? (
          <ProcessingLoader message="Fusion des fichiers en cours..." />
        ) : isComplete ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">Fusion terminée !</h3>
            <p className="text-muted-foreground mb-8">
              Vos {files.length} fichiers ont été fusionnés avec succès.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={handleDownload} className="btn-primary flex items-center justify-center gap-2">
                <Download className="w-5 h-5" />
                Télécharger le PDF
              </button>
              <button onClick={handleReset} className="btn-secondary">
                Fusionner d'autres fichiers
              </button>
            </div>
          </motion.div>
        ) : (
          <>
            <FileUpload
              onFilesSelected={handleFilesSelected}
              accept=".pdf"
              multiple
              maxFiles={20}
              files={files}
              title="Déposez vos fichiers PDF ici"
              description="Glissez-déposez vos fichiers ou cliquez pour les sélectionner"
            />
            
            {files.length >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 text-center"
              >
                <button onClick={handleMerge} className="btn-primary">
                  Fusionner {files.length} fichiers
                </button>
              </motion.div>
            )}
            
            {files.length === 1 && (
              <p className="text-center text-muted-foreground mt-6">
                Ajoutez au moins un autre fichier pour fusionner
              </p>
            )}
          </>
        )}
      </div>
    </ToolLayout>
  );
};

export default MergePDF;
