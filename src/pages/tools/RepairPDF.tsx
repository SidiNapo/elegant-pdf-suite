import GenericToolPage from '@/components/GenericToolPage';
import { Wrench } from 'lucide-react';

const RepairPDF = () => (
  <GenericToolPage
    title="Réparer PDF"
    description="Réparez les fichiers PDF corrompus"
    icon={Wrench}
    color="cyan"
  />
);

export default RepairPDF;
