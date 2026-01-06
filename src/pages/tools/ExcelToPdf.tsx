import GenericToolPage from '@/components/GenericToolPage';
import { Table } from 'lucide-react';

const ExcelToPdf = () => (
  <GenericToolPage
    title="Excel en PDF"
    description="Convertissez vos feuilles de calcul Excel en PDF"
    icon={Table}
    color="coral"
  />
);

export default ExcelToPdf;
