import GenericToolPage from '@/components/GenericToolPage';
import { Globe } from 'lucide-react';

const HtmlToPdf = () => (
  <GenericToolPage
    title="HTML en PDF"
    description="Convertissez des pages web HTML en PDF"
    icon={Globe}
    color="rose"
  />
);

export default HtmlToPdf;
