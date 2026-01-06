import GenericToolPage from '@/components/GenericToolPage';
import { FileSearch } from 'lucide-react';

const OcrPDF = () => (
  <GenericToolPage
    title="OCR PDF"
    description="Rendez vos PDF consultables et modifiables avec la reconnaissance de texte"
    icon={FileSearch}
    color="coral"
  />
);

export default OcrPDF;
