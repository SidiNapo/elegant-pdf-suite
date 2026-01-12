import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Droplets, Download, CheckCircle } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import FileUpload from '@/components/FileUpload';
import ProcessingLoader from '@/components/ProcessingLoader';
import { addWatermark, downloadPDF } from '@/lib/pdfUtils';
import { motion } from 'framer-motion';

const Watermark = () => {
  const { t } = useTranslation();
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [resultPdf, setResultPdf] = useState<Uint8Array | null>(null);
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [opacity, setOpacity] = useState(0.3);

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setIsComplete(false);
    setResultPdf(null);
  };

  const handleAddWatermark = async () => {
    if (files.length === 0 || !watermarkText.trim()) return;
    
    setIsProcessing(true);
    try {
      const result = await addWatermark(files[0], watermarkText, opacity);
      setResultPdf(result);
      setIsComplete(true);
    } catch (error) {
      console.error('Error adding watermark:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (resultPdf) {
      downloadPDF(resultPdf, 'watermarked.pdf');
    }
  };

  const handleReset = () => {
    setFiles([]);
    setIsComplete(false);
    setResultPdf(null);
  };

  const presets = ['CONFIDENTIAL', 'DRAFT', 'COPY', 'SAMPLE', 'URGENT'];

  return (
    <ToolLayout
      title={t('tools.watermark.title')}
      description={t('tools.watermark.description')}
      icon={Droplets}
      color="rose"
    >
      <div className="max-w-3xl mx-auto">
        {isProcessing ? (
          <ProcessingLoader message={t('tools.watermark.processing')} />
        ) : isComplete ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">{t('tools.watermark.success')}</h3>
            <p className="text-muted-foreground mb-8">
              {t('tools.watermark.successDesc', { text: watermarkText })}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={handleDownload} className="btn-primary flex items-center justify-center gap-2">
                <Download className="w-5 h-5" />
                {t('tools.watermark.download')}
              </button>
              <button onClick={handleReset} className="btn-secondary">
                {t('tools.watermark.reset')}
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
            />
            
            {files.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 space-y-8"
              >
                {/* Watermark Text */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-center">{t('tools.watermark.text')}</h3>
                  <input
                    type="text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    placeholder={t('tools.watermark.textPlaceholder')}
                    className="w-full glass-card rounded-xl px-4 py-3 text-center text-lg bg-transparent border border-border focus:border-primary focus:outline-none transition-colors"
                  />
                  <div className="flex flex-wrap gap-2 justify-center mt-4">
                    {presets.map((preset) => (
                      <button
                        key={preset}
                        onClick={() => setWatermarkText(preset)}
                        className="px-3 py-1 rounded-lg text-sm glass-card hover:bg-muted transition-colors"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Opacity */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-center">
                    {t('tools.watermark.opacity')}: {Math.round(opacity * 100)}%
                  </h3>
                  <input
                    type="range"
                    min="0.1"
                    max="0.8"
                    step="0.1"
                    value={opacity}
                    onChange={(e) => setOpacity(parseFloat(e.target.value))}
                    className="w-full max-w-md mx-auto block"
                  />
                </div>
                
                <div className="text-center">
                  <button 
                    onClick={handleAddWatermark} 
                    className="btn-primary"
                    disabled={!watermarkText.trim()}
                  >
                    {t('tools.watermark.addButton')}
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

export default Watermark;
