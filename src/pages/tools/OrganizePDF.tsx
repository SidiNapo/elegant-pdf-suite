import GenericToolPage from '@/components/GenericToolPage';
import { LayoutGrid } from 'lucide-react';

const OrganizePDF = () => (
  <GenericToolPage
    title="Organiser PDF"
    description="Réorganisez les pages de votre PDF par glisser-déposer"
    icon={LayoutGrid}
    color="coral"
  />
);

export default OrganizePDF;
