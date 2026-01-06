import GenericToolPage from '@/components/GenericToolPage';
import { Edit } from 'lucide-react';

const EditPDF = () => (
  <GenericToolPage
    title="Modifier PDF"
    description="Modifiez le texte et les images de votre PDF"
    icon={Edit}
    color="cyan"
  />
);

export default EditPDF;
