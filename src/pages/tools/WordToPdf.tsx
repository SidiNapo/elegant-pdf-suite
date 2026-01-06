import GenericToolPage from '@/components/GenericToolPage';
import { FileText } from 'lucide-react';

const WordToPdf = () => (
  <GenericToolPage
    title="Word en PDF"
    description="Convertissez vos documents Word en PDF"
    icon={FileText}
    color="violet"
  />
);

export default WordToPdf;
