import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2, ShieldX } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { adminRoutes } from '@/config/adminRoutes';
interface AdminGuardProps {
  children: ReactNode;
}

const AdminGuard = ({ children }: AdminGuardProps) => {
  const { user, isAdmin, loading, adminChecked, signOut } = useAuth();

  // Show loading while auth state is being determined
  if (loading || !adminChecked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to={adminRoutes.login} replace />;
  }

  // Show not authorized if user is not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6 p-8">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <ShieldX className="w-8 h-8 text-destructive" />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2">Accès non autorisé</h1>
            <p className="text-muted-foreground">
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            </p>
          </div>
          <Button onClick={() => signOut()} variant="outline">
            Se déconnecter
          </Button>
        </div>
      </div>
    );
  }

  // User is authenticated and is admin
  return <>{children}</>;
};

export default AdminGuard;
