import { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ScanLine, Download, RotateCcw, Camera, Trash2, Plus } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import FileUpload from '@/components/FileUpload';
import { Button } from '@/components/ui/button';
import ProcessingLoader from '@/components/ProcessingLoader';
import { imagesToPDF, downloadPDF } from '@/lib/pdfUtils';
import { motion } from 'framer-motion';

const ScanToPdf = () => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<'select' | 'camera' | 'upload'>('select');
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [pdfData, setPdfData] = useState<Uint8Array | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setMode('camera');
    } catch (error) {
      console.error('Camera error:', error);
      setCameraError(t('tools.scanToPdf.cameraError'));
    }
  };

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const captureImage = () => {
    if (!videoRef.current) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(videoRef.current, 0, 0);
    
    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImages(prev => [...prev, imageData]);
  };

  const removeImage = (index: number) => {
    setCapturedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleFilesSelected = (files: File[]) => {
    setUploadedFiles(files);
    setMode('upload');
  };

  const handleCreatePdf = async () => {
    setIsProcessing(true);
    
    try {
      let filesToConvert: File[] = [];
      
      if (mode === 'camera' && capturedImages.length > 0) {
        filesToConvert = await Promise.all(
          capturedImages.map(async (dataUrl, i) => {
            const response = await fetch(dataUrl);
            const blob = await response.blob();
            return new File([blob], `scan_${i + 1}.jpg`, { type: 'image/jpeg' });
          })
        );
      } else if (mode === 'upload' && uploadedFiles.length > 0) {
        filesToConvert = uploadedFiles;
      }
      
      if (filesToConvert.length > 0) {
        const result = await imagesToPDF(filesToConvert);
        setPdfData(result);
        setIsComplete(true);
        stopCamera();
      }
    } catch (error) {
      console.error('Error creating PDF:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (pdfData) {
      downloadPDF(pdfData, 'scanned_document.pdf');
    }
  };

  const handleReset = () => {
    stopCamera();
    setMode('select');
    setCapturedImages([]);
    setUploadedFiles([]);
    setIsComplete(false);
    setPdfData(null);
    setCameraError(null);
  };

  return (
    <ToolLayout
      title={t('tools.scanToPdf.title')}
      description={t('tools.scanToPdf.description')}
      icon={ScanLine}
      color="rose"
    >
      {isProcessing ? (
        <ProcessingLoader message={t('tools.scanToPdf.processing')} />
      ) : isComplete ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
            <ScanLine className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-foreground">{t('tools.scanToPdf.success')}</h3>
          <div className="flex gap-4 justify-center">
            <Button onClick={handleDownload} size="lg" className="gap-2">
              <Download className="w-5 h-5" />
              {t('common.download')}
            </Button>
            <Button onClick={handleReset} variant="outline" size="lg" className="gap-2">
              <RotateCcw className="w-5 h-5" />
              {t('tools.scanToPdf.reset')}
            </Button>
          </div>
        </motion.div>
      ) : mode === 'select' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={startCamera}
              className="p-8 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors"
            >
              <Camera className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">{t('tools.scanToPdf.useCamera')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('tools.scanToPdf.useCameraDesc')}
              </p>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setMode('upload')}
              className="p-8 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors"
            >
              <ScanLine className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">{t('tools.scanToPdf.importImages')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('tools.scanToPdf.importImagesDesc')}
              </p>
            </motion.button>
          </div>
          
          {cameraError && (
            <p className="text-destructive text-center">{cameraError}</p>
          )}
        </div>
      ) : mode === 'camera' ? (
        <div className="space-y-6">
          <div className="relative max-w-2xl mx-auto rounded-lg overflow-hidden bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full"
            />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
              <Button onClick={captureImage} size="lg" className="gap-2 rounded-full">
                <Camera className="w-5 h-5" />
                {t('tools.scanToPdf.capture')}
              </Button>
            </div>
          </div>
          
          {capturedImages.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-semibold">{t('tools.scanToPdf.capturedImages', { count: capturedImages.length })}</h4>
              <div className="flex gap-4 overflow-x-auto pb-4">
                {capturedImages.map((img, i) => (
                  <div key={i} className="relative shrink-0">
                    <img
                      src={img}
                      alt={`Capture ${i + 1}`}
                      className="h-32 w-auto rounded-lg"
                    />
                    <button
                      onClick={() => removeImage(i)}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex gap-4 justify-center">
            {capturedImages.length > 0 && (
              <Button onClick={handleCreatePdf} size="lg" className="gap-2">
                <ScanLine className="w-5 h-5" />
                {t('tools.scanToPdf.createPdf', { count: capturedImages.length })}
              </Button>
            )}
            <Button onClick={handleReset} variant="outline" size="lg">
              {t('common.cancel')}
            </Button>
          </div>
        </div>
      ) : mode === 'upload' ? (
        <div className="space-y-6">
          <FileUpload
            onFilesSelected={handleFilesSelected}
            accept=".jpg,.jpeg,.png"
            multiple={true}
            maxFiles={20}
            files={uploadedFiles}
          />
          
          {uploadedFiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4 justify-center"
            >
              <Button onClick={handleCreatePdf} size="lg" className="gap-2">
                <ScanLine className="w-5 h-5" />
                {t('tools.scanToPdf.createPdf', { count: uploadedFiles.length })}
              </Button>
              <Button onClick={handleReset} variant="outline" size="lg">
                {t('common.cancel')}
              </Button>
            </motion.div>
          )}
          
          {uploadedFiles.length === 0 && (
            <div className="flex justify-center">
              <Button onClick={handleReset} variant="outline">
                {t('tools.scanToPdf.back')}
              </Button>
            </div>
          )}
        </div>
      ) : null}
    </ToolLayout>
  );
};

export default ScanToPdf;
