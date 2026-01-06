import { useState } from 'react';
import { GitCompare, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import FileUpload from '@/components/FileUpload';
import { Button } from '@/components/ui/button';
import ProcessingLoader from '@/components/ProcessingLoader';
import { pdfToImages } from '@/lib/pdfUtils';
import { motion } from 'framer-motion';

const ComparePDF = () => {
  const [files1, setFiles1] = useState<File[]>([]);
  const [files2, setFiles2] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previews1, setPreviews1] = useState<string[]>([]);
  const [previews2, setPreviews2] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isComparing, setIsComparing] = useState(false);

  const handleFiles1Selected = (newFiles: File[]) => {
    setFiles1(newFiles);
    setIsComparing(false);
    setPreviews1([]);
  };

  const handleFiles2Selected = (newFiles: File[]) => {
    setFiles2(newFiles);
    setIsComparing(false);
    setPreviews2([]);
  };

  const handleCompare = async () => {
    if (files1.length === 0 || files2.length === 0) return;
    
    setIsProcessing(true);
    try {
      const [images1, images2] = await Promise.all([
        pdfToImages(files1[0]),
        pdfToImages(files2[0])
      ]);
      
      setPreviews1(images1);
      setPreviews2(images2);
      setIsComparing(true);
      setCurrentPage(0);
    } catch (error) {
      console.error('Error loading PDFs:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFiles1([]);
    setFiles2([]);
    setPreviews1([]);
    setPreviews2([]);
    setIsComparing(false);
    setCurrentPage(0);
  };

  const maxPages = Math.max(previews1.length, previews2.length);

  return (
    <ToolLayout
      title="Comparer PDF"
      description="Comparez deux fichiers PDF côte à côte"
      icon={GitCompare}
      color="coral"
    >
      {isProcessing ? (
        <ProcessingLoader message="Chargement des documents..." />
      ) : isComparing ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Précédent
            </Button>
            
            <span className="text-sm text-muted-foreground">
              Page {currentPage + 1} / {maxPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(maxPages - 1, p + 1))}
              disabled={currentPage >= maxPages - 1}
            >
              Suivant
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-center truncate" title={files1[0]?.name}>
                {files1[0]?.name}
              </h4>
              <div className="bg-card rounded-lg shadow-lg overflow-hidden">
                {previews1[currentPage] ? (
                  <img
                    src={previews1[currentPage]}
                    alt={`Document 1 - Page ${currentPage + 1}`}
                    className="w-full"
                  />
                ) : (
                  <div className="aspect-[3/4] flex items-center justify-center bg-muted">
                    <p className="text-muted-foreground">Page non disponible</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-center truncate" title={files2[0]?.name}>
                {files2[0]?.name}
              </h4>
              <div className="bg-card rounded-lg shadow-lg overflow-hidden">
                {previews2[currentPage] ? (
                  <img
                    src={previews2[currentPage]}
                    alt={`Document 2 - Page ${currentPage + 1}`}
                    className="w-full"
                  />
                ) : (
                  <div className="aspect-[3/4] flex items-center justify-center bg-muted">
                    <p className="text-muted-foreground">Page non disponible</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <Button onClick={handleReset} variant="outline" size="lg" className="gap-2">
              <RotateCcw className="w-5 h-5" />
              Nouvelle comparaison
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-center">Document 1</h3>
              <FileUpload
                onFilesSelected={handleFiles1Selected}
                accept=".pdf"
                multiple={false}
                maxFiles={1}
                files={files1}
                title="Premier PDF"
                description="Déposez ou cliquez"
              />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-center">Document 2</h3>
              <FileUpload
                onFilesSelected={handleFiles2Selected}
                accept=".pdf"
                multiple={false}
                maxFiles={1}
                files={files2}
                title="Second PDF"
                description="Déposez ou cliquez"
              />
            </div>
          </div>
          
          {files1.length > 0 && files2.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center"
            >
              <Button onClick={handleCompare} size="lg" className="gap-2">
                <GitCompare className="w-5 h-5" />
                Comparer les documents
              </Button>
            </motion.div>
          )}
        </div>
      )}
    </ToolLayout>
  );
};

export default ComparePDF;
