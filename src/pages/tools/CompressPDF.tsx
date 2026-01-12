import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Minimize2, Download, CheckCircle } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import FileUpload from '@/components/FileUpload';
import ProcessingLoader from '@/components/ProcessingLoader';
import { compressPDF, downloadPDF } from '@/lib/pdfUtils';
import { motion } from 'framer-motion';

const CompressPDF = () => {
  const { t } = useTranslation();
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [resultPdf, setResultPdf] = useState<Uint8Array | null>(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setIsComplete(false);
    setResultPdf(null);
    if (selectedFiles.length > 0) setOriginalSize(selectedFiles[0].size);
  };

  const handleCompress = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    try {
      const result = await compressPDF(files[0]);
      setResultPdf(result);
      setCompressedSize(result.length);
      setIsComplete(true);
    } catch (error) {
      console.error('Error compressing PDF:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => { if (resultPdf) downloadPDF(resultPdf, 'compressed.pdf'); };
  const handleReset = () => { setFiles([]); setIsComplete(false); setResultPdf(null); setOriginalSize(0); setCompressedSize(0); };
  const formatSize = (bytes: number) => bytes < 1024 ? bytes + ' B' : bytes < 1024 * 1024 ? (bytes / 1024).toFixed(1) + ' KB' : (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  const compressionRatio = originalSize > 0 ? Math.round((1 - compressedSize / originalSize) * 100) : 0;

  return (
    <ToolLayout title={t('tools.compress.title')} description={t('tools.compress.longDescription')} icon={Minimize2} color="violet">
      <div className="max-w-3xl mx-auto">
        {isProcessing ? (
          <ProcessingLoader message={t('tools.compress.processing')} />
        ) : isComplete ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">{t('tools.compress.success')}</h3>
            <div className="glass-card rounded-2xl p-6 mb-8 max-w-md mx-auto">
              <div className="grid grid-cols-2 gap-6">
                <div><p className="text-muted-foreground text-sm mb-1">{t('tools.compress.originalSize')}</p><p className="text-xl font-semibold">{formatSize(originalSize)}</p></div>
                <div><p className="text-muted-foreground text-sm mb-1">{t('tools.compress.newSize')}</p><p className="text-xl font-semibold text-primary">{formatSize(compressedSize)}</p></div>
              </div>
              <div className="mt-4 pt-4 border-t border-border"><p className="text-muted-foreground text-sm mb-1">{t('tools.compress.reduction')}</p><p className="text-2xl font-bold gradient-text">{compressionRatio}%</p></div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={handleDownload} className="btn-primary flex items-center justify-center gap-2"><Download className="w-5 h-5" /> {t('tools.compress.download')}</button>
              <button onClick={handleReset} className="btn-secondary">{t('tools.compress.reset')}</button>
            </div>
          </motion.div>
        ) : (
          <>
            <FileUpload onFilesSelected={handleFilesSelected} accept=".pdf" multiple={false} files={files} />
            {files.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center">
                <p className="text-muted-foreground mb-4">{t('tools.compress.currentSize')}: <span className="font-semibold text-foreground">{formatSize(originalSize)}</span></p>
                <button onClick={handleCompress} className="btn-primary">{t('tools.compress.compressButton')}</button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </ToolLayout>
  );
};

export default CompressPDF;
