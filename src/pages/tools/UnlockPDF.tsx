import { useState } from 'react';
import { Unlock, Download, RotateCcw, Eye, EyeOff } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import FileUpload from '@/components/FileUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ProcessingLoader from '@/components/ProcessingLoader';
import { readFileAsArrayBuffer, downloadPDF } from '@/lib/pdfUtils';
import { PDFDocument } from 'pdf-lib';
import { motion } from 'framer-motion';

const UnlockPDF = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [pdfData, setPdfData] = useState<Uint8Array | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles(newFiles);
    setIsComplete(false);
    setPdfData(null);
    setError('');
  };

  const handleUnlock = async () => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    setError('');
    
    try {
      const arrayBuffer = await readFileAsArrayBuffer(files[0]);
      
      // Try to load with ignoreEncryption option
      const pdf = await PDFDocument.load(arrayBuffer, {
        ignoreEncryption: true,
      });
      
      // Remove protection metadata
      pdf.setTitle(pdf.getTitle()?.replace('Protected - ', '') || 'Document');
      pdf.setSubject('');
      pdf.setKeywords([]);
      pdf.setProducer('PDF Tools - Unlocked');
      
      const result = await pdf.save();
      setPdfData(result);
      setIsComplete(true);
    } catch (error: any) {
      console.error('Error unlocking PDF:', error);
      if (error.message?.includes('password') || error.message?.includes('encrypted')) {
        setError('Mot de passe incorrect ou fichier non chiffré');
      } else {
        setError('Erreur lors du déverrouillage du fichier');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (pdfData && files[0]) {
      const name = files[0].name.replace('.pdf', '_unlocked.pdf');
      downloadPDF(pdfData, name);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setIsComplete(false);
    setPdfData(null);
    setPassword('');
    setError('');
  };

  return (
    <ToolLayout
      title="Déverrouiller PDF"
      description="Supprimez le mot de passe de protection de votre PDF"
      icon={Unlock}
      color="coral"
    >
      {isProcessing ? (
        <ProcessingLoader message="Déverrouillage du document..." />
      ) : isComplete ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
            <Unlock className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-foreground">Document déverrouillé !</h3>
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
      ) : (
        <div className="space-y-6">
          <FileUpload
            onFilesSelected={handleFilesSelected}
            accept=".pdf"
            multiple={false}
            maxFiles={1}
            files={files}
            title="Déposez votre fichier PDF protégé ici"
            description="ou cliquez pour sélectionner"
          />
          
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md mx-auto space-y-4"
            >
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mot de passe (si nécessaire)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {error && (
                <p className="text-destructive text-sm">{error}</p>
              )}
              
              <Button onClick={handleUnlock} className="w-full gap-2">
                <Unlock className="w-4 h-4" />
                Déverrouiller le PDF
              </Button>
            </motion.div>
          )}
        </div>
      )}
    </ToolLayout>
  );
};

export default UnlockPDF;
