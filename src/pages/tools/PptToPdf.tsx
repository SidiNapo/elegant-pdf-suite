import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Presentation, Download, RotateCcw } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import FileUpload from '@/components/FileUpload';
import { Button } from '@/components/ui/button';
import ProcessingLoader from '@/components/ProcessingLoader';
import { pptToPDF, downloadPDF } from '@/lib/pdfUtils';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

const PptToPdf = () => {
  const { t } = useTranslation();
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [pdfData, setPdfData] = useState<Uint8Array | null>(null);
  const { toast } = useToast();

  const handleFilesSelected = (newFiles: File[]) => {
    if (newFiles.length > 0) {
      const file = newFiles[0];
      const fileName = file.name.toLowerCase();
      
      if (fileName.endsWith('.ppt') && !fileName.endsWith('.pptx')) {
        toast({
          title: t('tools.pptToPdf.formatWarningTitle'),
          description: t('tools.pptToPdf.formatWarningDesc'),
          variant: "destructive",
        });
      }
    }
    
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
      toast({
        title: t('tools.pptToPdf.successToast'),
        description: t('tools.pptToPdf.successToastDesc'),
      });
    } catch (error) {
      console.error('Conversion error:', error);
      toast({
        title: t('tools.pptToPdf.errorToast'),
        description: error instanceof Error ? error.message : t('tools.pptToPdf.errorToastDesc'),
        variant: "destructive",
      });
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
      title={t('tools.pptToPdf.title')}
      description={t('tools.pptToPdf.description')}
      icon={Presentation}
      color="cyan"
    >
      {isProcessing ? (
        <ProcessingLoader message={t('tools.pptToPdf.processing')} />
      ) : isComplete ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
            <Presentation className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-foreground">{t('tools.pptToPdf.success')}</h3>
          <div className="flex gap-4 justify-center">
            <Button onClick={handleDownload} size="lg" className="gap-2">
              <Download className="w-5 h-5" />
              {t('tools.pptToPdf.download')}
            </Button>
            <Button onClick={handleReset} variant="outline" size="lg" className="gap-2">
              <RotateCcw className="w-5 h-5" />
              {t('tools.pptToPdf.reset')}
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
          />
          
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center"
            >
              <Button onClick={handleConvert} size="lg" className="gap-2">
                <Presentation className="w-5 h-5" />
                {t('tools.pptToPdf.convertButton')}
              </Button>
            </motion.div>
          )}
        </div>
      )}
    </ToolLayout>
  );
};

export default PptToPdf;
