import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Edit, Download, RotateCcw, Type, Trash2 } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import FileUpload from '@/components/FileUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ProcessingLoader from '@/components/ProcessingLoader';
import { readFileAsArrayBuffer, downloadPDF, pdfToImages } from '@/lib/pdfUtils';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { motion } from 'framer-motion';

interface TextAnnotation {
  id: number;
  x: number;
  y: number;
  text: string;
  page: number;
  fontSize: number;
  color: string;
}

const EditPDF = () => {
  const { t } = useTranslation();
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [pdfData, setPdfData] = useState<Uint8Array | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [annotations, setAnnotations] = useState<TextAnnotation[]>([]);
  const [newText, setNewText] = useState('');
  const [fontSize, setFontSize] = useState(14);
  const [textColor, setTextColor] = useState('#000000');
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFilesSelected = async (newFiles: File[]) => {
    if (newFiles.length === 0) return;
    
    setFiles(newFiles);
    setIsComplete(false);
    setPdfData(null);
    setAnnotations([]);
    setIsProcessing(true);
    
    try {
      const images = await pdfToImages(newFiles[0]);
      setPreviews(images);
    } catch (error) {
      console.error('Error loading PDF:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!containerRef.current || !newText.trim()) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setAnnotations(prev => [...prev, {
      id: Date.now(),
      x,
      y,
      text: newText,
      page: currentPage,
      fontSize,
      color: textColor
    }]);
    setNewText('');
  };

  const removeAnnotation = (id: number) => {
    setAnnotations(prev => prev.filter(a => a.id !== id));
  };

  const handleApply = async () => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    try {
      const arrayBuffer = await readFileAsArrayBuffer(files[0]);
      const pdf = await PDFDocument.load(arrayBuffer);
      const pages = pdf.getPages();
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      
      for (const annotation of annotations) {
        if (annotation.page < pages.length) {
          const page = pages[annotation.page];
          const { width, height } = page.getSize();
          
          const x = (annotation.x / 100) * width;
          const y = height - (annotation.y / 100) * height;
          
          const hex = annotation.color.replace('#', '');
          const r = parseInt(hex.substring(0, 2), 16) / 255;
          const g = parseInt(hex.substring(2, 4), 16) / 255;
          const b = parseInt(hex.substring(4, 6), 16) / 255;
          
          page.drawText(annotation.text, {
            x,
            y,
            size: annotation.fontSize,
            font,
            color: rgb(r, g, b),
          });
        }
      }
      
      const result = await pdf.save();
      setPdfData(result);
      setIsComplete(true);
    } catch (error) {
      console.error('Error editing PDF:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (pdfData && files[0]) {
      const name = files[0].name.replace('.pdf', '_edited.pdf');
      downloadPDF(pdfData, name);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setPreviews([]);
    setIsComplete(false);
    setPdfData(null);
    setAnnotations([]);
    setCurrentPage(0);
    setNewText('');
  };

  const currentPageAnnotations = annotations.filter(a => a.page === currentPage);

  return (
    <ToolLayout
      title={t('tools.edit.title')}
      description={t('tools.edit.description')}
      icon={Edit}
      color="cyan"
    >
      {isProcessing ? (
        <ProcessingLoader message={t('tools.edit.processing')} />
      ) : isComplete ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
            <Edit className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-foreground">{t('tools.edit.success')}</h3>
          <div className="flex gap-4 justify-center">
            <Button onClick={handleDownload} size="lg" className="gap-2">
              <Download className="w-5 h-5" />
              {t('tools.edit.download')}
            </Button>
            <Button onClick={handleReset} variant="outline" size="lg" className="gap-2">
              <RotateCcw className="w-5 h-5" />
              {t('tools.edit.reset')}
            </Button>
          </div>
        </motion.div>
      ) : previews.length > 0 ? (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-4 justify-center items-end">
            <div className="flex-1 min-w-[200px] max-w-[300px]">
              <label className="block text-sm font-medium mb-1">{t('tools.edit.addText')}</label>
              <Input
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder={t('tools.edit.textPlaceholder')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('tools.edit.fontSize')}</label>
              <Input
                type="number"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-20"
                min={8}
                max={72}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('tools.edit.color')}</label>
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer"
              />
            </div>
          </div>
          
          <p className="text-center text-sm text-muted-foreground">
            {newText ? t('tools.edit.clickToPlace') : t('tools.edit.enterTextFirst')}
          </p>
          
          {previews.length > 1 && (
            <div className="flex justify-center gap-2 flex-wrap">
              {previews.map((_, i) => (
                <Button
                  key={i}
                  variant={currentPage === i ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(i)}
                >
                  {t('tools.edit.page')} {i + 1}
                </Button>
              ))}
            </div>
          )}
          
          <div 
            ref={containerRef}
            className={`relative mx-auto max-w-2xl ${newText ? 'cursor-crosshair' : 'cursor-default'}`}
            onClick={handleClick}
          >
            <img
              src={previews[currentPage]}
              alt="PDF Preview"
              className="w-full rounded-lg shadow-lg"
              draggable={false}
            />
            
            {currentPageAnnotations.map(annotation => (
              <div
                key={annotation.id}
                className="absolute group"
                style={{
                  left: `${annotation.x}%`,
                  top: `${annotation.y}%`,
                  fontSize: `${annotation.fontSize}px`,
                  color: annotation.color,
                  transform: 'translateY(-100%)'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {annotation.text}
                <button
                  onClick={() => removeAnnotation(annotation.id)}
                  className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 bg-destructive text-destructive-foreground rounded-full p-1"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          
          <div className="flex justify-center gap-4">
            <Button 
              onClick={handleApply} 
              size="lg" 
              className="gap-2"
              disabled={annotations.length === 0}
            >
              <Edit className="w-5 h-5" />
              {t('tools.edit.applyButton')} ({annotations.length})
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

export default EditPDF;
