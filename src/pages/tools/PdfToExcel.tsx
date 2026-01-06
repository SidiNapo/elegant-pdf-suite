import GenericToolPage from '@/components/GenericToolPage';
import { Table } from 'lucide-react';

const PdfToExcel = () => (
  <GenericToolPage
    title="PDF en Excel"
    description="Convertissez vos fichiers PDF en feuilles de calcul Excel"
    icon={Table}
    color="rose"
  />
);

export default PdfToExcel;
