import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, LayoutDashboard, FileEdit, LogOut, Plus, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { adminRoutes } from '@/config/adminRoutes';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

const AdminLayout = React.forwardRef<HTMLDivElement, AdminLayoutProps>(
  ({ children, title }, ref) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { signOut } = useAuth();

    const handleSignOut = async () => {
      await signOut();
      toast.success('Déconnexion réussie');
      navigate(adminRoutes.login);
    };

    const navItems = [
      { name: 'Dashboard', href: adminRoutes.dashboard, icon: LayoutDashboard },
      { name: 'Articles', href: adminRoutes.posts, icon: FileEdit },
      { name: 'Catégories', href: adminRoutes.categories, icon: FolderOpen },
    ];

    return (
      <div ref={ref} className="min-h-screen bg-background flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-border p-4 flex flex-col">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 mb-8 px-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold gradient-text">E-Pdf's</span>
          </Link>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Quick Action */}
          <Link to={adminRoutes.postsNew} className="mb-4">
            <Button className="w-full btn-primary gap-2">
              <Plus className="w-4 h-4" />
              Nouvel article
            </Button>
          </Link>

          {/* Sign Out */}
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-5 h-5" />
            Déconnexion
          </Button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-3xl font-bold mb-8">{title}</h1>
              {children}
            </motion.div>
          </div>
        </main>
      </div>
    );
  }
);

AdminLayout.displayName = 'AdminLayout';

export default AdminLayout;
