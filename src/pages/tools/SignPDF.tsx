import { useState, useRef, useEffect } from 'react';
import { PenTool, Download, RotateCcw, Trash2 } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import FileUpload from '@/components/FileUpload';
import { Button } from '@/components/ui/button';
import ProcessingLoader from '@/components/ProcessingLoader';
import { readFileAsArrayBuffer, downloadPDF, pdfToImages } from '@/lib/pdfUtils';
import { PDFDocument } from 'pdf-lib';
import { motion } from 'framer-motion';

const SignPDF = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [pdfData, setPdfData] = useState<Uint8Array | null>(null);
  const [step, setStep] = useState<'upload' | 'sign' | 'place'>('upload');
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [pdfPreview, setPdfPreview] = useState<string[]>([]);
  const [selectedPage, setSelectedPage] = useState(0);
  const [signaturePos, setSignaturePos] = useState({ x: 50, y: 50 });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const handleFilesSelected = async (newFiles: File[]) => {
    if (newFiles.length === 0) return;
    setFiles(newFiles);
    setIsComplete(false);
    setPdfData(null);
    setIsProcessing(true);
    
    try {
      const previews = await pdfToImages(newFiles[0]);
      setPdfPreview(previews);
      setStep('sign');
    } catch (error) {
      console.error('Error loading PDF:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (step === 'sign' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#1a1a2e';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, [step]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDrawing.current = true;
    const rect = canvasRef.current!.getBoundingClientRect();
    lastPos.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    
    lastPos.current = { x, y };
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  const clearCanvas = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')!;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const saveSignature = () => {
    if (canvasRef.current) {
      const data = canvasRef.current.toDataURL('image/png');
      setSignatureData(data);
      setStep('place');
    }
  };

  const handleApplySignature = async () => {
    if (!files[0] || !signatureData) return;
    
    setIsProcessing(true);
    try {
      const arrayBuffer = await readFileAsArrayBuffer(files[0]);
      const pdf = await PDFDocument.load(arrayBuffer);
      
      // Convert signature to PNG
      const signatureBytes = await fetch(signatureData).then(r => r.arrayBuffer());
      const signatureImage = await pdf.embedPng(signatureBytes);
      
      const page = pdf.getPage(selectedPage);
      const { width, height } = page.getSize();
      
      // Scale signature
      const sigWidth = 150;
      const sigHeight = (signatureImage.height / signatureImage.width) * sigWidth;
      
      page.drawImage(signatureImage, {
        x: (signaturePos.x / 100) * width,
        y: height - (signaturePos.y / 100) * height - sigHeight,
        width: sigWidth,
        height: sigHeight,
      });
      
      const result = await pdf.save();
      setPdfData(result);
      setIsComplete(true);
    } catch (error) {
      console.error('Error applying signature:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (pdfData && files[0]) {
      const name = files[0].name.replace('.pdf', '_signed.pdf');
      downloadPDF(pdfData, name);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setStep('upload');
    setSignatureData(null);
    setPdfPreview([]);
    setIsComplete(false);
    setPdfData(null);
    setSelectedPage(0);
    setSignaturePos({ x: 50, y: 50 });
  };

  return (
    <ToolLayout
      title="Signer PDF"
      description="Ajoutez votre signature électronique à vos documents PDF"
      icon={PenTool}
      color="violet"
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
            <PenTool className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-foreground">Document signé !</h3>
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
      ) : step === 'upload' ? (
        <FileUpload
          onFilesSelected={handleFilesSelected}
          accept=".pdf"
          multiple={false}
          maxFiles={1}
          files={files}
          title="Déposez votre fichier PDF ici"
          description="ou cliquez pour sélectionner"
        />
      ) : step === 'sign' ? (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-center">Dessinez votre signature</h3>
          
          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              width={400}
              height={150}
              className="border-2 border-dashed border-border rounded-lg cursor-crosshair bg-white"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
          </div>
          
          <div className="flex justify-center gap-4">
            <Button onClick={clearCanvas} variant="outline" className="gap-2">
              <Trash2 className="w-4 h-4" />
              Effacer
            </Button>
            <Button onClick={saveSignature} className="gap-2">
              <PenTool className="w-4 h-4" />
              Valider la signature
            </Button>
          </div>
        </div>
      ) : step === 'place' ? (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-center">Placez votre signature</h3>
          
          {pdfPreview.length > 1 && (
            <div className="flex justify-center gap-2 flex-wrap">
              {pdfPreview.map((_, i) => (
                <Button
                  key={i}
                  variant={selectedPage === i ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPage(i)}
                >
                  Page {i + 1}
                </Button>
              ))}
            </div>
          )}
          
          <div className="relative mx-auto max-w-md">
            <img
              src={pdfPreview[selectedPage]}
              alt="PDF Preview"
              className="w-full rounded-lg shadow-lg"
            />
            {signatureData && (
              <img
                src={signatureData}
                alt="Signature"
                className="absolute w-32 cursor-move border border-primary rounded"
                style={{
                  left: `${signaturePos.x}%`,
                  top: `${signaturePos.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                draggable={false}
              />
            )}
          </div>
          
          <div className="space-y-4 max-w-md mx-auto">
            <div>
              <label className="block text-sm font-medium mb-2">Position horizontale</label>
              <input
                type="range"
                min="10"
                max="90"
                value={signaturePos.x}
                onChange={(e) => setSignaturePos(p => ({ ...p, x: Number(e.target.value) }))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Position verticale</label>
              <input
                type="range"
                min="10"
                max="90"
                value={signaturePos.y}
                onChange={(e) => setSignaturePos(p => ({ ...p, y: Number(e.target.value) }))}
                className="w-full"
              />
            </div>
          </div>
          
          <div className="flex justify-center gap-4">
            <Button onClick={() => setStep('sign')} variant="outline">
              Modifier la signature
            </Button>
            <Button onClick={handleApplySignature} className="gap-2">
              <PenTool className="w-4 h-4" />
              Appliquer la signature
            </Button>
          </div>
        </div>
      ) : null}
    </ToolLayout>
  );
};

export default SignPDF;
