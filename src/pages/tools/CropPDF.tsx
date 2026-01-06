import GenericToolPage from '@/components/GenericToolPage';
import { Crop } from 'lucide-react';

const CropPDF = () => (
  <GenericToolPage
    title="Rogner PDF"
    description="Recadrez les pages de votre PDF"
    icon={Crop}
    color="violet"
  />
);

export default CropPDF;
