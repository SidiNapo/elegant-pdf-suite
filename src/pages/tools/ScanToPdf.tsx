import GenericToolPage from '@/components/GenericToolPage';
import { ScanLine } from 'lucide-react';

const ScanToPdf = () => (
  <GenericToolPage
    title="Numériser au format PDF"
    description="Convertissez vos images numérisées en PDF"
    icon={ScanLine}
    color="rose"
  />
);

export default ScanToPdf;
