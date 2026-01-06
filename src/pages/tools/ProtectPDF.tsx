import GenericToolPage from '@/components/GenericToolPage';
import { Lock } from 'lucide-react';

const ProtectPDF = () => (
  <GenericToolPage
    title="Protéger PDF"
    description="Ajoutez un mot de passe pour protéger votre PDF"
    icon={Lock}
    color="rose"
  />
);

export default ProtectPDF;
