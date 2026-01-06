import GenericToolPage from '@/components/GenericToolPage';
import { EyeOff } from 'lucide-react';

const RedactPDF = () => (
  <GenericToolPage
    title="Censurer PDF"
    description="Masquez définitivement le contenu sensible de votre PDF"
    icon={EyeOff}
    color="cyan"
  />
);

export default RedactPDF;
