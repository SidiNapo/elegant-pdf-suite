import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutGrid, Download, RotateCcw, GripVertical } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import FileUpload from '@/components/FileUpload';
import { Button } from '@/components/ui/button';
import ProcessingLoader from '@/components/ProcessingLoader';
import { pdfToImages, readFileAsArrayBuffer, downloadPDF } from '@/lib/pdfUtils';
import { PDFDocument } from 'pdf-lib';
import { motion, Reorder } from 'framer-motion';

interface PageItem {
  id: number;
  originalIndex: number;
  thumbnail: string;
}

const OrganizePDF = () => {
  const { t } = useTranslation();
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [pdfData, setPdfData] = useState<Uint8Array | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);

  const handleFilesSelected = async (newFiles: File[]) => {
    if (newFiles.length === 0) return;
    
    setFiles(newFiles);
    setIsComplete(false);
    setPdfData(null);
    setIsProcessing(true);
    
    try {
      const file = newFiles[0];
      setOriginalFile(file);
      const thumbnails = await pdfToImages(file);
      setPages(thumbnails.map((thumb, i) => ({
        id: i,
        originalIndex: i,
        thumbnail: thumb
      })));
    } catch (error) {
      console.error('Error loading PDF:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReorganize = async () => {
    if (!originalFile || pages.length === 0) return;
    
    setIsProcessing(true);
    try {
      const arrayBuffer = await readFileAsArrayBuffer(originalFile);
      const pdf = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();
      
      const newOrder = pages.map(p => p.originalIndex);
      const copiedPages = await newPdf.copyPages(pdf, newOrder);
      copiedPages.forEach(page => newPdf.addPage(page));
      
      const result = await newPdf.save();
      setPdfData(result);
      setIsComplete(true);
    } catch (error) {
      console.error('Error reorganizing PDF:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (pdfData && originalFile) {
      const name = originalFile.name.replace('.pdf', '_reorganized.pdf');
      downloadPDF(pdfData, name);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setPages([]);
    setIsComplete(false);
    setPdfData(null);
    setOriginalFile(null);
  };

  return (
    <ToolLayout
      title={t('tools.organize.title')}
      description={t('tools.organize.description')}
      icon={LayoutGrid}
      color="coral"
    >
      {isProcessing ? (
        <ProcessingLoader message={t('tools.organize.processing')} />
      ) : isComplete ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
            <LayoutGrid className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-foreground">{t('tools.organize.success')}</h3>
          <p className="text-muted-foreground">{t('tools.organize.successDesc')}</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={handleDownload} size="lg" className="gap-2">
              <Download className="w-5 h-5" />
              {t('tools.organize.download')}
            </Button>
            <Button onClick={handleReset} variant="outline" size="lg" className="gap-2">
              <RotateCcw className="w-5 h-5" />
              {t('tools.organize.reset')}
            </Button>
          </div>
        </motion.div>
      ) : pages.length > 0 ? (
        <div className="space-y-6">
          <p className="text-center text-muted-foreground">
            {t('tools.organize.dragHint')}
          </p>
          
          <Reorder.Group 
            axis="x" 
            values={pages} 
            onReorder={setPages}
            className="flex flex-wrap gap-4 justify-center"
          >
            {pages.map((page, index) => (
              <Reorder.Item
                key={page.id}
                value={page}
                className="relative cursor-grab active:cursor-grabbing"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative bg-card rounded-lg overflow-hidden shadow-lg border border-border"
                >
                  <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded">
                    {index + 1}
                  </div>
                  <div className="absolute top-2 right-2 text-muted-foreground">
                    <GripVertical className="w-4 h-4" />
                  </div>
                  <img
                    src={page.thumbnail}
                    alt={`Page ${page.originalIndex + 1}`}
                    className="w-32 h-44 object-cover"
                    draggable={false}
                  />
                </motion.div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
          
          <div className="flex justify-center gap-4">
            <Button onClick={handleReorganize} size="lg" className="gap-2">
              <LayoutGrid className="w-5 h-5" />
              {t('tools.organize.organizeButton')}
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

export default OrganizePDF;
