import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Crop, Download, RotateCcw } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import FileUpload from '@/components/FileUpload';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import ProcessingLoader from '@/components/ProcessingLoader';
import { readFileAsArrayBuffer, downloadPDF, pdfToImages } from '@/lib/pdfUtils';
import { PDFDocument } from 'pdf-lib';
import { motion } from 'framer-motion';

const CropPDF = () => {
  const { t } = useTranslation();
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [pdfData, setPdfData] = useState<Uint8Array | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [cropMargins, setCropMargins] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  });

  const handleFilesSelected = async (newFiles: File[]) => {
    if (newFiles.length === 0) return;
    
    setFiles(newFiles);
    setIsComplete(false);
    setPdfData(null);
    setIsProcessing(true);
    
    try {
      const previews = await pdfToImages(newFiles[0]);
      setPreview(previews[0]);
    } catch (error) {
      console.error('Error loading PDF:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCrop = async () => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    try {
      const arrayBuffer = await readFileAsArrayBuffer(files[0]);
      const pdf = await PDFDocument.load(arrayBuffer);
      const pages = pdf.getPages();
      
      for (const page of pages) {
        const { width, height } = page.getSize();
        
        const cropLeft = (cropMargins.left / 100) * width;
        const cropRight = width - (cropMargins.right / 100) * width;
        const cropBottom = (cropMargins.bottom / 100) * height;
        const cropTop = height - (cropMargins.top / 100) * height;
        
        page.setCropBox(cropLeft, cropBottom, cropRight - cropLeft, cropTop - cropBottom);
      }
      
      const result = await pdf.save();
      setPdfData(result);
      setIsComplete(true);
    } catch (error) {
      console.error('Error cropping PDF:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (pdfData && files[0]) {
      const name = files[0].name.replace('.pdf', '_cropped.pdf');
      downloadPDF(pdfData, name);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setPreview(null);
    setIsComplete(false);
    setPdfData(null);
    setCropMargins({ top: 0, right: 0, bottom: 0, left: 0 });
  };

  return (
    <ToolLayout
      title={t('tools.crop.title')}
      description={t('tools.crop.description')}
      icon={Crop}
      color="violet"
    >
      {isProcessing ? (
        <ProcessingLoader message={t('tools.crop.processing')} />
      ) : isComplete ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
            <Crop className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-foreground">{t('tools.crop.success')}</h3>
          <div className="flex gap-4 justify-center">
            <Button onClick={handleDownload} size="lg" className="gap-2">
              <Download className="w-5 h-5" />
              {t('tools.crop.download')}
            </Button>
            <Button onClick={handleReset} variant="outline" size="lg" className="gap-2">
              <RotateCcw className="w-5 h-5" />
              {t('tools.crop.reset')}
            </Button>
          </div>
        </motion.div>
      ) : preview ? (
        <div className="space-y-6">
          <div className="relative mx-auto max-w-md">
            <div 
              className="relative overflow-hidden rounded-lg shadow-lg"
              style={{
                clipPath: `inset(${cropMargins.top}% ${cropMargins.right}% ${cropMargins.bottom}% ${cropMargins.left}%)`
              }}
            >
              <img
                src={preview}
                alt="PDF Preview"
                className="w-full"
              />
            </div>
            <div 
              className="absolute inset-0 border-2 border-dashed border-primary rounded-lg pointer-events-none"
              style={{
                top: `${cropMargins.top}%`,
                right: `${cropMargins.right}%`,
                bottom: `${cropMargins.bottom}%`,
                left: `${cropMargins.left}%`
              }}
            />
          </div>
          
          <div className="max-w-md mx-auto space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">{t('tools.crop.top')}: {cropMargins.top}%</label>
              <Slider
                value={[cropMargins.top]}
                onValueChange={([v]) => setCropMargins(m => ({ ...m, top: v }))}
                max={40}
                step={1}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t('tools.crop.right')}: {cropMargins.right}%</label>
              <Slider
                value={[cropMargins.right]}
                onValueChange={([v]) => setCropMargins(m => ({ ...m, right: v }))}
                max={40}
                step={1}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t('tools.crop.bottom')}: {cropMargins.bottom}%</label>
              <Slider
                value={[cropMargins.bottom]}
                onValueChange={([v]) => setCropMargins(m => ({ ...m, bottom: v }))}
                max={40}
                step={1}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t('tools.crop.left')}: {cropMargins.left}%</label>
              <Slider
                value={[cropMargins.left]}
                onValueChange={([v]) => setCropMargins(m => ({ ...m, left: v }))}
                max={40}
                step={1}
              />
            </div>
          </div>
          
          <div className="flex justify-center gap-4">
            <Button onClick={handleCrop} size="lg" className="gap-2">
              <Crop className="w-5 h-5" />
              {t('tools.crop.cropButton')}
            </Button>
            <Button onClick={handleReset} variant="outline" size="lg">
              {t('common.cancel')}
            </Button>
          </div>
        </div>
      ) : (
        <FileUpload
          onFilesSelected={handleFilesSelected}
          accept=".pdf"
          multiple={false}
          maxFiles={1}
          files={files}
        />
      )}
    </ToolLayout>
  );
};

export default CropPDF;
