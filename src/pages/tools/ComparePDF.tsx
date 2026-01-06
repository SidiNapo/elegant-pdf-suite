import GenericToolPage from '@/components/GenericToolPage';
import { GitCompare } from 'lucide-react';

const ComparePDF = () => (
  <GenericToolPage
    title="Comparer PDF"
    description="Comparez deux fichiers PDF pour identifier les différences"
    icon={GitCompare}
    color="coral"
  />
);

export default ComparePDF;
