import { useState, useRef } from 'react';
import { EyeOff, Download, RotateCcw, Square } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import FileUpload from '@/components/FileUpload';
import { Button } from '@/components/ui/button';
import ProcessingLoader from '@/components/ProcessingLoader';
import { readFileAsArrayBuffer, downloadPDF, pdfToImages } from '@/lib/pdfUtils';
import { PDFDocument, rgb } from 'pdf-lib';
import { motion } from 'framer-motion';

interface RedactArea {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
}

const RedactPDF = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [pdfData, setPdfData] = useState<Uint8Array | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [redactAreas, setRedactAreas] = useState<RedactArea[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFilesSelected = async (newFiles: File[]) => {
    if (newFiles.length === 0) return;
    
    setFiles(newFiles);
    setIsComplete(false);
    setPdfData(null);
    setRedactAreas([]);
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

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setIsDrawing(true);
    setStartPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100
    });
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDrawing || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const endX = ((e.clientX - rect.left) / rect.width) * 100;
    const endY = ((e.clientY - rect.top) / rect.height) * 100;
    
    const width = Math.abs(endX - startPos.x);
    const height = Math.abs(endY - startPos.y);
    
    if (width > 2 && height > 2) {
      setRedactAreas(prev => [...prev, {
        id: Date.now(),
        x: Math.min(startPos.x, endX),
        y: Math.min(startPos.y, endY),
        width,
        height,
        page: currentPage
      }]);
    }
    
    setIsDrawing(false);
  };

  const removeRedactArea = (id: number) => {
    setRedactAreas(prev => prev.filter(area => area.id !== id));
  };

  const handleRedact = async () => {
    if (files.length === 0 || redactAreas.length === 0) return;
    
    setIsProcessing(true);
    try {
      const arrayBuffer = await readFileAsArrayBuffer(files[0]);
      const pdf = await PDFDocument.load(arrayBuffer);
      const pages = pdf.getPages();
      
      for (const area of redactAreas) {
        if (area.page < pages.length) {
          const page = pages[area.page];
          const { width, height } = page.getSize();
          
          // Convert percentage to actual coordinates
          const x = (area.x / 100) * width;
          const y = height - ((area.y + area.height) / 100) * height;
          const w = (area.width / 100) * width;
          const h = (area.height / 100) * height;
          
          // Draw black rectangle
          page.drawRectangle({
            x,
            y,
            width: w,
            height: h,
            color: rgb(0, 0, 0),
          });
        }
      }
      
      const result = await pdf.save();
      setPdfData(result);
      setIsComplete(true);
    } catch (error) {
      console.error('Error redacting PDF:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (pdfData && files[0]) {
      const name = files[0].name.replace('.pdf', '_redacted.pdf');
      downloadPDF(pdfData, name);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setPreviews([]);
    setIsComplete(false);
    setPdfData(null);
    setRedactAreas([]);
    setCurrentPage(0);
  };

  const currentPageAreas = redactAreas.filter(a => a.page === currentPage);

  return (
    <ToolLayout
      title="Censurer PDF"
      description="Masquez définitivement le contenu sensible de votre PDF"
      icon={EyeOff}
      color="cyan"
    >
      {isProcessing ? (
        <ProcessingLoader message="Traitement en cours..." />
      ) : isComplete ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
            <EyeOff className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-foreground">Censure appliquée !</h3>
          <p className="text-muted-foreground">Le contenu sélectionné a été définitivement masqué</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={handleDownload} size="lg" className="gap-2">
              <Download className="w-5 h-5" />
              Télécharger
            </Button>
            <Button onClick={handleReset} variant="outline" size="lg" className="gap-2">
              <RotateCcw className="w-5 h-5" />
              Nouveau fichier
            </Button>
          </div>
        </motion.div>
      ) : previews.length > 0 ? (
        <div className="space-y-6">
          <p className="text-center text-muted-foreground">
            Dessinez des rectangles sur les zones à censurer
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
                  Page {i + 1}
                </Button>
              ))}
            </div>
          )}
          
          <div 
            ref={containerRef}
            className="relative mx-auto max-w-2xl cursor-crosshair"
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
          >
            <img
              src={previews[currentPage]}
              alt="PDF Preview"
              className="w-full rounded-lg shadow-lg"
              draggable={false}
            />
            
            {currentPageAreas.map(area => (
              <div
                key={area.id}
                className="absolute bg-black cursor-pointer hover:opacity-80 group"
                style={{
                  left: `${area.x}%`,
                  top: `${area.y}%`,
                  width: `${area.width}%`,
                  height: `${area.height}%`
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  removeRedactArea(area.id);
                }}
              >
                <span className="absolute inset-0 flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100">
                  Cliquez pour supprimer
                </span>
              </div>
            ))}
          </div>
          
          <div className="flex justify-center gap-4">
            <Button 
              onClick={handleRedact} 
              size="lg" 
              className="gap-2"
              disabled={redactAreas.length === 0}
            >
              <EyeOff className="w-5 h-5" />
              Appliquer la censure ({redactAreas.length} zone{redactAreas.length > 1 ? 's' : ''})
            </Button>
            <Button onClick={handleReset} variant="outline" size="lg">
              Annuler
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
          title="Déposez votre fichier PDF ici"
          description="ou cliquez pour sélectionner"
        />
      )}
    </ToolLayout>
  );
};

export default RedactPDF;
