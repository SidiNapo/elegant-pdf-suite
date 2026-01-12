import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Download, RotateCcw } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import FileUpload from '@/components/FileUpload';
import { Button } from '@/components/ui/button';
import ProcessingLoader from '@/components/ProcessingLoader';
import { extractTextFromPDF, createWordDocument } from '@/lib/pdfUtils';
import { motion } from 'framer-motion';

const PdfToWord = () => {
  const { t } = useTranslation();
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [extractedPages, setExtractedPages] = useState<string[]>([]);

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles(newFiles);
    setIsComplete(false);
    setExtractedPages([]);
  };

  const handleConvert = async () => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    try {
      const pages = await extractTextFromPDF(files[0]);
      setExtractedPages(pages);
      setIsComplete(true);
    } catch (error) {
      console.error('Conversion error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (extractedPages.length > 0) {
      const originalName = files[0].name.replace(/\.pdf$/i, '');
      createWordDocument(extractedPages, `${originalName}.doc`);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setIsComplete(false);
    setExtractedPages([]);
  };

  return (
    <ToolLayout
      title={t('tools.pdfToWord.title')}
      description={t('tools.pdfToWord.description')}
      icon={FileText}
      color="cyan"
    >
      {isProcessing ? (
        <ProcessingLoader message={t('tools.pdfToWord.processing')} />
      ) : isComplete ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
            <FileText className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-foreground">{t('tools.pdfToWord.success')}</h3>
          <p className="text-muted-foreground">
            {extractedPages.length} {t('tools.pdfToWord.pagesExtracted')}
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={handleDownload} size="lg" className="gap-2">
              <Download className="w-5 h-5" />
              {t('tools.pdfToWord.download')}
            </Button>
            <Button onClick={handleReset} variant="outline" size="lg" className="gap-2">
              <RotateCcw className="w-5 h-5" />
              {t('tools.pdfToWord.reset')}
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
          />
          
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center"
            >
              <Button onClick={handleConvert} size="lg" className="gap-2">
                <FileText className="w-5 h-5" />
                {t('tools.pdfToWord.convertButton')}
              </Button>
            </motion.div>
          )}
        </div>
      )}
    </ToolLayout>
  );
};

export default PdfToWord;
