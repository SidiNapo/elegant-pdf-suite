import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Split, Download, CheckCircle } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import FileUpload from '@/components/FileUpload';
import ProcessingLoader from '@/components/ProcessingLoader';
import { splitPDF, downloadPDFsAsZip } from '@/lib/pdfUtils';
import { motion } from 'framer-motion';

const SplitPDF = () => {
  const { t } = useTranslation();
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [splitPages, setSplitPages] = useState<Uint8Array[]>([]);

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setIsComplete(false);
    setSplitPages([]);
  };

  const handleSplit = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    try {
      const result = await splitPDF(files[0]);
      setSplitPages(result);
      setIsComplete(true);
    } catch (error) {
      console.error('Error splitting PDF:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (splitPages.length > 0) {
      const pdfFiles = splitPages.map((data, index) => ({ data, name: `page_${index + 1}.pdf` }));
      downloadPDFsAsZip(pdfFiles, 'split_pages.zip');
    }
  };

  const handleReset = () => {
    setFiles([]);
    setIsComplete(false);
    setSplitPages([]);
  };

  return (
    <ToolLayout title={t('tools.split.title')} description={t('tools.split.longDescription')} icon={Split} color="rose">
      <div className="max-w-3xl mx-auto">
        {isProcessing ? (
          <ProcessingLoader message={t('tools.split.processing')} />
        ) : isComplete ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">{t('tools.split.success')}</h3>
            <p className="text-muted-foreground mb-8">{t('tools.split.successDesc', { count: splitPages.length })}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={handleDownload} className="btn-primary flex items-center justify-center gap-2">
                <Download className="w-5 h-5" /> {t('tools.split.download')}
              </button>
              <button onClick={handleReset} className="btn-secondary">{t('tools.split.reset')}</button>
            </div>
          </motion.div>
        ) : (
          <>
            <FileUpload onFilesSelected={handleFilesSelected} accept=".pdf" multiple={false} files={files} />
            {files.length === 1 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center">
                <button onClick={handleSplit} className="btn-primary">{t('tools.split.splitButton')}</button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </ToolLayout>
  );
};

export default SplitPDF;
