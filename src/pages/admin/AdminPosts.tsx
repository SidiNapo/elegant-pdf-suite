import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, Eye, Edit, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAllPosts, useDeletePost } from '@/hooks/useBlogPosts';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { adminRoutes } from '@/config/adminRoutes';
const AdminPosts = React.forwardRef<HTMLDivElement>((_, ref) => {
  const { data: posts, isLoading } = useAllPosts();
  const deletePost = useDeletePost();
  const [search, setSearch] = useState('');

  const filteredPosts = posts?.filter((post) =>
    post.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    try {
      await deletePost.mutateAsync(id);
      toast.success('Article supprimé');
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  return (
    <AdminLayout title="Articles">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un article..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Link to={adminRoutes.postsNew}>
          <Button className="btn-primary gap-2 w-full sm:w-auto">
            <Plus className="w-4 h-4" />
            Nouvel article
          </Button>
        </Link>
      </div>

      {/* Posts List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredPosts && filteredPosts.length > 0 ? (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Titre
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">
                    Catégorie
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">
                    Vues
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Statut
                  </th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map((post, index) => (
                  <motion.tr
                    key={post.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    <td className="p-4">
                      <div>
                        <p className="font-medium truncate max-w-xs">{post.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(post.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {post.category?.name || '-'}
                      </span>
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Eye className="w-4 h-4" />
                        {post.views_count}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          post.is_published
                            ? 'bg-green-500/10 text-green-500'
                            : 'bg-yellow-500/10 text-yellow-500'
                        }`}
                      >
                        {post.is_published ? 'Publié' : 'Brouillon'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        {post.is_published && (
                          <Link
                            to={`/blog/${post.slug}`}
                            target="_blank"
                            className="p-2 rounded-lg hover:bg-muted transition-colors"
                          >
                            <Eye className="w-4 h-4 text-muted-foreground" />
                          </Link>
                        )}
                        <Link
                          to={adminRoutes.postsEdit(post.id)}
                          className="p-2 rounded-lg hover:bg-muted transition-colors"
                        >
                          <Edit className="w-4 h-4 text-muted-foreground" />
                        </Link>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button className="p-2 rounded-lg hover:bg-destructive/10 transition-colors">
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer l'article?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette action est irréversible. L'article "{post.title}" sera définitivement supprimé.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(post.id)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 glass-card rounded-2xl"
        >
          <p className="text-muted-foreground mb-4">Aucun article trouvé</p>
          <Link to={adminRoutes.postsNew}>
            <Button className="btn-primary gap-2">
              <Plus className="w-4 h-4" />
              Créer votre premier article
            </Button>
          </Link>
        </motion.div>
      )}
    </AdminLayout>
  );
});

AdminPosts.displayName = 'AdminPosts';

export default AdminPosts;
