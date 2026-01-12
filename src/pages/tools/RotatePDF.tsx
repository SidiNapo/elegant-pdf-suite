import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RotateCw, Download, CheckCircle } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import FileUpload from '@/components/FileUpload';
import ProcessingLoader from '@/components/ProcessingLoader';
import { rotatePDF, downloadPDF } from '@/lib/pdfUtils';
import { motion } from 'framer-motion';

const RotatePDF = () => {
  const { t } = useTranslation();
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [resultPdf, setResultPdf] = useState<Uint8Array | null>(null);
  const [rotation, setRotation] = useState(90);

  const handleFilesSelected = (selectedFiles: File[]) => { setFiles(selectedFiles); setIsComplete(false); setResultPdf(null); };
  const handleRotate = async () => { if (files.length === 0) return; setIsProcessing(true); try { const result = await rotatePDF(files[0], rotation); setResultPdf(result); setIsComplete(true); } catch (error) { console.error('Error rotating PDF:', error); } finally { setIsProcessing(false); } };
  const handleDownload = () => { if (resultPdf) downloadPDF(resultPdf, 'rotated.pdf'); };
  const handleReset = () => { setFiles([]); setIsComplete(false); setResultPdf(null); setRotation(90); };

  const rotationOptions = [{ value: 90, label: '90°' }, { value: 180, label: '180°' }, { value: 270, label: '270°' }];

  return (
    <ToolLayout title={t('tools.rotate.title')} description={t('tools.rotate.description')} icon={RotateCw} color="cyan">
      <div className="max-w-3xl mx-auto">
        {isProcessing ? (<ProcessingLoader message={t('tools.rotate.processing')} />) : isComplete ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6"><CheckCircle className="w-10 h-10 text-green-500" /></div>
            <h3 className="text-2xl font-semibold mb-4">{t('tools.rotate.success')}</h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={handleDownload} className="btn-primary flex items-center justify-center gap-2"><Download className="w-5 h-5" />{t('tools.rotate.download')}</button>
              <button onClick={handleReset} className="btn-secondary">{t('tools.rotate.reset')}</button>
            </div>
          </motion.div>
        ) : (<><FileUpload onFilesSelected={handleFilesSelected} accept=".pdf" multiple={false} files={files} />{files.length > 0 && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8"><h3 className="text-lg font-semibold mb-4 text-center">{t('tools.rotate.selectRotation')}</h3><div className="flex flex-wrap gap-4 justify-center mb-8">{rotationOptions.map((option) => (<button key={option.value} onClick={() => setRotation(option.value)} className={`px-6 py-3 rounded-xl font-medium transition-all ${rotation === option.value ? 'bg-primary text-primary-foreground' : 'glass-card hover:bg-muted'}`}><RotateCw className="w-6 h-6 mx-auto mb-2" style={{ transform: `rotate(${option.value}deg)` }} />{option.label}</button>))}</div><div className="text-center"><button onClick={handleRotate} className="btn-primary">{t('tools.rotate.rotateButton')}</button></div></motion.div>)}</>)}
      </div>
    </ToolLayout>
  );
};

export default RotatePDF;
