import { useState } from 'react';
import { FileType, Download, RotateCcw } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import FileUpload from '@/components/FileUpload';
import { Button } from '@/components/ui/button';
import ProcessingLoader from '@/components/ProcessingLoader';
import { readFileAsArrayBuffer, downloadPDF } from '@/lib/pdfUtils';
import { PDFDocument } from 'pdf-lib';
import { motion } from 'framer-motion';

const PdfToPdfa = () => {
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
      const arrayBuffer = await readFileAsArrayBuffer(files[0]);
      const pdf = await PDFDocument.load(arrayBuffer);
      
      // Add PDF/A metadata
      // Note: Full PDF/A compliance requires font embedding and color profile conversion
      // which is beyond what pdf-lib can do in the browser
      
      const now = new Date();
      pdf.setTitle(pdf.getTitle() || 'Document');
      pdf.setAuthor(pdf.getAuthor() || 'Unknown');
      pdf.setSubject(pdf.getSubject() || 'PDF/A Converted Document');
      pdf.setCreator('PDF Tools - PDF/A Converter');
      pdf.setProducer('PDF Tools (PDF/A-1b)');
      pdf.setCreationDate(pdf.getCreationDate() || now);
      pdf.setModificationDate(now);
      
      // Add PDF/A identification
      pdf.setKeywords(['PDF/A', 'PDF/A-1b', 'archive']);
      
      const result = await pdf.save();
      setPdfData(result);
      setIsComplete(true);
    } catch (error) {
      console.error('Error converting to PDF/A:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (pdfData && files[0]) {
      const name = files[0].name.replace('.pdf', '_pdfa.pdf');
      downloadPDF(pdfData, name);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setIsComplete(false);
    setPdfData(null);
  };

  return (
    <ToolLayout
      title="PDF en PDF/A"
      description="Convertissez vos PDF en format d'archivage PDF/A"
      icon={FileType}
      color="violet"
    >
      {isProcessing ? (
        <ProcessingLoader message="Conversion en PDF/A..." />
      ) : isComplete ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
            <FileType className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-foreground">Conversion terminée !</h3>
          <p className="text-muted-foreground">
            Les métadonnées PDF/A ont été ajoutées à votre document
          </p>
          
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Note :</strong> Cette conversion ajoute les métadonnées PDF/A.
              Pour une conformité PDF/A complète (polices intégrées, profils couleur),
              un traitement côté serveur est recommandé.
            </p>
          </div>
          
          <div className="flex gap-4 justify-center">
            <Button onClick={handleDownload} size="lg" className="gap-2">
              <Download className="w-5 h-5" />
              Télécharger
            </Button>
            <Button onClick={handleReset} variant="outline" size="lg" className="gap-2">
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
              <Button onClick={handleConvert} size="lg" className="gap-2">
                <FileType className="w-5 h-5" />
                Convertir en PDF/A
              </Button>
            </motion.div>
          )}
        </div>
      )}
    </ToolLayout>
  );
};

export default PdfToPdfa;
