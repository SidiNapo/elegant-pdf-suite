import GenericToolPage from '@/components/GenericToolPage';
import { FileType } from 'lucide-react';

const PdfToPdfa = () => (
  <GenericToolPage
    title="PDF en PDF/A"
    description="Convertissez vos PDF en format d'archivage PDF/A"
    icon={FileType}
    color="violet"
  />
);

export default PdfToPdfa;
