import GenericToolPage from '@/components/GenericToolPage';
import { PenTool } from 'lucide-react';

const SignPDF = () => (
  <GenericToolPage
    title="Signer PDF"
    description="Ajoutez votre signature électronique à vos documents PDF"
    icon={PenTool}
    color="violet"
  />
);

export default SignPDF;
