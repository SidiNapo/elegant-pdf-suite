import { useState } from 'react';
import { Hash, Download, CheckCircle } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import FileUpload from '@/components/FileUpload';
import ProcessingLoader from '@/components/ProcessingLoader';
import { addPageNumbers, downloadPDF } from '@/lib/pdfUtils';
import { motion } from 'framer-motion';

const PageNumbers = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [resultPdf, setResultPdf] = useState<Uint8Array | null>(null);
  const [position, setPosition] = useState<'top' | 'bottom'>('bottom');
  const [format, setFormat] = useState('Page {n} de {total}');

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setIsComplete(false);
    setResultPdf(null);
  };

  const handleAddNumbers = async () => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    try {
      const result = await addPageNumbers(files[0], position, format);
      setResultPdf(result);
      setIsComplete(true);
    } catch (error) {
      console.error('Error adding page numbers:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (resultPdf) {
      downloadPDF(resultPdf, 'numbered.pdf');
    }
  };

  const handleReset = () => {
    setFiles([]);
    setIsComplete(false);
    setResultPdf(null);
  };

  const formatOptions = [
    { value: 'Page {n} de {total}', label: 'Page 1 de 10' },
    { value: '{n} / {total}', label: '1 / 10' },
    { value: '{n}', label: '1' },
    { value: '- {n} -', label: '- 1 -' },
  ];

  return (
    <ToolLayout
      title="Numéros de pages"
      description="Ajoutez des numéros de page à votre PDF"
      icon={Hash}
      color="coral"
    >
      <div className="max-w-3xl mx-auto">
        {isProcessing ? (
          <ProcessingLoader message="Ajout des numéros en cours..." />
        ) : isComplete ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">Numéros ajoutés !</h3>
            <p className="text-muted-foreground mb-8">
              Les numéros de page ont été ajoutés à votre PDF.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={handleDownload} className="btn-primary flex items-center justify-center gap-2">
                <Download className="w-5 h-5" />
                Télécharger le PDF
              </button>
              <button onClick={handleReset} className="btn-secondary">
                Numéroter un autre fichier
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
            
            {files.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 space-y-8"
              >
                {/* Position */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-center">Position</h3>
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => setPosition('top')}
                      className={`px-6 py-3 rounded-xl font-medium transition-all ${
                        position === 'top'
                          ? 'bg-primary text-primary-foreground'
                          : 'glass-card hover:bg-muted'
                      }`}
                    >
                      En haut
                    </button>
                    <button
                      onClick={() => setPosition('bottom')}
                      className={`px-6 py-3 rounded-xl font-medium transition-all ${
                        position === 'bottom'
                          ? 'bg-primary text-primary-foreground'
                          : 'glass-card hover:bg-muted'
                      }`}
                    >
                      En bas
                    </button>
                  </div>
                </div>

                {/* Format */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-center">Format</h3>
                  <div className="flex flex-wrap gap-3 justify-center">
                    {formatOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setFormat(option.value)}
                        className={`px-4 py-2 rounded-xl font-medium transition-all ${
                          format === option.value
                            ? 'bg-primary text-primary-foreground'
                            : 'glass-card hover:bg-muted'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="text-center">
                  <button onClick={handleAddNumbers} className="btn-primary">
                    Ajouter les numéros
                  </button>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </ToolLayout>
  );
};

export default PageNumbers;
