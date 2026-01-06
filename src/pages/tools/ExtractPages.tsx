import { useState, useEffect } from 'react';
import { FileOutput, Download, CheckCircle } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import FileUpload from '@/components/FileUpload';
import ProcessingLoader from '@/components/ProcessingLoader';
import { extractPages, downloadPDF, getPDFPageCount } from '@/lib/pdfUtils';
import { motion } from 'framer-motion';

const ExtractPages = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [resultPdf, setResultPdf] = useState<Uint8Array | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);

  useEffect(() => {
    const loadPageCount = async () => {
      if (files.length > 0) {
        const count = await getPDFPageCount(files[0]);
        setPageCount(count);
        setSelectedPages([]);
      }
    };
    loadPageCount();
  }, [files]);

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setIsComplete(false);
    setResultPdf(null);
  };

  const togglePage = (pageIndex: number) => {
    setSelectedPages((prev) =>
      prev.includes(pageIndex)
        ? prev.filter((p) => p !== pageIndex)
        : [...prev, pageIndex]
    );
  };

  const handleExtract = async () => {
    if (files.length === 0 || selectedPages.length === 0) return;
    
    setIsProcessing(true);
    try {
      const sortedPages = [...selectedPages].sort((a, b) => a - b);
      const result = await extractPages(files[0], sortedPages);
      setResultPdf(result);
      setIsComplete(true);
    } catch (error) {
      console.error('Error extracting pages:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (resultPdf) {
      downloadPDF(resultPdf, 'extracted.pdf');
    }
  };

  const handleReset = () => {
    setFiles([]);
    setIsComplete(false);
    setResultPdf(null);
    setPageCount(0);
    setSelectedPages([]);
  };

  return (
    <ToolLayout
      title="Extraire des pages"
      description="Extrayez des pages spécifiques de votre PDF"
      icon={FileOutput}
      color="cyan"
    >
      <div className="max-w-3xl mx-auto">
        {isProcessing ? (
          <ProcessingLoader message="Extraction des pages en cours..." />
        ) : isComplete ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">Extraction terminée !</h3>
            <p className="text-muted-foreground mb-8">
              {selectedPages.length} page(s) ont été extraites avec succès.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={handleDownload} className="btn-primary flex items-center justify-center gap-2">
                <Download className="w-5 h-5" />
                Télécharger le PDF
              </button>
              <button onClick={handleReset} className="btn-secondary">
                Extraire d'autres pages
              </button>
            </div>
          </motion.div>
        ) : (
          <>
            <FileUpload
              onFilesSelected={handleFilesSelected}
              accept=".pdf"
              multiple={false}
              files={files}
              title="Déposez votre fichier PDF ici"
            />
            
            {pageCount > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8"
              >
                <h3 className="text-lg font-semibold mb-4 text-center">
                  Sélectionnez les pages à extraire ({pageCount} pages)
                </h3>
                <div className="flex flex-wrap gap-3 justify-center mb-8">
                  {Array.from({ length: pageCount }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => togglePage(i)}
                      className={`w-12 h-12 rounded-lg font-medium transition-all ${
                        selectedPages.includes(i)
                          ? 'bg-primary text-primary-foreground'
                          : 'glass-card hover:bg-muted'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                
                {selectedPages.length > 0 && (
                  <div className="text-center">
                    <button onClick={handleExtract} className="btn-primary">
                      Extraire {selectedPages.length} page(s)
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </>
        )}
      </div>
    </ToolLayout>
  );
};

export default ExtractPages;
