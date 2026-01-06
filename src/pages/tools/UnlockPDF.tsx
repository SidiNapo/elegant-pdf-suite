import GenericToolPage from '@/components/GenericToolPage';
import { Unlock } from 'lucide-react';

const UnlockPDF = () => (
  <GenericToolPage
    title="Déverrouiller PDF"
    description="Supprimez le mot de passe de protection de votre PDF"
    icon={Unlock}
    color="coral"
  />
);

export default UnlockPDF;
