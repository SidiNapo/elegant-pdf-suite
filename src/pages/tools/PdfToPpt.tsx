import GenericToolPage from '@/components/GenericToolPage';
import { Presentation } from 'lucide-react';

const PdfToPpt = () => (
  <GenericToolPage
    title="PDF en PowerPoint"
    description="Convertissez vos fichiers PDF en présentations PowerPoint"
    icon={Presentation}
    color="coral"
  />
);

export default PdfToPpt;
