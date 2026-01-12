import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Download, CheckCircle } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import FileUpload from '@/components/FileUpload';
import ProcessingLoader from '@/components/ProcessingLoader';
import { pdfToImages, downloadImagesAsZip } from '@/lib/pdfUtils';
import { motion } from 'framer-motion';

const PdfToJpg = () => {
  const { t } = useTranslation();
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  const handleFilesSelected = (selectedFiles: File[]) => { setFiles(selectedFiles); setIsComplete(false); setImages([]); };
  const handleConvert = async () => { if (files.length === 0) return; setIsProcessing(true); try { const result = await pdfToImages(files[0]); setImages(result); setIsComplete(true); } catch (error) { console.error('Error converting PDF to images:', error); } finally { setIsProcessing(false); } };
  const handleDownload = () => { if (images.length > 0) { const baseName = files[0].name.replace('.pdf', ''); downloadImagesAsZip(images, baseName); } };
  const handleReset = () => { setFiles([]); setIsComplete(false); setImages([]); };

  return (
    <ToolLayout title={t('tools.pdfToJpg.title')} description={t('tools.pdfToJpg.description')} icon={Image} color="violet">
      <div className="max-w-4xl mx-auto">
        {isProcessing ? (<ProcessingLoader message={t('tools.pdfToJpg.processing')} />) : isComplete ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6"><CheckCircle className="w-10 h-10 text-green-500" /></div>
              <h3 className="text-2xl font-semibold mb-4">{t('tools.pdfToJpg.success')}</h3>
              <p className="text-muted-foreground">{t('tools.pdfToJpg.imagesExtracted', { count: images.length })}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
              {images.slice(0, 8).map((image, index) => (<motion.div key={index} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }} className="glass-card rounded-xl overflow-hidden aspect-[3/4]"><img src={image} alt={`Page ${index + 1}`} className="w-full h-full object-cover" /></motion.div>))}
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={handleDownload} className="btn-primary flex items-center justify-center gap-2"><Download className="w-5 h-5" />{t('tools.pdfToJpg.download')}</button>
              <button onClick={handleReset} className="btn-secondary">{t('tools.pdfToJpg.reset')}</button>
            </div>
          </motion.div>
        ) : (<><FileUpload onFilesSelected={handleFilesSelected} accept=".pdf" multiple={false} files={files} />{files.length > 0 && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center"><button onClick={handleConvert} className="btn-primary">{t('tools.pdfToJpg.convertButton')}</button></motion.div>)}</>)}
      </div>
    </ToolLayout>
  );
};

export default PdfToJpg;
