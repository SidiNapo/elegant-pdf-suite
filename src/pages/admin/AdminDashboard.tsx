import { motion } from 'framer-motion';
import { FileText, Eye, TrendingUp, Clock } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAllPosts } from '@/hooks/useBlogPosts';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { data: posts, isLoading } = useAllPosts();

  const stats = {
    totalPosts: posts?.length || 0,
    publishedPosts: posts?.filter((p) => p.is_published).length || 0,
    draftPosts: posts?.filter((p) => !p.is_published).length || 0,
    totalViews: posts?.reduce((acc, p) => acc + p.views_count, 0) || 0,
  };

  const recentPosts = posts?.slice(0, 5) || [];

  const statCards = [
    { 
      label: 'Total articles', 
      value: stats.totalPosts, 
      icon: FileText, 
      color: 'text-primary' 
    },
    { 
      label: 'Publiés', 
      value: stats.publishedPosts, 
      icon: TrendingUp, 
      color: 'text-green-500' 
    },
    { 
      label: 'Brouillons', 
      value: stats.draftPosts, 
      icon: Clock, 
      color: 'text-yellow-500' 
    },
    { 
      label: 'Vues totales', 
      value: stats.totalViews, 
      icon: Eye, 
      color: 'text-blue-500' 
    },
  ];

  return (
    <AdminLayout title="Dashboard">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
            <p className="text-3xl font-bold mb-1">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Posts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Articles récents</h2>
          <Link
            to="/admin/posts"
            className="text-sm text-primary hover:underline"
          >
            Voir tout
          </Link>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Chargement...
          </div>
        ) : recentPosts.length > 0 ? (
          <div className="space-y-4">
            {recentPosts.map((post) => (
              <Link
                key={post.id}
                to={`/admin/posts/${post.id}/edit`}
                className="flex items-center justify-between p-4 rounded-xl hover:bg-muted transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{post.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(post.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Eye className="w-4 h-4" />
                    {post.views_count}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      post.is_published
                        ? 'bg-green-500/10 text-green-500'
                        : 'bg-yellow-500/10 text-yellow-500'
                    }`}
                  >
                    {post.is_published ? 'Publié' : 'Brouillon'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Aucun article pour le moment
          </div>
        )}
      </motion.div>
    </AdminLayout>
  );
};

export default AdminDashboard;
