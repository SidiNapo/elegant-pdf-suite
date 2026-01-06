import { useState } from 'react';
import { Presentation, Download, RotateCcw } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import FileUpload from '@/components/FileUpload';
import { Button } from '@/components/ui/button';
import ProcessingLoader from '@/components/ProcessingLoader';
import { pdfToImages, createPowerPointFromImages } from '@/lib/pdfUtils';
import { motion } from 'framer-motion';

const PdfToPpt = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles(newFiles);
    setIsComplete(false);
    setImages([]);
  };

  const handleConvert = async () => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    try {
      const pageImages = await pdfToImages(files[0]);
      setImages(pageImages);
      setIsComplete(true);
    } catch (error) {
      console.error('Conversion error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (images.length > 0) {
      const originalName = files[0].name.replace(/\.pdf$/i, '');
      await createPowerPointFromImages(images, `${originalName}.pptx`);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setIsComplete(false);
    setImages([]);
  };

  return (
    <ToolLayout
      title="PDF en PowerPoint"
      description="Convertissez vos fichiers PDF en présentations PowerPoint"
      icon={Presentation}
      color="coral"
    >
      {isProcessing ? (
        <ProcessingLoader message="Conversion du PDF en diapositives..." />
      ) : isComplete ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
            <Presentation className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-foreground">Conversion terminée !</h3>
          <p className="text-muted-foreground">
            {images.length} diapositive(s) créée(s) avec succès
          </p>
          
          {/* Preview slides */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {images.slice(0, 8).map((img, index) => (
              <div key={index} className="aspect-video bg-muted rounded-lg overflow-hidden border">
                <img src={img} alt={`Slide ${index + 1}`} className="w-full h-full object-contain" />
              </div>
            ))}
            {images.length > 8 && (
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border">
                <span className="text-muted-foreground">+{images.length - 8} autres</span>
              </div>
            )}
          </div>
          
          <div className="flex gap-4 justify-center">
            <Button onClick={handleDownload} size="lg" className="gap-2">
              <Download className="w-5 h-5" />
              Télécharger PowerPoint
            </Button>
            <Button onClick={handleReset} variant="outline" size="lg" className="gap-2">
              <RotateCcw className="w-5 h-5" />
              Nouvelle conversion
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
                <Presentation className="w-5 h-5" />
                Convertir en PowerPoint
              </Button>
            </motion.div>
          )}
        </div>
      )}
    </ToolLayout>
  );
};

export default PdfToPpt;