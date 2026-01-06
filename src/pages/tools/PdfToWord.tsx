import GenericToolPage from '@/components/GenericToolPage';
import { FileText } from 'lucide-react';

const PdfToWord = () => (
  <GenericToolPage
    title="PDF en Word"
    description="Convertissez vos fichiers PDF en documents Word modifiables"
    icon={FileText}
    color="cyan"
  />
);

export default PdfToWord;
