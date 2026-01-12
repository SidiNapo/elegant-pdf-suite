import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Wrench, Download, RotateCcw, AlertCircle, CheckCircle } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import FileUpload from '@/components/FileUpload';
import { Button } from '@/components/ui/button';
import ProcessingLoader from '@/components/ProcessingLoader';
import { readFileAsArrayBuffer, downloadPDF } from '@/lib/pdfUtils';
import { PDFDocument } from 'pdf-lib';
import { motion } from 'framer-motion';

const RepairPDF = () => {
  const { t } = useTranslation();
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [pdfData, setPdfData] = useState<Uint8Array | null>(null);
  const [repairStatus, setRepairStatus] = useState<'success' | 'partial' | 'failed' | null>(null);
  const [repairDetails, setRepairDetails] = useState<string[]>([]);

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles(newFiles);
    setIsComplete(false);
    setPdfData(null);
    setRepairStatus(null);
    setRepairDetails([]);
  };

  const handleRepair = async () => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    const details: string[] = [];
    
    try {
      const arrayBuffer = await readFileAsArrayBuffer(files[0]);
      
      let pdf: PDFDocument;
      
      try {
        pdf = await PDFDocument.load(arrayBuffer, {
          ignoreEncryption: true,
          updateMetadata: true,
        });
        details.push(`✓ ${t('tools.repair.structureLoaded')}`);
      } catch (loadError) {
        details.push(`⚠ ${t('tools.repair.attemptingRepair')}`);
        
        try {
          pdf = await PDFDocument.load(arrayBuffer, {
            ignoreEncryption: true,
            updateMetadata: true,
            throwOnInvalidObject: false,
          } as any);
          details.push(`✓ ${t('tools.repair.partiallyRecovered')}`);
        } catch {
          setRepairStatus('failed');
          setRepairDetails([`✗ ${t('tools.repair.cannotLoad')}`]);
          setIsComplete(true);
          setIsProcessing(false);
          return;
        }
      }
      
      const pageCount = pdf.getPageCount();
      details.push(`✓ ${pageCount} ${t('tools.repair.pagesRecovered')}`);
      
      pdf.setProducer('PDF Tools - Repaired');
      pdf.setModificationDate(new Date());
      details.push(`✓ ${t('tools.repair.metadataUpdated')}`);
      
      const result = await pdf.save({
        useObjectStreams: true,
      });
      
      details.push(`✓ ${t('tools.repair.rebuilt')}`);
      
      setPdfData(result);
      setRepairStatus(pageCount > 0 ? 'success' : 'partial');
      setRepairDetails(details);
      setIsComplete(true);
    } catch (error) {
      console.error('Error repairing PDF:', error);
      setRepairStatus('failed');
      setRepairDetails([...details, `✗ ${t('tools.repair.errorRepairing')}`]);
      setIsComplete(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (pdfData && files[0]) {
      const name = files[0].name.replace('.pdf', '_repaired.pdf');
      downloadPDF(pdfData, name);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setIsComplete(false);
    setPdfData(null);
    setRepairStatus(null);
    setRepairDetails([]);
  };

  return (
    <ToolLayout
      title={t('tools.repair.title')}
      description={t('tools.repair.description')}
      icon={Wrench}
      color="cyan"
    >
      {isProcessing ? (
        <ProcessingLoader message={t('tools.repair.processing')} />
      ) : isComplete ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
            repairStatus === 'success' ? 'bg-gradient-to-br from-green-400 to-emerald-500' :
            repairStatus === 'partial' ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
            'bg-gradient-to-br from-red-400 to-red-500'
          }`}>
            {repairStatus === 'failed' ? (
              <AlertCircle className="w-10 h-10 text-white" />
            ) : (
              <CheckCircle className="w-10 h-10 text-white" />
            )}
          </div>
          
          <h3 className="text-2xl font-bold text-foreground">
            {repairStatus === 'success' ? t('tools.repair.success') :
             repairStatus === 'partial' ? t('tools.repair.partial') :
             t('tools.repair.failed')}
          </h3>
          
          <div className="bg-muted rounded-lg p-4 text-left max-w-md mx-auto">
            <h4 className="font-semibold mb-2">{t('tools.repair.report')}:</h4>
            <ul className="space-y-1 text-sm">
              {repairDetails.map((detail, i) => (
                <li key={i} className={
                  detail.startsWith('✓') ? 'text-green-600 dark:text-green-400' :
                  detail.startsWith('⚠') ? 'text-yellow-600 dark:text-yellow-400' :
                  detail.startsWith('✗') ? 'text-red-600 dark:text-red-400' :
                  'text-muted-foreground'
                }>
                  {detail}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex gap-4 justify-center">
            {pdfData && (
              <Button onClick={handleDownload} size="lg" className="gap-2">
                <Download className="w-5 h-5" />
                {t('tools.repair.download')}
              </Button>
            )}
            <Button onClick={handleReset} variant="outline" size="lg" className="gap-2">
              <RotateCcw className="w-5 h-5" />
              {t('tools.repair.reset')}
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
          />
          
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center"
            >
              <Button onClick={handleRepair} size="lg" className="gap-2">
                <Wrench className="w-5 h-5" />
                {t('tools.repair.repairButton')}
              </Button>
            </motion.div>
          )}
        </div>
      )}
    </ToolLayout>
  );
};

export default RepairPDF;
