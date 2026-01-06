import GenericToolPage from '@/components/GenericToolPage';
import { Presentation } from 'lucide-react';

const PptToPdf = () => (
  <GenericToolPage
    title="PowerPoint en PDF"
    description="Convertissez vos présentations PowerPoint en PDF"
    icon={Presentation}
    color="cyan"
  />
);

export default PptToPdf;
